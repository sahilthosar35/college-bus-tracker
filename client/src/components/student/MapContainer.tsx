import React, { useEffect, useRef } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Bus, Route, RouteStop } from '../../types';
import { JIT_CAMPUS_COORDS, JIT_CAMPUS_NAME } from '../../data/mockData';
import { Maximize2, Navigation, ZoomIn, ZoomOut } from 'lucide-react';

interface MapContainerProps {
  bus: Bus | null;
  route: Route;
  selectedStop: RouteStop;
  isWithinGeofence: boolean;
}

// Controller to smoothly pan map when bus position changes
const MapRecenterController: React.FC<{ coords: [number, number] }> = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    map.panTo(coords, { animate: true, duration: 1 });
  }, [coords, map]);
  return null;
};

export const MapContainer: React.FC<MapContainerProps> = ({
  bus,
  route,
  selectedStop,
  isWithinGeofence
}) => {
  const mapRef = useRef<L.Map | null>(null);

  const busCoords: [number, number] = bus
    ? [bus.currentLocation.lat, bus.currentLocation.lng]
    : [selectedStop.lat, selectedStop.lng];

  // Custom Bus Marker with Animated SVG and Heading Rotation
  const createBusIcon = (heading: number, isSOS: boolean) => {
    return L.divIcon({
      className: 'custom-bus-icon',
      html: `
        <div class="bus-marker-pin" style="transform: rotate(${heading}deg);">
          <div class="bus-pulse-ring ${isSOS ? 'sos' : ''}"></div>
          <div style="background: ${isSOS ? '#dc2626' : '#2563eb'}; border: 2.5px solid #ffffff; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.5); z-index: 2;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="4"/>
              <path d="M9 17h.01"/>
              <path d="M15 17h.01"/>
              <path d="M7 11h10"/>
              <polygon points="12 4 15 8 9 8" fill="white" stroke="none"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
  };

  // Custom Stop Marker
  const createStopIcon = (order: number, isSelected: boolean) => {
    const bgColor = isSelected ? '#10b981' : '#334155';
    const borderColor = isSelected ? '#ffffff' : '#64748b';
    const size = isSelected ? 30 : 24;

    return L.divIcon({
      className: 'custom-stop-icon',
      html: `
        <div style="background: ${bgColor}; border: 2px solid ${borderColor}; width: ${size}px; height: ${size}px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: ${isSelected ? '12px' : '10px'}; box-shadow: 0 2px 6px rgba(0,0,0,0.4); transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'}; transition: transform 0.2s;">
          ${order + 1}
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  };

  // Custom Campus Destination Icon
  const createCampusIcon = () => {
    return L.divIcon({
      className: 'college-campus-pin',
      html: `
        <div style="background: #f59e0b; border: 2.5px solid #ffffff; width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });
  };

  const handleFitBounds = () => {
    if (mapRef.current && route.polylineCoordinates.length > 0) {
      const bounds = L.latLngBounds(route.polylineCoordinates);
      mapRef.current.fitBounds(bounds, { padding: [40, 40] });
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 h-[380px] sm:h-[460px] lg:h-[520px] w-full">
      
      {/* Floating Map Action Buttons */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col space-y-2">
        <button
          onClick={() => mapRef.current?.zoomIn()}
          title="Zoom in"
          aria-label="Zoom in"
          className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 p-2.5 rounded-xl shadow-lg transition backdrop-blur-sm"
        >
          <ZoomIn className="w-4 h-4 text-blue-400" />
        </button>
        <button
          onClick={() => mapRef.current?.zoomOut()}
          title="Zoom out"
          aria-label="Zoom out"
          className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 p-2.5 rounded-xl shadow-lg transition backdrop-blur-sm"
        >
          <ZoomOut className="w-4 h-4 text-blue-400" />
        </button>
        <button
          onClick={handleFitBounds}
          title="Fit Whole Route to Screen"
          className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 p-2.5 rounded-xl shadow-lg transition backdrop-blur-sm"
        >
          <Maximize2 className="w-4 h-4 text-blue-400" />
        </button>

        {bus && (
          <button
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.setView(busCoords, 15, { animate: true });
              }
            }}
            title="Track Live Bus"
            className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 p-2.5 rounded-xl shadow-lg transition backdrop-blur-sm"
          >
            <Navigation className="w-4 h-4 text-emerald-400" />
          </button>
        )}
      </div>

      {/* Geofence Alert Overlay Pill */}
      {isWithinGeofence && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-emerald-950/90 border border-emerald-600 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-md shadow-lg flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Inside 1.0 km Approach Geofence</span>
        </div>
      )}

      {/* Leaflet Map instance */}
      <LeafletMap
        center={busCoords}
        zoom={13}
        ref={mapRef}
        style={{ height: '100%', width: '100%', background: '#090d16' }}
        zoomControl={false}
        scrollWheelZoom={false}
      >
        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Route Polyline connecting corridor */}
        <Polyline
          positions={route.polylineCoordinates}
          color="#3b82f6"
          weight={6}
          opacity={0.85}
          lineJoin="round"
          lineCap="round"
        />

        {/* Auto Recenter Controller */}
        <MapRecenterController coords={busCoords} />

        {/* 1.0 km Geofence Circular Overlay around User's Selected Stop */}
        <Circle
          center={[selectedStop.lat, selectedStop.lng]}
          radius={selectedStop.geofenceRadiusKm * 1000} // Convert km to meters
          pathOptions={{
            color: '#10b981',
            fillColor: '#10b981',
            fillOpacity: 0.15,
            weight: 2,
            dashArray: '6, 6'
          }}
        />

        {/* College Destination Marker (JIT Lonara Campus) */}
        <Marker position={JIT_CAMPUS_COORDS} icon={createCampusIcon()}>
          <Popup className="text-slate-900">
            <div className="font-sans text-xs">
              <strong className="text-sm font-bold text-amber-700 block">JIT Campus Gate #1</strong>
              <span>{JIT_CAMPUS_NAME}</span>
              <p className="text-[11px] text-slate-500 mt-1">Final Destination (Arrival 08:15 AM)</p>
            </div>
          </Popup>
        </Marker>

        {/* All Intermediate Stops */}
        {route.stops.map((stop) => {
          const isSelected = stop.id === selectedStop.id;
          return (
            <Marker
              key={stop.id}
              position={[stop.lat, stop.lng]}
              icon={createStopIcon(stop.order, isSelected)}
            >
              <Popup className="text-slate-900">
                <div className="font-sans text-xs">
                  <span className="font-bold text-slate-800 block text-xs">
                    Stop #{stop.order + 1}: {stop.name}
                  </span>
                  <span className="text-[11px] text-blue-600 font-semibold">
                    Scheduled Time: {stop.scheduledTime}
                  </span>
                  {isSelected && (
                    <div className="mt-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                      Your Selected Boarding Stop
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Live Bus Marker */}
        {bus && (
          <Marker
            position={busCoords}
            icon={createBusIcon(bus.currentLocation.heading, bus.isSOS)}
          >
            <Popup className="text-slate-900">
              <div className="font-sans text-xs">
                <strong className="text-sm font-bold text-blue-700 block">{bus.busNumber}</strong>
                <p className="text-[11px] text-slate-600">Reg: {bus.registrationNumber}</p>
                <p className="text-[11px] text-slate-600">Driver: {bus.driverName}</p>
                <p className="text-[11px] text-emerald-600 font-bold">
                  Speed: {Math.round(bus.currentLocation.speed)} km/h • Status: {bus.status}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </LeafletMap>
    </div>
  );
};
