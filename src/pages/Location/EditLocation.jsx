import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import SelectField from "../../components/SelectField";
import InputField from "../../components/InputField";
import locationService from "../../store/Location/locationService";
import { set } from "react-hook-form";
import toast from "react-hot-toast";

// Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
};

const EditLocation = () => {
  const [selectedId, setSelectedId] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [locationName, setLocationName] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [position, setPosition] = useState(null);
  const [availableCities, setAvailableCities] = useState([]);
  const [locations, setLocations] = useState([]);
  // fetch locations
  const fetchLocations = async () => {
    try {
      const response = await locationService.getAllLocations();
      if (response.status === 200) {
        setLocations(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // In a real app, you would fetch this from an API
  const states = [
    { value: "Faiyum", label: "Faiyum" },
    { value: "BaniSewif", label: "Bani Sewif" },
    { value: "Minya", label: "Minya" },
    { value: "Asyut", label: "Asyut" },
    { value: "Sohag", label: "Sohag" },
    { value: "Qena", label: "Qena" },
    { value: "Luxor", label: "Luxor" },
    { value: "Aswan", label: "Aswan" },
    // Add more states as needed
  ];

  // Cities would be dynamically loaded based on state selection
  const citiesByState = {
    Faiyum: [
      { value: "birmingham", label: "Birmingham" },
      { value: "montgomery", label: "Montgomery" },
      { value: "mobile", label: "Mobile" },
    ],
    BaniSewif: [
      { value: "anchorage", label: "Anchorage" },
      { value: "fairbanks", label: "Fairbanks" },
      { value: "juneau", label: "Juneau" },
    ],
    Minya: [
      { value: "phoenix", label: "Phoenix" },
      { value: "tucson", label: "Tucson" },
      { value: "mesa", label: "Mesa" },
    ],
    Sohag: [
      { value: "phoenix", label: "Phoenix" },
      { value: "tucson", label: "Tucson" },
      { value: "mesa", label: "Mesa" },
    ],
    // Add more cities for other states
  };

  useEffect(() => {
    if (selectedId) {
      const loc = locations.find((l) => l._id === selectedId);
      if (loc) {
        setSelectedLocation(loc);
        setLocationName(loc.locationName);
        setAddress(loc.address);
        setState(loc.state);
        setCity(loc.city);
        setPosition([loc.latitude, loc.longitude]);
      }
    }
  }, [selectedId]);

  useEffect(() => {
    if (state && citiesByState[state]) {
      setAvailableCities(citiesByState[state]);
    } else {
      setAvailableCities([]);
    }
  }, [state]);

  const handleUpdate = () => {
    if (
      !selectedId ||
      !locationName ||
      !address ||
      !state ||
      !city ||
      !position
    )
      return;
    const updated = {
      id: selectedId,
      name: locationName,
      address,
      state,
      city,
      latitude: position[0],
      longitude: position[1],
    };
    // update location
    locationService.updateLocation(selectedId, updated);
    toast.success("Location updated!");
  };

  //Delete location
  const onDelete = async () => {
    try {
      await locationService.deleteLocation(selectedId);
      toast.success("Location deleted successfully");
      setSelectedId("");
      setSelectedLocation(null);
      setLocationName("");
      setAddress("");
      setState("");
      setCity("");
      setPosition(null);
      fetchLocations();
    } catch (err) {
      console.error("Error deleting location:", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Location</h1>

        <SelectField
          label="Select Location"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          options={locations?.map((loc) => ({
            value: loc._id,
            label: loc.locationName,
          }))}
          placeholder="Choose a location"
          required
        />
        {selectedLocation && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <InputField
                label="Location Name"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                required
              />
              <InputField
                label="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
              <SelectField
                label="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                options={states}
                placeholder="Select state"
                required
              />
              <SelectField
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                options={availableCities}
                placeholder="Select city"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Latitude"
                  type="number"
                  value={position ? position[0] : ""}
                  onChange={(e) =>
                    setPosition([
                      parseFloat(e.target.value),
                      position ? position[1] : 0,
                    ])
                  }
                  required
                />
                <InputField
                  label="Longitude"
                  type="number"
                  value={position ? position[1] : ""}
                  onChange={(e) =>
                    setPosition([
                      position ? position[0] : 0,
                      parseFloat(e.target.value),
                    ])
                  }
                  required
                />
              </div>
            </div>

            <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
              <MapContainer
                center={position || [37.0902, -95.7129]}
                zoom={position ? 13 : 4}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker position={position} setPosition={setPosition} />
              </MapContainer>
            </div>

            <div className="col-span-2 gap-2 flex justify-end mt-4">
              <button
                onClick={() => onDelete(selectedId)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Location
              </button>
              <button
                onClick={() => handleUpdate()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Location
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditLocation;
