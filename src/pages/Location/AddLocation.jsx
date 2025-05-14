import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import InputField from "../../components/InputField";
import SelectField from "../../components/SelectField";
import locationService from "../../store/Location/locationService";
import toast from "react-hot-toast";
import governates from "../../data/governates.json";
import cities from "../../data/cities.json";

// Fix for Leaflet marker icon issue in React
// You might need to adjust paths based on your project structure
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Map Marker Component
const LocationMarker = ({ position, setPosition }) => {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
};

export default function AddLocation() {
  // Form state
  const [locationName, setLocationName] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [village, setVillage] = useState("");
  const [position, setPosition] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);

  const mapRef = useRef(null);

  const states = governates.gov.map((g) => ({
    value: g.governorate_name_en.replace(/\s+/g, ""),
    label: g.governorate_name_en,
  }));

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userPos = [pos.coords.latitude, pos.coords.longitude];
        setPosition(userPos);

        if (mapRef.current) {
          mapRef.current.setView(userPos, 13);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
      }
    );
  }, []);

  const [availableCities, setAvailableCities] = useState([]);

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
            value: c.city_name_en, // Use city_name_en as value instead of id
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
    setIsFormValid(
      locationName.trim() !== "" &&
        address.trim() !== "" &&
        state !== "" &&
        city !== "" &&
        position !== null
    );
  }, [locationName, address, state, city, position]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) return;

    const locationData = {
      locationName: locationName,
      address: address,
      state: state,
      city: city,
      village: village,
      latitude: position[0],
      longitude: position[1],
    };
    console.log(locationData);

    // Here you would typically send the data to your backend
    const response = await locationService.createLocation(locationData);
      toast.success("Location added successfully");
    if (response.status === 201) {
      // Reset form fields
      setLocationName("");
      setAddress("");
      setState("");
      setCity("");
      setVillage("");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 bg-blue-600 text-white flex items-center">
          <svg
            className="w-6 h-6 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            ></path>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            ></path>
          </svg>
          <h1 className="text-2xl font-bold">Add New Location</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Location Details
                </h2>

                <InputField
                  label="Location Name"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Enter location name"
                  required={true}
                />

                <InputField
                  label="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter street address"
                  required={true}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    label="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    options={states}
                    placeholder="Select state"
                    required={true}
                  />

                  <SelectField
                    label="City"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                    }}
                    options={availableCities}
                    placeholder={state ? "Select city" : "Select state first"}
                    required={true}
                  />
                </div>

                {city && (
                  <InputField
                    label="Village"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="Enter village name (optional)"
                    required={false}
                  />
                )}
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Coordinates
                </h2>

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
                    placeholder="Latitude"
                    required={true}
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
                    placeholder="Longitude"
                    required={true}
                  />
                </div>

                <p className="text-sm text-gray-500 mt-2">
                  You can click on the map to set the coordinates or enter them
                  manually.
                </p>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="bg-gray-50 p-6 rounded-lg flex-grow">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Map
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Click on the map to pinpoint the exact location.
                </p>

                <div className="h-80 md:h-96 rounded-lg overflow-hidden border border-gray-300">
                  {position && (
                    <MapContainer
                      center={position}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                      whenCreated={(mapInstance) => {
                        mapRef.current = mapInstance;
                      }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <LocationMarker
                        position={position}
                        setPosition={setPosition}
                      />
                    </MapContainer>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              onClick={() => {
                setLocationName("");
                setAddress("");
                setState("");
                setCity("");
                setVillage("");
                setPosition(null);
              }}
            >
              Clear Form
            </button>

            <button
              type="submit"
              className={`px-6 py-2 rounded-lg text-white transition-colors ${
                isFormValid
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-300 cursor-not-allowed"
              }`}
              disabled={!isFormValid}
            >
              Save Location
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
