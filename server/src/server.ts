import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { config } from './config/config';
import { connectDB } from './config/db';
import busRoutes from './routes/busRoutes';
import routeRoutes from './routes/routeRoutes';
import alertRoutes from './routes/alertRoutes';
import { registerSocketHandlers } from './sockets/socketHandler';
import authRoutes from './routes/authRoutes';
import { UserModel } from './models/User';
import { BusModel, inMemoryBuses } from './models/Bus';
import { RouteModel, inMemoryRoutes } from './models/Route';
import { hashPassword, readSessionToken } from './services/authService';
import { isMongoConnected } from './config/db';

const app = express();
const server = http.createServer(app);

// Enable Cross-Origin Resource Sharing
app.use(
  cors({
    origin: config.clientUrl.split(',').map(origin => origin.trim()),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);

// Socket.io uses the same explicit client origins and credentials as the REST API.
const io = new SocketIOServer(server, {
  cors: {
    origin: config.clientUrl.split(',').map(origin => origin.trim()),
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 20000,
  pingInterval: 10000
});

// REST API Endpoints
app.use('/api/buses', busRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/alerts', alertRoutes);

// Health check & academic system info endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    system: 'Smart College Bus-Tracking & Safety System Using Real-Time GPS Tracking and ETA Prediction',
    institution: 'Department of Computer Science and Engineering, Jhulelal Institute of Technology, Nagpur',
    affiliation: 'Rashtrasant Tukadoji Maharaj Nagpur University (RTMNU)',
    academicSession: '2026–27',
    projectGroup: 'Group G6 - III Semester B.Tech CSE',
    timestamp: new Date().toISOString()
  });
});

// Serve compiled client production build if available
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req: Request, res: Response) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    }
  });
}

// Wire up WebSocket handlers
registerSocketHandlers(io);

io.use((socket, next) => {
  const cookieHeader = socket.handshake.headers.cookie || '';
  const token = cookieHeader
    .split(';')
    .map(cookie => cookie.trim())
    .find(cookie => cookie.startsWith('bus_tracker_session='))
    ?.slice('bus_tracker_session='.length);
  const user = token ? readSessionToken(token) : null;
  if (!user) {
    next(new Error('Authentication required'));
    return;
  }
  socket.data.user = user;
  next();
});

// Start server after connecting to database / fallback store
const startServer = async () => {
  if (!config.authSecret || (config.nodeEnv === 'production' && config.authSecret.length < 32)) {
    throw new Error('Set AUTH_SECRET to a random value of at least 32 characters in production.');
  }
  if (Boolean(config.adminEmail) !== Boolean(config.adminPassword)) {
    throw new Error('Set both ADMIN_EMAIL and ADMIN_PASSWORD to bootstrap the first admin account.');
  }
  if (
    config.adminPassword &&
    (config.adminPassword.length < 12 || config.adminPassword.length > 128)
  ) {
    throw new Error('ADMIN_PASSWORD must be between 12 and 128 characters.');
  }
  if (config.adminEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.adminEmail.trim())) {
    throw new Error('ADMIN_EMAIL must be a valid email address.');
  }

  await connectDB();
  if (isMongoConnected) {
    const [busCount, routeCount] = await Promise.all([
      BusModel.countDocuments(),
      RouteModel.countDocuments()
    ]);
    if (busCount === 0 && routeCount === 0) {
      const routeSeeds = Array.from(inMemoryRoutes.values());
      const routeDocuments = await RouteModel.create(
        routeSeeds.map(({ id: _id, ...route }) => ({ ...route, assignedBusId: undefined }))
      );
      const routeIds = new Map(routeDocuments.map((route, index) => [routeSeeds[index].id, route.id]));
      const busSeeds = Array.from(inMemoryBuses.values());
      const busDocuments = await BusModel.create(
        busSeeds.map(({ id: _id, ...bus }) => ({
          ...bus,
          routeId: routeIds.get(bus.routeId) || bus.routeId
        }))
      );
      const busIds = new Map(busDocuments.map((bus, index) => [busSeeds[index].id, bus.id]));
      await Promise.all(routeDocuments.map((route, index) => {
        const assignedBusId = busIds.get(routeSeeds[index].assignedBusId || '');
        return assignedBusId
          ? route.updateOne({ assignedBusId })
          : Promise.resolve();
      }));
      console.info('[Database] Seeded the default routes for the new database.');
    } else if (busCount === 0 || routeCount === 0) {
      console.warn('[Database] Fleet or routes collection is empty; configure route and bus records before using assigned accounts.');
    }
  }

  if (config.adminEmail && config.adminPassword) {
    if (!isMongoConnected) {
      throw new Error('MongoDB is required to create the configured initial admin account.');
    }
    const existingAdmin = await UserModel.findOne({ role: 'admin' });
    if (!existingAdmin) {
      const email = config.adminEmail.trim().toLowerCase();
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        throw new Error('ADMIN_EMAIL is already registered with a non-admin account.');
      }
      await UserModel.create({
        name: config.adminName,
        email,
        role: 'admin',
        passwordHash: await hashPassword(config.adminPassword)
      });
      console.info(`[Auth] Initial administrator account created for ${email}.`);
    }
  } else {
    console.warn('[Auth] No ADMIN_EMAIL/ADMIN_PASSWORD configured; create the first admin by setting both environment variables and restarting.');
  }

  server.listen(config.port, '0.0.0.0', () => {
    console.log('================================================================');
    console.log(' SMART COLLEGE BUS-TRACKING & SAFETY SYSTEM (JIT NAGPUR - G6)   ');
    console.log('================================================================');
    console.log(` Web Application & APIs listening on: http://localhost:${config.port}`);
    console.log(` WebSocket Real-Time Telemetry running on ws://localhost:${config.port}`);
    console.log(` Health & Meta: http://localhost:${config.port}/api/health`);
    console.log('================================================================');
  });
};

startServer().catch(err => {
  console.error('[Server Startup Error]:', err);
  process.exit(1);
});

export { app, server, io };
