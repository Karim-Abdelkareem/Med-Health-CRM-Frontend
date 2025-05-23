import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { IoClose } from "react-icons/io5";
import "leaflet/dist/leaflet.css";

// Function to fetch location name based on coordinates
const fetchLocationName = (lat, lng, setLocationName) => {
  fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
  )
    .then((res) => res.json())
    .then((data) => {
      const location = data.display_name || "Unknown location";
      setLocationName(location);
    })
    .catch((err) => {
      setLocationName("Unknown location");
    });
};

function LocationMarker({ setCoords, setLocationName }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setCoords({ lat, lng });
      fetchLocationName(lat, lng, setLocationName); // Fetch location name
    },
  });

  return null;
}

export default function LocationPickerModal({ isOpen, onClose, onSelect }) {
  const [coords, setCoords] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [userPosition, setUserPosition] = useState([30.0444, 31.2357]); // Default to Cairo

  useEffect(() => {
    if (!isOpen) return;

    // Try to get user's geolocation
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLoc = [position.coords.latitude, position.coords.longitude];
        setUserPosition(userLoc);
        fetchLocationName(userLoc[0], userLoc[1], setLocationName); // Fetch location name
      },
      (err) => {
        console.error(err);
      }
    );
  }, [isOpen]);

  const handleConfirm = () => {
    if (coords) onSelect(coords, locationName); // Pass location name to parent
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-[90%] h-[80%] relative">
        <button
          className="absolute top-2 right-2 z-10 text-2xl text-red-600 hover:text-red-800"
          onClick={onClose}
        >
          <IoClose />
        </button>

        <MapContainer
          center={userPosition}
          zoom={15}
          scrollWheelZoom={true}
          className="w-full h-[480px] mt-3 rounded-lg"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker
            setCoords={setCoords}
            setLocationName={setLocationName}
          />
          <Marker position={userPosition} />
          {coords && <Marker position={[coords.lat, coords.lng]} />}
        </MapContainer>

        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-white/80 p-2 rounded-md shadow">
          <p className="text-sm">
            Selected:{" "}
            {coords
              ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
              : "None"}
          </p>
          <p className="text-sm text-gray-600">Location: {locationName}</p>
          <button
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm"
            onClick={handleConfirm}
            disabled={!coords}
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}
