import { Bus, Route, Alert } from '../types';

export const JIT_CAMPUS_COORDS: [number, number] = [21.2330, 79.0880];
export const JIT_CAMPUS_NAME = "Jhulelal Institute of Technology, Lonara, Nagpur";

export const MOCK_ROUTES: Route[] = [
  {
    id: 'ROUTE-01',
    routeCode: 'R-01',
    name: 'Sitabuldi - Sadar - Koradi Rd Express',
    description: 'Zero Mile Sitabuldi via RBI, Sadar, Mankapur to JIT Lonara Campus',
    totalDistanceKm: 16.8,
    estimatedTotalMinutes: 42,
    assignedBusId: 'BUS-01',
    morningStartTime: '07:30 AM',
    eveningReturnTime: '04:15 PM',
    stops: [
      { id: 'STOP-101', name: 'Sitabuldi Interchange (Zero Mile)', lat: 21.1458, lng: 79.0882, order: 0, scheduledTime: '07:30 AM', geofenceRadiusKm: 1.0 },
      { id: 'STOP-102', name: 'RBI Square (Civil Lines)', lat: 21.1560, lng: 79.0820, order: 1, scheduledTime: '07:38 AM', geofenceRadiusKm: 1.0 },
      { id: 'STOP-103', name: 'Sadar Residency Road (Liberty Sq)', lat: 21.1685, lng: 79.0815, order: 2, scheduledTime: '07:45 AM', geofenceRadiusKm: 1.0 },
      { id: 'STOP-104', name: 'Mankapur Sports Complex / Ring Rd', lat: 21.1890, lng: 79.0840, order: 3, scheduledTime: '07:56 AM', geofenceRadiusKm: 1.0 },
      { id: 'STOP-105', name: 'Koradi Naka / Mahalaxmi Jagdamba', lat: 21.2110, lng: 79.0870, order: 4, scheduledTime: '08:08 AM', geofenceRadiusKm: 1.0 },
      { id: 'STOP-106', name: 'JIT Campus, Lonara Gate #1', lat: 21.2330, lng: 79.0880, order: 5, scheduledTime: '08:15 AM', geofenceRadiusKm: 1.0 }
    ],
    polylineCoordinates: [
      [21.1458, 79.0882],
      [21.1510, 79.0850],
      [21.1560, 79.0820],
      [21.1620, 79.0818],
      [21.1685, 79.0815],
      [21.1780, 79.0825],
      [21.1890, 79.0840],
      [21.1990, 79.0855],
      [21.2110, 79.0870],
      [21.2220, 79.0875],
      [21.2330, 79.0880]
    ]
  },
  {
    id: 'ROUTE-02',
    routeCode: 'R-02',
    name: 'Dharampeth - Seminary Hills - Katol Rd Route',
    description: 'West Nagpur pickup from Shivaji Nagar, Dharampeth, Katol Naka to JIT Campus',
    totalDistanceKm: 18.2,
    estimatedTotalMinutes: 48,
    assignedBusId: 'BUS-02',
    morningStartTime: '07:25 AM',
    eveningReturnTime: '04:15 PM',
    stops: [
      { id: 'STOP-201', name: 'Dharampeth Coffee House Sq', lat: 21.1420, lng: 79.0610, order: 0, scheduledTime: '07:25 AM', geofenceRadiusKm: 1.0 },
      { id: 'STOP-202', name: 'Law College Square', lat: 21.1490, lng: 79.0600, order: 1, scheduledTime: '07:33 AM', geofenceRadiusKm: 1.0 },
      { id: 'STOP-203', name: 'Ravi Nagar Square', lat: 21.1570, lng: 79.0550, order: 2, scheduledTime: '07:42 AM', geofenceRadiusKm: 1.0 },
      { id: 'STOP-204', name: 'Seminary Hills Airforce Gate', lat: 21.1690, lng: 79.0580, order: 3, scheduledTime: '07:51 AM', geofenceRadiusKm: 1.0 },
      { id: 'STOP-205', name: 'Katol Road Chhaoni / Friends Colony', lat: 21.1850, lng: 79.0660, order: 4, scheduledTime: '08:02 AM', geofenceRadiusKm: 1.0 },
      { id: 'STOP-206', name: 'JIT Campus, Lonara Gate #1', lat: 21.2330, lng: 79.0880, order: 5, scheduledTime: '08:15 AM', geofenceRadiusKm: 1.0 }
    ],
    polylineCoordinates: [
      [21.1420, 79.0610],
      [21.1490, 79.0600],
      [21.1570, 79.0550],
      [21.1630, 79.0560],
      [21.1690, 79.0580],
      [21.1760, 79.0610],
      [21.1850, 79.0660],
      [21.1980, 79.0740],
      [21.2150, 79.0810],
      [21.2330, 79.0880]
    ]
  },
  {
    id: 'ROUTE-03',
    routeCode: 'R-03',
    name: 'Wardha Rd - Medical Sq - Automotive Sq Route',
    description: 'South Nagpur line from Chatrapati Sq, Ajni, Kamal Chowk to JIT Lonara',
    totalDistanceKm: 21.5,
    estimatedTotalMinutes: 55,
    assignedBusId: 'BUS-03',
    morningStartTime: '07:15 AM',
    eveningReturnTime: '04:15 PM',
    stops: [
      { id: 'STOP-301', name: 'Chatrapati Square (Wardha Rd)', lat: 21.1030, lng: 79.0680, order: 0, scheduledTime: '07:15 AM', geofenceRadiusKm: 1.0 },
      { id: 'STOP-302', name: 'Rahate Colony Square', lat: 21.1210, lng: 79.0760, order: 1, scheduledTime: '07:24 AM', geofenceRadiusKm: 1.0 },
      { id: 'STOP-303', name: 'Medical Square / GMC Nagpur', lat: 21.1350, lng: 79.0980, order: 2, scheduledTime: '07:35 AM', geofenceRadiusKm: 1.0 },
      { id: 'STOP-304', name: 'Kamal Chowk / Indora', lat: 21.1720, lng: 79.1020, order: 3, scheduledTime: '07:48 AM', geofenceRadiusKm: 1.0 },
      { id: 'STOP-305', name: 'Automotive Square (Kamptee Rd)', lat: 21.1980, lng: 79.1090, order: 4, scheduledTime: '08:00 AM', geofenceRadiusKm: 1.0 },
      { id: 'STOP-306', name: 'JIT Campus, Lonara Gate #1', lat: 21.2330, lng: 79.0880, order: 5, scheduledTime: '08:15 AM', geofenceRadiusKm: 1.0 }
    ],
    polylineCoordinates: [
      [21.1030, 79.0680],
      [21.1120, 79.0720],
      [21.1210, 79.0760],
      [21.1350, 79.0980],
      [21.1550, 79.1010],
      [21.1720, 79.1020],
      [21.1850, 79.1050],
      [21.1980, 79.1090],
      [21.2180, 79.0980],
      [21.2330, 79.0880]
    ]
  }
];

