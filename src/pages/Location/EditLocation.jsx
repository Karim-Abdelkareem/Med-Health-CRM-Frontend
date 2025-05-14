import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import SelectField from "../../components/SelectField";
import InputField from "../../components/InputField";
import locationService from "../../store/Location/locationService";
import toast from "react-hot-toast";
import governates from "../../data/governates.json";
import cities from "../../data/cities.json";

// Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Updated LocationMarker component with MapController
const LocationMarker = ({ position, setPosition }) => {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
};

// New component to handle map centering
const MapController = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 13);
    }
  }, [position, map]);

  return null;
};

const EditLocation = () => {
  const [selectedId, setSelectedId] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [locationName, setLocationName] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [village, setVillage] = useState("");
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

  const states = governates.gov.map((g) => ({
    value: g.governorate_name_en.replace(/\s+/g, ""),
    label: g.governorate_name_en,
  }));

  useEffect(() => {
    if (state) {
      // Find the governorate ID based on the selected state
      const selectedGov = governates.gov.find(
        (g) => g.governorate_name_en.replace(/\s+/g, "") === state
      );

      if (selectedGov) {
        // Filter cities by the selected governorate ID
        const filteredCities = cities.cities
          .filter((c) => c.governorate_id === selectedGov.id)
          .map((c) => ({
            value: c.city_name_en,
            label: c.city_name_en,
          }));

        setAvailableCities(filteredCities);
        setCity(""); // Reset city when state changes
      } else {
        setAvailableCities([]);
      }
    } else {
      setAvailableCities([]);
    }
  }, [state]);

  useEffect(() => {
    if (selectedId) {
      const loc = locations.find((l) => l._id === selectedId);
      if (loc) {
        setSelectedLocation(loc);

        setLocationName(loc.locationName);
        setAddress(loc.address);
        setState(loc.state);
      }
    }
  }, [selectedId, locations]);

  useEffect(() => {
    if (selectedLocation && state && availableCities.length > 0) {
      // Now that we have the availableCities, we can set the city
      setCity(selectedLocation.city);
      setVillage(selectedLocation.village || "");

      // Set the position with coordinates from the selected location
      if (selectedLocation.latitude && selectedLocation.longitude) {
        setPosition([selectedLocation.latitude, selectedLocation.longitude]);
      }
    }
  }, [selectedLocation, state, availableCities]);

  const handleUpdate = async () => {
    if (
      !selectedId ||
      !locationName ||
      !address ||
      !state ||
      !city ||
      !position
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const updated = {
        id: selectedId,
        name: locationName,
        address,
        state,
        city,
        village,
        latitude: position[0],
        longitude: position[1],
      };

      // update location
      await locationService.updateLocation(selectedId, updated);
      toast.success("Location updated successfully!");
      fetchLocations(); // Refresh locations after update
    } catch (error) {
      toast.error("Failed to update location");
      console.error("Error updating location:", error);
    }
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
      setVillage("");
      setPosition(null);
      fetchLocations();
    } catch (err) {
      toast.error("Failed to delete location");
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
                disabled={availableCities.length === 0}
              />
              {city && (
                <InputField
                  label="Village"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="Enter village name (optional)"
                  required={false}
                />
              )}
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
                center={position || [30.0444, 31.2357]} // Default to Cairo if no position
                zoom={position ? 13 : 6}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker position={position} setPosition={setPosition} />
                <MapController position={position} />
              </MapContainer>
            </div>

            <div className="col-span-2 gap-2 flex justify-end mt-4">
              <button
                onClick={onDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Location
              </button>
              <button
                onClick={handleUpdate}
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
