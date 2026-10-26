import React, { useState, useEffect, useCallback } from 'react';
import { AppRole, Bus, Route, Alert, AlertType } from './types';
import { MOCK_BUSES, MOCK_ROUTES, MOCK_ALERTS } from './data/mockData';
import { useSocket } from './hooks/useSocket';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { SOSModal } from './components/common/SOSModal';
import { AboutModal } from './components/common/AboutModal';
import { StudentView } from './components/student/StudentView';
import { DriverConsole } from './components/driver/DriverConsole';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { GPSReading } from './hooks/useDriverGPS';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<AppRole>('student');
  const [buses, setBuses] = useState<Bus[]>(MOCK_BUSES);
  const [routes, setRoutes] = useState<Route[]>(MOCK_ROUTES);
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [isSOSOpen, setIsSOSOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [geofencePushAlert, setGeofencePushAlert] = useState<string | null>(null);

  const { socket, isConnected, emit, on } = useSocket();

  // Initial Fetch from REST Backend if available
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [busRes, routeRes, alertRes] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/buses`).then(r => r.json()),
          fetch(`${API_BASE_URL}/routes`).then(r => r.json()),
          fetch(`${API_BASE_URL}/alerts`).then(r => r.json()),
        ]);

        if (
          busRes.status === 'fulfilled' &&
          busRes.value.success &&
          Array.isArray(busRes.value.data) &&
          busRes.value.data.length > 0
        ) {
          setBuses(busRes.value.data);
        }
        if (
          routeRes.status === 'fulfilled' &&
          routeRes.value.success &&
          Array.isArray(routeRes.value.data) &&
          routeRes.value.data.length > 0 &&
          routeRes.value.data.every((route: Route) => Array.isArray(route.stops))
        ) {
          setRoutes(routeRes.value.data);
        }
        if (
          alertRes.status === 'fulfilled' &&
          alertRes.value.success &&
          Array.isArray(alertRes.value.data) &&
          alertRes.value.data.length > 0
        ) {
          setAlerts(alertRes.value.data);
        }
      } catch (err) {
        console.info('[Client API] Backend unreachable; operating in standalone offline simulator mode.');
      }
    };

    fetchInitialData();
  }, []);

  // WebSocket Subscription to Channels based on Role
  useEffect(() => {
    if (!isConnected || !socket) return;

    if (currentRole === 'student') {
      emit('join_bus', { busId: buses[0]?.id || 'BUS-01' });
    } else if (currentRole === 'admin') {
      emit('join_admin');
    }

    // Listen for live bus telemetry
    const unsubBusTelemetry = on('bus_telemetry_update', (data: { bus: Bus }) => {
      setBuses(prev => prev.map(b => (b.id === data.bus.id ? { ...b, ...data.bus } : b)));
    });

    // Listen for fleet global updates
    const unsubFleetTelemetry = on('fleet_telemetry_update', (data: any) => {
      setBuses(prev =>
        prev.map(b =>
          b.id === data.busId
            ? {
                ...b,
                currentLocation: data.location || b.currentLocation,
                status: data.status || b.status,
                currentStopIndex: data.currentStopIndex ?? b.currentStopIndex,
                isSOS: data.isSOS ?? b.isSOS
              }
            : b
        )
      );
    });

    // Listen for Geofence Approach Alerts
    const unsubGeofence = on('geofence_approach', (data: any) => {
      setGeofencePushAlert(data.message);
      setTimeout(() => setGeofencePushAlert(null), 12000);
    });

    // Listen for New Incidents
    const unsubAlert = on('new_alert', (newAlert: Alert) => {
      setAlerts(prev => [newAlert, ...prev]);
    });

    // Listen for Resolved Incidents
    const unsubResolved = on('alert_resolved', ({ alertId }: { alertId: string }) => {
      setAlerts(prev =>
        prev.map(a => (a.id === alertId ? { ...a, status: 'RESOLVED' } : a))
      );
    });

    return () => {
      unsubBusTelemetry();
      unsubFleetTelemetry();
      unsubGeofence();
      unsubAlert();
      unsubResolved();
    };
  }, [isConnected, socket, currentRole, buses, emit, on]);

  // Handler: Driver transmits GPS telemetry
  const handleTransmitTelemetry = useCallback(
    (reading: GPSReading, busId: string, currentStopIndex: number) => {
      // 1. Emit via socket to server
      emit('driver_telemetry', {
        busId,
        lat: reading.lat,
        lng: reading.lng,
        speed: reading.speed,
        heading: reading.heading,
        accuracy: reading.accuracy,
        currentStopIndex
      });

      // 2. Optimistic local state update
      setBuses(prev =>
        prev.map(b =>
          b.id === busId
            ? {
                ...b,
                currentLocation: {
                  lat: reading.lat,
                  lng: reading.lng,
                  speed: reading.speed,
                  heading: reading.heading,
                  lastUpdated: new Date().toISOString()
                }
              }
            : b
        )
      );
    },
    [emit]
  );

  // Handler: Driver or Admin dispatches Incident
  const handleDispatchIncident = useCallback(
    (busId: string, type: AlertType, message: string) => {
      const targetBus = buses.find(b => b.id === busId) || buses[0];
      const newAlert: Alert = {
        id: `ALT-${Date.now().toString().slice(-6)}`,
        busId,
        busNumber: targetBus.busNumber,
        type,
        severity: type === 'SOS' ? 'CRITICAL' : 'MEDIUM',
        message,
        location: { lat: targetBus.currentLocation.lat, lng: targetBus.currentLocation.lng },
        status: 'ACTIVE',
        reportedBy: currentRole === 'driver' ? 'DRIVER' : 'STUDENT',
        timestamp: new Date().toISOString()
      };

      // Emit to server
      emit('dispatch_incident', newAlert);

      // Optimistic local update
      setAlerts(prev => [newAlert, ...prev]);

      if (type === 'SOS') {
        setBuses(prev =>
          prev.map(b => (b.id === busId ? { ...b, isSOS: true, status: 'DELAYED' } : b))
        );
      } else if (type === 'TRAFFIC_JAM') {
        setBuses(prev =>
          prev.map(b => (b.id === busId ? { ...b, status: 'DELAYED' } : b))
        );
      }
    },
    [buses, currentRole, emit]
  );

  // Handler: Advance / Skip Stop in Driver Checklist
  const handleUpdateStopProgress = useCallback(
    (busId: string, stopIndex: number, action: 'REACHED' | 'SKIPPED') => {
      emit('update_stop_progress', { busId, stopIndex, action });

      setBuses(prev =>
        prev.map(b =>
          b.id === busId
            ? { ...b, currentStopIndex: Math.min(stopIndex + 1, 10) }
            : b
        )
      );
    },
    [emit]
  );

  // Handler: Update Trip Status (Start, Pause, End)
  const handleUpdateTripStatus = useCallback(
    (busId: string, status: any) => {
      emit('driver_telemetry', {
        busId,
        lat: buses.find(b => b.id === busId)?.currentLocation.lat || 21.1458,
        lng: buses.find(b => b.id === busId)?.currentLocation.lng || 79.0882,
        speed: status === 'EN_ROUTE' ? 30 : 0,
        heading: 0,
        tripStatus: status
      });

      setBuses(prev =>
        prev.map(b => (b.id === busId ? { ...b, status } : b))
      );
    },
    [buses, emit]
  );

  // Handler: Admin resolves alert
  const handleResolveAlert = useCallback(
    (alertId: string) => {
      emit('resolve_alert', { alertId });

      setAlerts(prev =>
        prev.map(a =>
          a.id === alertId ? { ...a, status: 'RESOLVED', resolvedAt: new Date().toISOString() } : a
        )
      );

      // If resolving SOS alert, clear bus SOS flag
      const targetAlert = alerts.find(a => a.id === alertId);
      if (targetAlert && targetAlert.type === 'SOS') {
        setBuses(prev =>
          prev.map(b => (b.id === targetAlert.busId ? { ...b, isSOS: false, status: 'EN_ROUTE' } : b))
        );
      }
    },
    [alerts, emit]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Navbar with College Identity & Role Switcher */}
      <Header
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        isConnected={isConnected}
        onOpenSOS={() => setIsSOSOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        activeAlertCount={alerts.filter(a => a.status === 'ACTIVE').length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentRole === 'student' && (
          <StudentView
            routes={routes}
            buses={buses}
            activeAlerts={alerts}
            onOpenSOS={() => setIsSOSOpen(true)}
            onOpenAbout={() => setIsAboutOpen(true)}
            geofencePushAlert={geofencePushAlert}
          />
        )}

        {currentRole === 'driver' && (
          <DriverConsole
            buses={buses}
            routes={routes}
            onTransmitTelemetry={handleTransmitTelemetry}
            onDispatchAlert={handleDispatchIncident}
            onUpdateStopProgress={handleUpdateStopProgress}
            onUpdateTripStatus={handleUpdateTripStatus}
          />
        )}

        {currentRole === 'admin' && (
          <AdminDashboard
            buses={buses}
            routes={routes}
            alerts={alerts}
            onResolveAlert={handleResolveAlert}
          />
        )}
      </main>

      {/* Academic Attribution Footer */}
      <Footer />

      {/* Emergency SOS Modal */}
      <SOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        activeBus={buses[0] || null}
        onDispatchSOS={(reason) => handleDispatchIncident(buses[0]?.id || 'BUS-01', 'SOS', reason)}
      />

      {/* Project & Group G6 Academic About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

    </div>
  );
};

export default App;
