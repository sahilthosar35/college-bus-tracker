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

// Socket.io initialization with open CORS for cross-device mobile testing
const io = new SocketIOServer(server, {
  cors: {
    origin: config.clientUrl.split(',').map(origin => origin.trim()),
    methods: ['GET', 'POST']
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
    projectGuide: 'Ms. Shubhangi Nagpure',
    teamMembers: [
      { name: 'Muskan Khiyaldasani', rollNo: 'H-21' },
      { name: 'Narayani Kohale', rollNo: 'H-22' },
      { name: 'Palaash Belekar', rollNo: 'H-26' },
      { name: 'Rajlaxmi Lokhande', rollNo: 'H-48' },
      { name: 'Sahil Thosar', rollNo: 'H-62' },
      { name: 'Krutika Dhage', rollNo: 'H-02' }
    ],
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

// Start server after connecting to database / fallback store
const startServer = async () => {
  await connectDB();

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