export const MOCK_BUSES: Bus[] = [
  {
    id: 'BUS-01',
    busNumber: 'Bus #01 - Sitabuldi Express',
    registrationNumber: 'MH-31-FC-2021',
    driverId: 'DRV-101',
    driverName: 'Suresh Meshram',
    driverPhone: '+91 94221 78901',
    capacity: 52,
    currentOccupancy: 38,
    status: 'EN_ROUTE',
    routeId: 'ROUTE-01',
    currentLocation: {
      lat: 21.1685,
      lng: 79.0815,
      heading: 15,
      speed: 32,
      lastUpdated: new Date().toISOString()
    },
    currentStopIndex: 2,
    isSOS: false
  },
  {
    id: 'BUS-02',
    busNumber: 'Bus #02 - Dharampeth & West Nagpur',
    registrationNumber: 'MH-31-FC-2045',
    driverId: 'DRV-102',
    driverName: 'Pravin Wankhede',
    driverPhone: '+91 98234 11223',
    capacity: 48,
    currentOccupancy: 42,
    status: 'EN_ROUTE',
    routeId: 'ROUTE-02',
    currentLocation: {
      lat: 21.1550,
      lng: 79.0620,
      heading: 40,
      speed: 28,
      lastUpdated: new Date().toISOString()
    },
    currentStopIndex: 1,
    isSOS: false
  },
  {
    id: 'BUS-03',
    busNumber: 'Bus #03 - Wardha Road & South Nagpur',
    registrationNumber: 'MH-31-FC-2088',
    driverId: 'DRV-103',
    driverName: 'Santosh Sharma',
    driverPhone: '+91 97654 33210',
    capacity: 55,
    currentOccupancy: 30,
    status: 'IDLE',
    routeId: 'ROUTE-03',
    currentLocation: {
      lat: 21.1030,
      lng: 79.0680,
      heading: 0,
      speed: 0,
      lastUpdated: new Date().toISOString()
    },
    currentStopIndex: 0,
    isSOS: false
  },
  {
    id: 'BUS-04',
    busNumber: 'Bus #04 - Koradi & Jaripatka Shuttler',
    registrationNumber: 'MH-31-FC-2104',
    driverId: 'DRV-104',
    driverName: 'Gajanan Dhoble',
    driverPhone: '+91 98901 65432',
    capacity: 50,
    currentOccupancy: 25,
    status: 'DELAYED',
    routeId: 'ROUTE-01',
    currentLocation: {
      lat: 21.2050,
      lng: 79.0880,
      heading: 10,
      speed: 8,
      lastUpdated: new Date().toISOString()
    },
    currentStopIndex: 4,
    isSOS: false
  }
];

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'ALT-1001',
    busId: 'BUS-04',
    busNumber: 'Bus #04 - Koradi & Jaripatka Shuttler',
    type: 'TRAFFIC_JAM',
    severity: 'MEDIUM',
    message: 'Heavy traffic congestion reported near Koradi flyover. 12-min delay expected.',
    location: { lat: 21.2050, lng: 79.0880 },
    status: 'ACTIVE',
    reportedBy: 'DRIVER',
    timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString()
  },
  {
    id: 'ALT-1002',
    busId: 'BUS-01',
    busNumber: 'Bus #01 - Sitabuldi Express',
    type: 'GEOFENCE_APPROACH',
    severity: 'LOW',
    message: 'Bus #01 has entered the 1.0 km approach zone for Sadar Residency Road stop.',
    location: { lat: 21.1685, lng: 79.0815 },
    status: 'ACTIVE',
    reportedBy: 'SYSTEM',
    timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString()
  }
];
