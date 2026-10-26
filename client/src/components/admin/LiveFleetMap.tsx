import React, { useRef } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Bus, Route } from '../../types';
import { JIT_CAMPUS_COORDS, JIT_CAMPUS_NAME } from '../../data/mockData';
import { Maximize2, ShieldAlert } from 'lucide-react';

interface LiveFleetMapProps {
  buses: Bus[];
  routes: Route[];
  onSelectBus?: (bus: Bus) => void;
}

export const LiveFleetMap: React.FC<LiveFleetMapProps> = ({ buses, routes, onSelectBus }) => {
  const mapRef = useRef<L.Map | null>(null);

  const routeColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316'];

  const createBusMarker = (bus: Bus) => {
    const isSOS = bus.isSOS;
    const isDelayed = bus.status === 'DELAYED';
    const bgColor = isSOS ? '#dc2626' : (isDelayed ? '#f59e0b' : '#2563eb');

    return L.divIcon({
      className: 'custom-bus-icon',
      html: `
        <div class="bus-marker-pin" style="transform: rotate(${bus.currentLocation.heading}deg);">
          <div class="bus-pulse-ring ${isSOS ? 'sos' : ''}"></div>
          <div style="background: ${bgColor}; border: 2px solid #ffffff; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.6); z-index: 2;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="4"/>
              <path d="M9 17h.01"/>
              <path d="M15 17h.01"/>
              <path d="M7 11h10"/>
              <polygon points="12 4 15 8 9 8" fill="white" stroke="none"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
  };

  const createCampusIcon = () => {
    return L.divIcon({
      className: 'college-campus-pin',
      html: `
        <div style="background: #f59e0b; border: 2.5px solid #ffffff; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.6);">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
  };

  const handleFitAll = () => {
    if (mapRef.current) {
      mapRef.current.setView([21.1800, 79.0850], 12);
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 h-[440px] sm:h-[520px] w-full">
      {/* Map Action Button */}
      <div className="absolute top-3 right-3 z-[1000]">
        <button
          onClick={handleFitAll}
          title="Reset Global Fleet View"
          className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 p-2.5 rounded-xl shadow-lg transition backdrop-blur-sm"
        >
          <Maximize2 className="w-4 h-4 text-blue-400" />
        </button>
      </div>

      <LeafletMap
        center={[21.1800, 79.0850]}
        zoom={12}
        ref={mapRef}
        style={{ height: '100%', width: '100%', background: '#090d16' }}
        zoomControl={false}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Polylines for each route */}
        {routes.map((route, i) => (
          <Polyline
            key={route.id}
            positions={route.polylineCoordinates}
            color={routeColors[i % routeColors.length]}
            weight={5}
            opacity={0.7}
          />
        ))}

        {/* College Campus Destination Marker */}
        <Marker position={JIT_CAMPUS_COORDS} icon={createCampusIcon()}>
          <Popup className="text-slate-900">
            <div className="font-sans text-xs">
              <strong className="text-sm font-bold text-amber-700 block">JIT Campus Gate #1</strong>
              <span>{JIT_CAMPUS_NAME}</span>
              <p className="text-[11px] text-slate-500 mt-1">Final Destination for All Fleet Corridors</p>
            </div>
          </Popup>
        </Marker>

        {/* All Operational Buses */}
        {buses.map((bus) => (
          <Marker
            key={bus.id}
            position={[bus.currentLocation.lat, bus.currentLocation.lng]}
            icon={createBusMarker(bus)}
            eventHandlers={{
              click: () => {
                if (onSelectBus) onSelectBus(bus);
              }
            }}
          >
            <Popup className="text-slate-900">
              <div className="font-sans text-xs space-y-1">
                <div className="flex items-center space-x-1">
                  <strong className="text-sm font-bold text-blue-800">{bus.busNumber}</strong>
                  {bus.isSOS && (
                    <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">SOS</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600">Reg: {bus.registrationNumber}</p>
                <p className="text-[11px] text-slate-600">Driver: {bus.driverName} ({bus.driverPhone})</p>
                <p className="text-[11px] text-slate-800 font-semibold">
                  Speed: {Math.round(bus.currentLocation.speed)} km/h • Bearing: {bus.currentLocation.heading}°
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  Coordinates: {bus.currentLocation.lat.toFixed(4)}, {bus.currentLocation.lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </LeafletMap>
    </div>
  );
};
