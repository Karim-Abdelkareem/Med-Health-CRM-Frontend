import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default Leaflet marker icon issue
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom marker for visited locations
const visitedIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom marker for pending locations
const pendingIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom marker for cancelled locations
const cancelledIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function LocationMap({ location, status, userLocation }) {
  // Function to determine which icon to use based on location status
  const getIconForStatus = (status) => {
    if (!status) return defaultIcon;

    switch (status.toLowerCase().trim()) {
      case "completed":
        return visitedIcon;
      case "pending":
        return pendingIcon;
      case "cancelled":
        return cancelledIcon;
      default:
        return defaultIcon;
    }
  };

  // Check if we have valid location data
  if (!location || !location.latitude || !location.longitude) {
    return (
      <div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center">
        <p className="text-gray-500 text-sm">
          No location coordinates available
        </p>
      </div>
    );
  }

  const center = [location.latitude, location.longitude];
  const zoom = 14;

  return (
    <div className="w-full h-48 rounded overflow-hidden border border-gray-200">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Location marker */}
        <Marker position={center} icon={getIconForStatus(status)}>
          <Popup>
            <div>
              <h3 className="text-lg font-semibold">{location.locationName}</h3>
              <p className="text-sm text-gray-600">{location.address}</p>
              <p className="text-xs mt-1 font-medium">
                Status:{" "}
                <span
                  className={`
                  ${
                    status?.toLowerCase().trim() === "completed"
                      ? "text-green-600"
                      : ""
                  }
                  ${
                    status?.toLowerCase().trim() === "incomplete"
                      ? "text-red-600"
                      : ""
                  }
                `}
                >
                  {status || "Unknown"}
                </span>
              </p>
            </div>
          </Popup>
        </Marker>

        {/* User location marker (if within map bounds) */}
        {userLocation &&
          userLocation.visitedLatitude &&
          userLocation.visitedLongitude && (
            <Marker
              position={[
                userLocation.visitedLatitude,
                userLocation.visitedLongitude,
              ]}
              icon={L.divIcon({
                className: "user-location-marker",
                html: `<div style="background-color: #4338ca; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white;"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              })}
            >
              <Popup>
                <div className="font-medium">Your Location</div>
              </Popup>
            </Marker>
          )}
      </MapContainer>
    </div>
  );
}
