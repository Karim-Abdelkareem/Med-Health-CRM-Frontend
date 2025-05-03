import React from "react";
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

export default function ViewPlanModal({ isOpen, setIsOpen, plan }) {
  if (!plan || !plan.region?.length) return null;

  const center = [plan.region[0].latitude || 0, plan.region[0].longitude || 0];

  return (
    <div
      className={`${
        isOpen ? "fixed" : "hidden"
      } top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50`}
    >
      <div className="bg-white w-10/12 h-4/5 rounded-lg shadow-lg relative p-7 overflow-hidden">
        <div className="absolute top-2 right-2">
          <IoClose
            onClick={() => setIsOpen(false)}
            className="text-red-600 cursor-pointer"
            size={24}
          />
        </div>

        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          className="h-full w-full rounded"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {plan.region.map((r, i) => (
            <Marker key={i} position={[r.latitude, r.longitude]}>
              <Popup>
                <strong>{r.location}</strong>
                <br />
                Visit Date: {new Date(r.visitDate).toLocaleDateString()}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
