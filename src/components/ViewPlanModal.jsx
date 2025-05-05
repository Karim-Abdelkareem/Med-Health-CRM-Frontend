import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { IoClose } from "react-icons/io5";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default icon issue with Leaflet in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Define custom icons
const completedIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const pendingIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function ViewPlanModal({ isOpen, setIsOpen, plan }) {
  const [mapReady, setMapReady] = useState(false);

  // Reset map state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setMapReady(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setMapReady(false);
    }
  }, [isOpen]);

  if (!isOpen || !plan) return null;

  // Get locations from the plan
  const locations = plan.locations || [];

  // If no locations, check if there's a region property (for backward compatibility)
  const hasRegion = plan.region && plan.region.length > 0;

  // Calculate center of the map
  let center = [30.0444, 31.2357]; // Default to Cairo, Egypt
  let zoom = 13;

  if (
    locations.length > 0 &&
    locations[0].location &&
    locations[0].location.latitude &&
    locations[0].location.longitude
  ) {
    // Use the first location's coordinates
    center = [
      parseFloat(locations[0].location.latitude),
      parseFloat(locations[0].location.longitude),
    ];
  } else if (hasRegion && plan.region[0].latitude && plan.region[0].longitude) {
    // Fallback to region if no locations
    center = [
      parseFloat(plan.region[0].latitude),
      parseFloat(plan.region[0].longitude),
    ];
  }

  // Helper function to get the appropriate icon based on status
  const getIconForStatus = (status) => {
    if (!status) return L.Icon.Default;

    switch (status.toLowerCase().trim()) {
      case "completed":
        return completedIcon;
      case "incomplete":
        return pendingIcon;
      default:
        return L.Icon.Default;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Plan Details - {new Date(plan.visitDate).toLocaleDateString()}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Map Section */}
        <div className="h-96 mb-6 rounded-lg overflow-hidden border border-gray-200">
          {mapReady && (
            <MapContainer
              center={center}
              zoom={zoom}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {/* Render locations */}
              {locations.map((loc, i) => {
                // Skip locations without valid coordinates
                if (
                  !loc.location ||
                  !loc.location.latitude ||
                  !loc.location.longitude
                ) {
                  return null;
                }

                const lat = parseFloat(loc.location.latitude);
                const lng = parseFloat(loc.location.longitude);

                // Skip if coordinates are invalid
                if (isNaN(lat) || isNaN(lng)) {
                  return null;
                }

                return (
                  <Marker
                    key={i}
                    position={[lat, lng]}
                    icon={getIconForStatus(loc.status)}
                  >
                    <Popup>
                      <div>
                        <strong>{loc.location.locationName}</strong>
                        <br />
                        {loc.location.address}
                        <br />
                        <span
                          className={`text-xs font-medium ${
                            loc.status?.toLowerCase() === "completed"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          Status: {loc.status || "Unknown"}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Fallback to region if no locations */}
              {locations.length === 0 &&
                hasRegion &&
                plan.region.map((r, i) => {
                  if (!r.latitude || !r.longitude) return null;

                  const lat = parseFloat(r.latitude);
                  const lng = parseFloat(r.longitude);

                  if (isNaN(lat) || isNaN(lng)) return null;

                  return (
                    <Marker key={i} position={[lat, lng]}>
                      <Popup>
                        <strong>{r.location}</strong>
                        <br />
                        Visit Date: {new Date(r.visitDate).toLocaleDateString()}
                      </Popup>
                    </Marker>
                  );
                })}
            </MapContainer>
          )}
        </div>

        {/* Location Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Locations</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {locations.map((loc, i) => (
              <div
                key={i}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <h4 className="font-medium">{loc.location.locationName}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {loc.location.address}
                </p>
                <div className="mt-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      loc.status?.toLowerCase() === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {loc.status || "Unknown"}
                  </span>
                </div>
              </div>
            ))}

            {/* Fallback to region if no locations */}
            {locations.length === 0 &&
              hasRegion &&
              plan.region.map((r, i) => (
                <div
                  key={i}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                >
                  <h4 className="font-medium">{r.location}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Visit Date: {new Date(r.visitDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
          </div>
        </div>

        {/* Notes Section */}
        {plan.notes && plan.notes.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Notes</h3>
            <div className="space-y-2">
              {plan.notes.map((note, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="border-b border-gray-100 pb-2 mb-2">
                    <h4 className="font-medium text-blue-700">
                      Note #{idx + 1}
                    </h4>
                  </div>
                  {typeof note === "string" ? (
                    <p>{note}</p>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-gray-500">Location:</p>
                        <p className="font-medium">
                          {note.location?.locationName ||
                            (typeof note.location === "string"
                              ? locations.find(
                                  (loc) => loc.location._id === note.location
                                )?.location.locationName
                              : note.locationName || "Location")}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <p className="text-gray-500">Note:</p>
                        <p className="text-gray-700 whitespace-pre-line">
                          {note.note}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
