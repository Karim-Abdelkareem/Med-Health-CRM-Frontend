import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FiArrowLeft, FiEdit } from "react-icons/fi";
import { CgNotes } from "react-icons/cg";
import toast from "react-hot-toast";
import LocationNoteForm from "../../components/LocationNoteForm";
import planService from "../../store/Plan/planyService";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

// PlanRegionCard component from UsersPlan.jsx
const PlanRegionCard = ({ region, planId, onDataRefresh }) => {
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [noteFormVisible, setNoteFormVisible] = useState(false);
  const [incompleteNote, setIncompleteNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const locationId = region._id || region.location?._id;

  // Handle both old and new data structures
  const locationName =
    region.location?.locationName || region.location || "Unknown Location";
  const latitude = parseFloat(
    region.location?.latitude || region.latitude || 0
  );
  const longitude = parseFloat(
    region.location?.longitude || region.longitude || 0
  );

  const status = region.status || "incomplete";

  // Check if coordinates are valid
  const hasValidCoordinates =
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    (latitude !== 0 || longitude !== 0);

  // Function to handle marking a visit as incomplete
  const incompleteVisit = () => {
    setShowIncompleteModal(true);
  };

  // Function to handle submitting the incomplete visit
  const handleIncompleteSubmit = async () => {
    if (!planId || !locationId) {
      toast.error("Invalid plan or location data");
      return;
    }

    try {
      setIsSubmitting(true);
      await planService.markVisitIncomplete(planId, locationId, incompleteNote);
      toast.success("Visit marked as incomplete");
      setShowIncompleteModal(false);
      setIncompleteNote("");
      if (onDataRefresh) onDataRefresh();
    } catch (error) {
      console.error("Error marking visit as incomplete:", error);
      toast.error("Failed to mark visit as incomplete");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle function with console log for debugging
  const toggleNoteForm = () => {
    setNoteFormVisible(!noteFormVisible);
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4 hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-gray-800">{locationName}</h4>
          <p className="text-gray-600 mt-1">
            <span className="font-semibold">Start Date:</span>{" "}
            {region.startDate && !isNaN(new Date(region.startDate).getTime())
              ? format(new Date(region.startDate), "dd/MM/yyyy hh:mm a", {
                  locale: enUS,
                })
              : "Not scheduled"}
          </p>
          <p className="text-gray-600 mt-1">
            <span className="font-semibold">End Date:</span>{" "}
            {region.endDate && !isNaN(new Date(region.endDate).getTime())
              ? format(new Date(region.endDate), "dd/MM/yyyy hh:mm a", {
                  locale: enUS,
                })
              : "Not scheduled"}
          </p>
          <p className="text-gray-600 mt-1">
            <span className="font-semibold">Status:</span>{" "}
            <span
              className={`${
                status.toLowerCase() === "completed"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </p>
          {status.toLowerCase() === "completed" && (
            <button
              onClick={() => {
                incompleteVisit();
              }}
              className="bg-red-600 text-white my-3 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 cursor-pointer"
            >
              Incomplete Visit
            </button>
          )}
        </div>
      </div>

      {/* Incomplete Visit Modal */}
      {showIncompleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Mark Visit as Incomplete
              </h2>
              <button
                onClick={() => setShowIncompleteModal(false)}
                className="text-red-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                You are about to mark the visit to{" "}
                <strong>{locationName}</strong> as incomplete.
              </p>
              <p className="text-gray-700 mb-4">
                Please provide a reason for marking this visit as incomplete:
              </p>
              <textarea
                value={incompleteNote}
                onChange={(e) => setIncompleteNote(e.target.value)}
                className="w-full border rounded p-2"
                rows="4"
                placeholder="Enter reason for incomplete visit..."
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowIncompleteModal(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleIncompleteSubmit}
                disabled={!incompleteNote.trim() || isSubmitting}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Mark as Incomplete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Map showing location's longitude and latitude */}
        {hasValidCoordinates ? (
          <div className="h-64 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <h5 className="font-semibold text-lg bg-gray-50 py-2 px-3 border-b">
              Location Map
            </h5>
            <MapContainer
              center={[latitude, longitude]}
              zoom={13}
              scrollWheelZoom={false}
              style={{ height: "calc(100% - 42px)", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[latitude, longitude]}>
                <Popup>{`Location: ${locationName}`}</Popup>
              </Marker>
            </MapContainer>
          </div>
        ) : (
          <div className="h-64 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50 text-gray-500">
            <div className="text-center p-6">
              <svg
                className="w-16 h-16 mx-auto text-gray-400 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                ></path>
              </svg>
              <h5 className="font-semibold text-lg">No Location Data</h5>
              <p className="mt-2">
                Coordinates are not available for this location.
              </p>
            </div>
          </div>
        )}

        {/* Conditional rendering of the visited map only if the status is 'completed' */}
        {status.toLowerCase() === "completed" ? (
          <div className="h-64 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <h5 className="font-semibold text-lg bg-gray-50 py-2 px-3 border-b">
              Visited Locations
            </h5>
            <MapContainer
              center={[
                parseFloat(region.endLatitude || latitude),
                parseFloat(region.endLongitude || longitude),
              ]}
              zoom={13}
              scrollWheelZoom={false}
              style={{ height: "calc(100% - 42px)", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {/* Start location marker */}
              {region.startLatitude && region.startLongitude && (
                <Marker
                  position={[
                    parseFloat(region.startLatitude),
                    parseFloat(region.startLongitude),
                  ]}
                  icon={
                    new L.Icon({
                      iconUrl:
                        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
                      shadowUrl:
                        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
                      iconSize: [25, 41],
                      iconAnchor: [12, 41],
                      popupAnchor: [1, -34],
                      shadowSize: [41, 41],
                    })
                  }
                >
                  <Popup>{`Start Location: ${locationName}`}</Popup>
                </Marker>
              )}

              {/* End location marker */}
              {region.endLatitude && region.endLongitude && (
                <Marker
                  position={[
                    parseFloat(region.endLatitude),
                    parseFloat(region.endLongitude),
                  ]}
                  icon={
                    new L.Icon({
                      iconUrl:
                        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
                      shadowUrl:
                        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
                      iconSize: [25, 41],
                      iconAnchor: [12, 41],
                      popupAnchor: [1, -34],
                      shadowSize: [41, 41],
                    })
                  }
                >
                  <Popup>{`End Location: ${locationName}`}</Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        ) : (
          <div className="h-64 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50 text-gray-500">
            <div className="text-center p-6">
              <svg
                className="w-16 h-16 mx-auto text-gray-400 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <h5 className="font-semibold text-lg">Visit Not Completed</h5>
              <p className="mt-2">
                The map will be available once the visit is completed.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add Note button with explicit toggle function */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={toggleNoteForm}
          type="button"
          className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-200 flex items-center gap-1"
        >
          <CgNotes size={16} />
          {noteFormVisible ? "Hide Note Form" : "Add Note"}
        </button>
      </div>

      {/* Render form based on noteFormVisible state */}
      {noteFormVisible && (
        <div className="mt-4">
          <LocationNoteForm
            planId={planId}
            locationId={locationId}
            onNoteSaved={() => {
              setNoteFormVisible(false);
              if (onDataRefresh) onDataRefresh();
            }}
          />
        </div>
      )}

      {/* Notes Section */}
      {region.notes && region.notes.length > 0 && (
        <div className="mt-6">
          <h5 className="font-semibold text-lg mb-2">Notes</h5>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            {region.notes.map((note, index) => (
              <div
                key={index}
                className={`${
                  index > 0 ? "mt-3 pt-3 border-t border-gray-200" : ""
                }`}
              >
                <p className="text-gray-700">{note.note}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {note.createdAt
                    ? new Date(note.createdAt).toLocaleString()
                    : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Main PlanDetail component
const PlanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchPlanDetails();
  }, [id]);

  const fetchPlanDetails = async () => {
    try {
      setIsLoading(true);
      const response = await planService.getPlanById(id);
      setPlan(response);
    } catch (error) {
      console.error("Error fetching plan details:", error);
      toast.error("Failed to load plan details");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle navigation to edit plan page
  const handleEditPlan = () => {
    navigate(`/plan/edit/${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Plan Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The plan you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <FiArrowLeft /> Go Back
        </button>
      </div>
    );
  }

  // Handle both old and new data structures
  const visitDate =
    plan.visitDate || plan.date || plan.startDate || new Date().toISOString();
  const regions = plan.region || plan.plans || plan.locations || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <FiArrowLeft className="mr-2" /> Back to Plans
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Plan Details</h1>
              <p className="text-gray-600 mt-1">
                {new Date(visitDate).toLocaleDateString("en-GB", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              {/* Edit Button */}
              {(user.role === "GM" || user.role === "HR") && (
                <button
                  onClick={handleEditPlan}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  <FiEdit /> Edit Plan
                </button>
              )}
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Completion:</span>
                  <span className="font-semibold">
                    {
                      regions.filter(
                        (r) => r.status?.toLowerCase() === "completed"
                      ).length
                    }{" "}
                    of {regions.length} locations
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Notes */}
        {plan.notes &&
          typeof plan.notes === "string" &&
          plan.notes.trim() !== "" && (
            <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
              <h5 className="font-semibold text-lg mb-2">Plan Notes</h5>
              <p className="text-gray-700">{plan.notes}</p>
            </div>
          )}

        {/* Regions/Plans/Locations */}
        {regions.length > 0 ? (
          <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
            <h5 className="font-semibold text-lg mb-2">
              Regions/Plans/Locations
            </h5>
            <div className="space-y-4">
              {/* Sort regions: incomplete first, then completed sorted by endDate (most recent first) */}
              {regions
                .slice()
                .sort((a, b) => {
                  // First sort by status: incomplete first, then completed
                  const statusA = a.status?.toLowerCase().trim() || "";
                  const statusB = b.status?.toLowerCase().trim() || "";
                  
                  if (statusA === "incomplete" && statusB === "completed") return -1;
                  if (statusA === "completed" && statusB === "incomplete") return 1;
                  
                  // If both are completed, sort by endDate (most recent first)
                  if (statusA === "completed" && statusB === "completed") {
                    // If endDate exists for both, compare them
                    if (a.endDate && b.endDate) {
                      return new Date(b.endDate) - new Date(a.endDate);
                    }
                    // If only one has endDate, prioritize the one with endDate
                    if (a.endDate) return -1;
                    if (b.endDate) return 1;
                  }
                  
                  return 0;
                })
                .map((region) => (
                  <PlanRegionCard
                    key={region._id || region.location?._id}
                    region={region}
                    planId={id}
                    onDataRefresh={fetchPlanDetails}
                  />
                ))}
            </div>
          </div>
        ) : (
          <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
            <h5 className="font-semibold text-lg mb-2">
              Regions/Plans/Locations
            </h5>
            <p className="text-gray-700">No regions/plans/locations found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanDetail;
