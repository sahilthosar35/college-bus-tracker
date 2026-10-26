import { Server, Socket } from 'socket.io';
import { BusRepository } from '../models/Bus';
import { RouteRepository } from '../models/Route';
import { TelemetryRepository } from '../models/Telemetry';
import { AlertRepository } from '../models/Alert';
import { ETAService } from '../services/etaService';
import { GeofenceService } from '../services/geofenceService';

export const registerSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    // Student / Parent joins specific bus channel
    socket.on('join_bus', async ({ busId }: { busId: string }) => {
      try {
        const roomName = `bus_${busId}`;
        socket.join(roomName);
        console.log(`[WebSocket] Socket ${socket.id} joined room ${roomName}`);

        // Send immediate current state
        const bus = await BusRepository.getById(busId);
        if (bus) {
          const route = await RouteRepository.getById(bus.routeId);
          let etas: any[] = [];
          if (route) {
            etas = route.stops.map(stop =>
              ETAService.calculateDynamicETA(
                bus.currentLocation.lat,
                bus.currentLocation.lng,
                bus.currentLocation.speed,
                stop,
                route.stops,
                bus.currentStopIndex,
                bus.status === 'DELAYED',
                bus.status === 'PAUSED'
              )
            );
          }
          socket.emit('bus_initial_state', { bus, route, etas });
        }
      } catch (err) {
        console.error(`[WebSocket] Error in join_bus:`, err);
      }
    });

    socket.on('leave_bus', ({ busId }: { busId: string }) => {
      const roomName = `bus_${busId}`;
      socket.leave(roomName);
      console.log(`[WebSocket] Socket ${socket.id} left room ${roomName}`);
    });

    // Transport Admin joins fleet manager channel
    socket.on('join_admin', async () => {
      try {
        socket.join('admin_fleet');
        console.log(`[WebSocket] Admin console joined 'admin_fleet': ${socket.id}`);

        const [buses, alerts] = await Promise.all([
          BusRepository.getAll(),
          AlertRepository.getAll()
        ]);

        socket.emit('admin_initial_state', { buses, alerts });
      } catch (err) {
        console.error(`[WebSocket] Error in join_admin:`, err);
      }
    });

    // Driver transmits live GPS telemetry
    socket.on('driver_telemetry', async (data: {
      busId: string;
      lat: number;
      lng: number;
      speed: number;
      heading: number;
      accuracy?: number;
      currentStopIndex?: number;
      tripStatus?: any;
    }) => {
      try {
        const { busId, lat, lng, speed, heading, accuracy, currentStopIndex, tripStatus } = data;

        // 1. Update Bus in repository
        const updatedBus = await BusRepository.updateLocation(
          busId,
          { lat, lng, speed, heading, lastUpdated: new Date().toISOString() },
          currentStopIndex,
          tripStatus
        );

        if (!updatedBus) return;

        // 2. Log high-frequency telemetry record
        await TelemetryRepository.logTelemetry({
          busId,
          lat,
          lng,
          speed,
          heading,
          accuracy,
          currentStopIndex: updatedBus.currentStopIndex,
          timestamp: new Date().toISOString()
        });

        // 3. Compute dynamic ETAs for upcoming stops
        const route = await RouteRepository.getById(updatedBus.routeId);
        let etas: any[] = [];
        if (route) {
          etas = route.stops.map(stop =>
            ETAService.calculateDynamicETA(
              lat,
              lng,
              speed,
              stop,
              route.stops,
              updatedBus.currentStopIndex,
              updatedBus.status === 'DELAYED',
              updatedBus.status === 'PAUSED'
            )
          );

          // 4. Geofence approach trigger check (1 km proximity)
          const proximityResult = GeofenceService.checkProximity(
            updatedBus.id,
            updatedBus.busNumber,
            lat,
            lng,
            route.stops
          );

          if (proximityResult.hasTriggered) {
            io.to(`bus_${busId}`).emit('geofence_approach', {
              busId: updatedBus.id,
              busNumber: updatedBus.busNumber,
              stop: proximityResult.stop,
              distanceKm: proximityResult.distanceKm,
              message: proximityResult.message,
              timestamp: new Date().toISOString()
            });

            io.to('admin_fleet').emit('new_alert', {
              id: `GEOFENCE-${Date.now()}`,
              busId: updatedBus.id,
              busNumber: updatedBus.busNumber,
              type: 'GEOFENCE_APPROACH',
              severity: 'LOW',
              message: proximityResult.message,
              location: { lat, lng },
              status: 'ACTIVE',
              timestamp: new Date().toISOString()
            });
          }
        }

        // 5. Broadcast to student/parent room
        io.to(`bus_${busId}`).emit('bus_telemetry_update', {
          bus: updatedBus,
          etas,
          timestamp: new Date().toISOString()
        });

        // 6. Broadcast to admin fleet room
        io.to('admin_fleet').emit('fleet_telemetry_update', {
          busId: updatedBus.id,
          location: updatedBus.currentLocation,
          status: updatedBus.status,
          currentStopIndex: updatedBus.currentStopIndex,
          isSOS: updatedBus.isSOS
        });
      } catch (err) {
        console.error(`[WebSocket] Error processing driver_telemetry:`, err);
      }
    });

    // Driver or Student Incident / SOS dispatch
    socket.on('dispatch_incident', async (incidentData: {
      busId: string;
      busNumber: string;
      type: any;
      severity: any;
      message: string;
      location: { lat: number; lng: number };
      reportedBy: any;
    }) => {
      try {
        const isSOS = incidentData.type === 'SOS';
        const newAlert = await AlertRepository.createAlert({
          busId: incidentData.busId,
          busNumber: incidentData.busNumber,
          type: incidentData.type,
          severity: incidentData.severity || (isSOS ? 'CRITICAL' : 'MEDIUM'),
          message: incidentData.message,
          location: incidentData.location,
          status: 'ACTIVE',
          reportedBy: incidentData.reportedBy || 'DRIVER'
        });

        if (isSOS) {
          await BusRepository.updateStatus(incidentData.busId, 'DELAYED', true);
        } else if (incidentData.type === 'TRAFFIC_JAM') {
          await BusRepository.updateStatus(incidentData.busId, 'DELAYED', false);
        } else if (incidentData.type === 'BREAKDOWN') {
          await BusRepository.updateStatus(incidentData.busId, 'MAINTENANCE', false);
        }

        // Broadcast to all clients and admin
        io.emit('new_alert', newAlert);
        io.to(`bus_${incidentData.busId}`).emit('bus_incident_alert', newAlert);

        const updatedBus = await BusRepository.getById(incidentData.busId);
        if (updatedBus) {
          io.to('admin_fleet').emit('fleet_telemetry_update', {
            busId: updatedBus.id,
            location: updatedBus.currentLocation,
            status: updatedBus.status,
            currentStopIndex: updatedBus.currentStopIndex,
            isSOS: updatedBus.isSOS
          });
        }
      } catch (err) {
        console.error(`[WebSocket] Error dispatching incident:`, err);
      }
    });

    // Admin resolves incident
    socket.on('resolve_alert', async ({ alertId }: { alertId: string }) => {
      try {
        const resolved = await AlertRepository.resolveAlert(alertId);
        if (resolved) {
          io.emit('alert_resolved', { alertId, resolvedAt: resolved.resolvedAt });
          const bus = await BusRepository.getById(resolved.busId);
          if (bus && bus.isSOS) {
            await BusRepository.updateStatus(bus.id, 'EN_ROUTE', false);
            io.to('admin_fleet').emit('fleet_telemetry_update', {
              busId: bus.id,
              location: bus.currentLocation,
              status: 'EN_ROUTE',
              currentStopIndex: bus.currentStopIndex,
              isSOS: false
            });
          }
        }
      } catch (err) {
        console.error(`[WebSocket] Error resolving alert:`, err);
      }
    });

    // Driver Stop Advance / Skip
    socket.on('update_stop_progress', async ({
      busId,
      stopIndex,
      action
    }: {
      busId: string;
      stopIndex: number;
      action: 'REACHED' | 'SKIPPED';
    }) => {
      try {
        const bus = await BusRepository.getById(busId);
        if (!bus) return;

        const updatedBus = await BusRepository.updateLocation(
          busId,
          bus.currentLocation,
          stopIndex + 1
        );

        if (updatedBus) {
          io.to(`bus_${busId}`).emit('stop_progress_updated', {
            busId,
            currentStopIndex: updatedBus.currentStopIndex,
            lastAction: action,
            stopIndex
          });

          io.to('admin_fleet').emit('fleet_telemetry_update', {
            busId: updatedBus.id,
            location: updatedBus.currentLocation,
            status: updatedBus.status,
            currentStopIndex: updatedBus.currentStopIndex,
            isSOS: updatedBus.isSOS
          });
        }
      } catch (err) {
        console.error(`[WebSocket] Error updating stop progress:`, err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
    });
  });
};
