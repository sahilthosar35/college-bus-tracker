import React, { useState, useEffect, useCallback } from 'react';
import { AppRole, AuthUser, Bus, Route, Alert, AlertType } from './types';
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
import { LoginPage } from './components/common/LoginPage';
import { ChangePasswordModal } from './components/common/ChangePasswordModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const App: React.FC = () => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [socketAuthorizationError, setSocketAuthorizationError] = useState<string | null>(null);
  const currentRole: AppRole = authUser?.role || 'student';
  const [buses, setBuses] = useState<Bus[]>(MOCK_BUSES);
  const [routes, setRoutes] = useState<Route[]>(MOCK_ROUTES);
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [isSOSOpen, setIsSOSOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState<boolean>(false);
  const [geofencePushAlert, setGeofencePushAlert] = useState<string | null>(null);

  const { socket, isConnected, emit, on } = useSocket(Boolean(authUser));

  useEffect(() => {
    fetch(`${API_BASE_URL}/auth/me`, { credentials: 'include' })
      .then(async response => {
        if (!response.ok) return null;
        const result = await response.json();
        return result.data.user as AuthUser;
      })
      .then(user => {
        setAuthUser(user);
        setIsLoadingData(Boolean(user));
      })
      .catch(() => setAuthUser(null))
      .finally(() => setIsCheckingSession(false));
  }, []);

  // Initial Fetch from REST Backend if available
  useEffect(() => {
    if (!authUser) return;
    setIsLoadingData(true);
    const fetchInitialData = async () => {
      try {
        const [busRes, routeRes, alertRes] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/buses`, { credentials: 'include' }).then(r => r.json()),
          fetch(`${API_BASE_URL}/routes`, { credentials: 'include' }).then(r => r.json()),
          fetch(`${API_BASE_URL}/alerts`, { credentials: 'include' }).then(r => r.json()),
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
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchInitialData();
  }, [authUser]);

  // WebSocket Subscription to Channels based on Role
  useEffect(() => {
    if (!isConnected || !socket || !authUser) return;

    if (currentRole === 'student') {
      emit('join_bus', { busId: authUser.assignedBusId });
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
    const unsubAuthorizationError = on('authorization_error', ({ message }: { message: string }) => {
      setSocketAuthorizationError(message);
    });

    return () => {
      unsubBusTelemetry();
      unsubFleetTelemetry();
      unsubGeofence();
      unsubAlert();
      unsubResolved();
      unsubAuthorizationError();
    };
  }, [isConnected, socket, currentRole, authUser, buses, emit, on]);

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
      if (!targetBus) return;
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

  const handleSignOut = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('The server could not end your session.');
      setAuthUser(null);
      setIsLoadingData(false);
      setSocketAuthorizationError(null);
      setIsSOSOpen(false);
      setIsAboutOpen(false);
      setIsPasswordOpen(false);
    } catch (error) {
      setSocketAuthorizationError(error instanceof Error ? error.message : 'Unable to sign out.');
    }
  }, []);

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

  if (isCheckingSession) {
    return <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300">Checking your session…</main>;
  }

  if (!authUser) {
    return <LoginPage onAuthenticated={(user) => {
      setAuthUser(user);
      setIsLoadingData(true);
      setSocketAuthorizationError(null);
    }} />;
  }

  const visibleBuses = authUser.role === 'admin'
    ? buses
    : buses.filter(bus => bus.id === authUser.assignedBusId);
  const visibleRoutes = authUser.role === 'admin'
    ? routes
    : routes.filter(route => visibleBuses.some(bus => bus.routeId === route.id));
  const visibleAlerts = authUser.role === 'admin'
    ? alerts
    : alerts.filter(alert => alert.busId === authUser.assignedBusId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Navbar with account identity and session controls */}
      <Header
        user={authUser}
        onSignOut={handleSignOut}
        onOpenPassword={() => setIsPasswordOpen(true)}
        isConnected={isConnected}
        onOpenSOS={() => setIsSOSOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {socketAuthorizationError && (
          <p role="alert" className="mb-4 rounded-xl border border-amber-800 bg-amber-950/50 px-4 py-3 text-sm text-amber-200">
            {socketAuthorizationError}
          </p>
        )}
        {isLoadingData && (
          <p className="text-center text-sm text-slate-400 py-12">Loading your assigned transport data…</p>
        )}
        {!isLoadingData && currentRole === 'student' && visibleBuses.length > 0 && visibleRoutes.length > 0 && (
          <StudentView
            routes={visibleRoutes}
            buses={visibleBuses}
            activeAlerts={visibleAlerts}
            onOpenSOS={() => setIsSOSOpen(true)}
            onOpenAbout={() => setIsAboutOpen(true)}
            geofencePushAlert={geofencePushAlert}
          />
        )}
        {!isLoadingData && currentRole === 'student' && (visibleBuses.length === 0 || visibleRoutes.length === 0) && (
          <p className="text-center text-sm text-slate-400 py-12">
            No bus is assigned to this account yet. Contact the transport administrator.
          </p>
        )}

        {!isLoadingData && currentRole === 'driver' && visibleBuses.length > 0 && visibleRoutes.length > 0 && (
          <DriverConsole
            buses={visibleBuses}
            routes={visibleRoutes}
            onTransmitTelemetry={handleTransmitTelemetry}
            onDispatchAlert={handleDispatchIncident}
            onUpdateStopProgress={handleUpdateStopProgress}
            onUpdateTripStatus={handleUpdateTripStatus}
          />
        )}
        {!isLoadingData && currentRole === 'driver' && (visibleBuses.length === 0 || visibleRoutes.length === 0) && (
          <p className="text-center text-sm text-slate-400 py-12">
            No vehicle is assigned to this driver account. Contact the transport administrator.
          </p>
        )}

        {!isLoadingData && currentRole === 'admin' && (
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
        activeBus={buses.find(bus => bus.id === authUser.assignedBusId) || buses[0] || null}
        onDispatchSOS={(reason) => {
          const bus = buses.find(item => item.id === authUser.assignedBusId) || buses[0];
          if (bus) handleDispatchIncident(bus.id, 'SOS', reason);
        }}
      />

      {/* Project & Group G6 Academic About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      <ChangePasswordModal
        isOpen={isPasswordOpen}
        onClose={() => setIsPasswordOpen(false)}
      />

    </div>
  );
};

export default App;
