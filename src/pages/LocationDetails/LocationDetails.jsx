import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/LoadingSpinner";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import planService from "../../store/Plan/planyService";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icons for different markers
const locationIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const visitedIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function LocationDetails() {
  const { planId, locationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "R") {
      fetchPlanDetails();
    }
  }, [planId]);

  const fetchPlanDetails = async () => {
    try {
      setIsLoading(true);
      const response = await planService.getPlanById(planId);
      setPlan(response);
    } catch {
      toast.error("Failed to load plan details");
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.role !== "R") {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            This page is only available for representatives.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const locationData = plan?.locations.find(
    (loc) => loc.location._id === locationId
  );

  if (!locationData) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Location Not Found
          </h2>
          <p className="text-gray-600">
            The requested location details could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              Location Details
            </h2>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Back to History
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Location Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Location Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Location Name
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {locationData.location.locationName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {locationData.location.address}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      State
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {locationData.location.state}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {locationData.location.city}
                    </p>
                  </div>
                </div>
              </div>

              {/* Visit Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Visit Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Visit Date
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {locationData.startDate
                        ? format(
                            new Date(locationData.startDate),
                            "MM/dd/yyyy",
                            {
                              locale: enUS,
                            }
                          )
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <span
                      className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        locationData.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : locationData.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {locationData.status}
                    </span>
                  </div>
                  {locationData.startDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Actual Visit Date
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {format(
                          new Date(locationData.startDate),
                          "MM/dd/yyyy hh:mm a",
                          { locale: enUS }
                        )}
                      </p>
                    </div>
                  )}
                  {locationData.endDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Actual End Visit Date
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {format(
                          new Date(locationData.endDate),
                          "MM/dd/yyyy hh:mm a",
                          { locale: enUS }
                        )}
                      </p>
                    </div>
                  )}
                  {locationData.startLatitude &&
                    locationData.startLongitude && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Visit Coordinates
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          Lat: {locationData.startLatitude}, Long:{" "}
                          {locationData.startLongitude}
                        </p>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Maps Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Location Maps
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Location Map */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">
                    Planned Location
                  </h4>
                  <div className="h-64 rounded-lg overflow-hidden">
                    <MapContainer
                      center={[
                        locationData.location.latitude,
                        locationData.location.longitude,
                      ]}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker
                        position={[
                          locationData.location.latitude,
                          locationData.location.longitude,
                        ]}
                        icon={locationIcon}
                      >
                        <Popup>
                          {locationData.location.locationName}
                          <br />
                          {locationData.location.address}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>

                {/* Visited Location Map */}
                {locationData.endLatitude && locationData.endLongitude && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">
                      Actual Visit Location
                    </h4>
                    <div className="h-64 rounded-lg overflow-hidden">
                      <MapContainer
                        center={[
                          locationData.endLatitude,
                          locationData.endLongitude,
                        ]}
                        zoom={13}
                        style={{ height: "100%", width: "100%" }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker
                          position={[
                            locationData.endLatitude,
                            locationData.endLongitude,
                          ]}
                          icon={visitedIcon}
                        >
                          <Popup>
                            Visited Location
                            <br />
                            {format(
                              new Date(locationData.endDate),
                              "MM/dd/yyyy hh:mm a",
                              {
                                locale: enUS,
                              }
                            )}
                          </Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Notes
              </h3>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="space-y-4">
                  {/* Representative Notes */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Representative Notes
                    </h4>
                    {plan.notes
                      .filter((note) => note.location === locationId)
                      .map((note) => (
                        <div
                          key={note._id}
                          className="bg-white p-4 rounded-md shadow-sm mb-2"
                        >
                          <p className="text-sm text-gray-900">{note.note}</p>
                        </div>
                      ))}
                  </div>

                  {/* HR Notes */}
                  {plan.hrNotes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        HR Notes
                      </h4>
                      {plan.hrNotes
                        .filter((note) => note.location === locationId)
                        .map((note) => (
                          <div
                            key={note._id}
                            className="bg-white p-4 rounded-md shadow-sm mb-2"
                          >
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-2">
                                By: {note.user?.name || "Unknown User"}
                              </span>
                              <p className="text-sm text-gray-900 ">
                                {note.type}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* GM Notes */}
                  {plan.gmNotes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        GM Notes
                      </h4>
                      {plan.gmNotes
                        .filter((note) => note.location === locationId)
                        .map((note) => (
                          <div
                            key={note._id}
                            className="bg-white p-4 rounded-md shadow-sm mb-2"
                          >
                            <p className="text-sm text-gray-900">{note.type}</p>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* LM Notes */}
                  {plan.lmNotes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        LM Notes
                      </h4>
                      {plan.lmNotes
                        .filter((note) => note.location === locationId)
                        .map((note) => (
                          <div
                            key={note._id}
                            className="bg-white p-4 rounded-md shadow-sm mb-2"
                          >
                            <p className="text-sm text-gray-900">{note.type}</p>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* DM Notes */}
                  {plan.dmNotes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        DM Notes
                      </h4>
                      {plan.dmNotes
                        .filter((note) => note.location === locationId)
                        .map((note) => (
                          <div
                            key={note._id}
                            className="bg-white p-4 rounded-md shadow-sm mb-2"
                          >
                            <p className="text-sm text-gray-900">{note.type}</p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
