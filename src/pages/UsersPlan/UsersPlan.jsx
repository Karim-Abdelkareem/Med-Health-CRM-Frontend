import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import React, { useEffect, useState } from "react";
import userService from "../../store/User/UserService";
import planService from "../../store/Plan/planyService";
import { toast } from "react-hot-toast";
import { CgNotes } from "react-icons/cg";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";

// Reusable Select Input Component
const SelectInput = ({ id, label, value, onChange, options, placeholder }) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-lg font-medium text-gray-700 mb-2"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          className="block w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer transition duration-200"
        >
          <option value="">{placeholder || "Select an option"}</option>
          {options.map((option) => (
            <option
              key={option.value || option._id}
              value={option.value || option._id}
            >
              {option.label || option.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg
            className="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// Reusable Date Input Component
const DateInput = ({ label, value, onChange }) => {
  return (
    <div className="flex-1">
      <h3 className="mb-2 text-lg font-medium text-gray-700 capitalize">
        {label}:
      </h3>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-2 border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
      />
    </div>
  );
};

// Add a new component for adding notes to a location
const LocationNoteForm = ({ planId, locationId, onNoteSaved }) => {
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;

    try {
      setIsSubmitting(true);
      // Use addRoleBasedNotesToPlan instead of addNotesToPlanLocation
      await planService.addRoleBasedNotesToPlan(planId, locationId, note);
      toast.success("Note added successfully");
      setNote(""); // Clear the input
      if (onNoteSaved) onNoteSaved(); // Callback to refresh data
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Failed to add note");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="flex flex-col space-y-2">
        <label
          htmlFor="locationNote"
          className="text-sm font-medium text-gray-700"
        >
          Add Note
        </label>
        <textarea
          id="locationNote"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="border border-gray-300 rounded-md p-2 text-sm"
          rows="3"
          placeholder="Enter your note for this location..."
        />
        <button
          type="submit"
          disabled={!note.trim() || isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Save Note"}
        </button>
      </div>
    </form>
  );
};

// Plan Region Card Component
const PlanRegionCard = ({ region, onDataRefresh }) => {
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [incompleteNote, setIncompleteNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the plan ID from the region or parent plan
  const planId =
    region.planId || region._parentPlan?.id || region.parentPlan?.id;
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

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4 hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-gray-800">{locationName}</h4>
          <p className="text-gray-600 mt-1">
            <span className="font-semibold">Visit Date:</span>{" "}
            {region.visitDate
              ? new Date(region.visitDate).toLocaleDateString("en-GB")
              : "Not scheduled"}
          </p>
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

      {/* Add a button to toggle the note form */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => setShowNoteForm(!showNoteForm)}
          className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-200 flex items-center gap-1"
        >
          <CgNotes size={16} />
          {showNoteForm ? "Hide Note Form" : "Add Note"}
        </button>
      </div>

      {/* Show the note form when the button is clicked */}
      {showNoteForm && planId && locationId && (
        <LocationNoteForm
          planId={planId}
          locationId={locationId}
          onNoteSaved={() => {
            setShowNoteForm(false);
            if (onDataRefresh) onDataRefresh();
          }}
        />
      )}

      {/* Notes Section */}
      {region.notes && region.notes.length > 0 && (
        <div className="mt-6">
          <h5 className="font-semibold text-lg mb-2">Notes</h5>
          <div className="space-y-2">
            {region.notes.map((note, idx) => (
              <div
                key={idx}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                {typeof note === "string" ? (
                  <p>{note}</p>
                ) : (
                  <div>
                    {note.location && (
                      <div className="mb-1 text-sm text-gray-600">
                        <span className="font-medium">Location:</span>{" "}
                        {typeof note.location === "string"
                          ? note.location
                          : note.location.locationName || "Unknown Location"}
                      </div>
                    )}
                    <div className="text-gray-700">
                      {note.note || "No note content"}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Plan Card Component
const PlanCard = ({ plan, onDataRefresh }) => {
  // Handle both old and new data structures
  const visitDate =
    plan.visitDate || plan.date || plan.startDate || new Date().toISOString();

  // Handle regions/plans array
  const regions = plan.region || plan.plans || plan.locations || [];

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-6 hover:shadow-lg transition-shadow duration-300">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Plan Details</h3>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-lg text-gray-700">
              <span className="font-semibold">Date:</span>{" "}
              {new Date(visitDate).toLocaleDateString("en-GB")}
            </p>
          </div>
        </div>
      </div>

      <h4 className="text-lg font-semibold text-gray-800 mb-4">
        Regions ({regions.length})
      </h4>

      {regions.map((region, index) => {
        // Create a new region object with the plan's visitDate as a fallback
        const regionWithFallback = {
          ...region,
          _parentPlan: { visitDate, id: plan._id }, // Add plan ID to parent plan reference
          visitDate: region.visitDate || visitDate, // Use region's visitDate if available, otherwise use plan's
          planId: plan._id, // Add plan ID directly to region
        };

        return (
          <PlanRegionCard
            key={region._id || index}
            region={regionWithFallback}
            onDataRefresh={onDataRefresh}
          />
        );
      })}
    </div>
  );
};

// Empty State Component
const EmptyState = ({ title, message, icon }) => {
  return (
    <div className="bg-white p-10 rounded-xl border border-gray-200 text-center">
      <div className="flex flex-col items-center justify-center">
        {icon}
        <h3 className="mt-4 text-2xl font-semibold text-gray-700">{title}</h3>
        {message && <p className="mt-2 text-gray-500">{message}</p>}
      </div>
    </div>
  );
};

export default function UsersPlan() {
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [users, setUsers] = useState([]);
  const currentDate = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(currentDate);
  const [endDate, setEndDate] = useState(currentDate);
  const [plansData, setPlansData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Add a function to refresh the data
  const refreshData = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Role options
  const roleOptions = [
    { label: "Line Manager", value: "LM" },
    { label: "Area Sales Manager", value: "Area" },
    { label: "District Manager", value: "DM" },
    { label: "Representative", value: "R" },
  ];

  // Fetch users based on role
  const fetchUsersByRole = async () => {
    if (!selectedRole) return;

    setIsLoading(true);
    try {
      const response = await userService.getUsersByRole(selectedRole);
      setUsers(response.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRole) {
      fetchUsersByRole();
    }
  }, [selectedRole]);

  // Fetch plans
  const getMonthlyPlans = async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      const response = await planService.getMonthlyPlans(
        startDate,
        endDate,
        selectedUser
      );
      setPlansData(response.data);
    } catch (err) {
      console.error("Error fetching plans:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      getMonthlyPlans();
    }
  }, [selectedUser, startDate, endDate, refreshTrigger]);

  // Handle role change
  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    setSelectedUser("");
    setPlansData([]);
  };

  // Handle user change
  const handleUserChange = (e) => {
    setSelectedUser(e.target.value);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">User Plans</h1>

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectInput
            id="role-select"
            label="Select Role"
            value={selectedRole}
            onChange={handleRoleChange}
            options={roleOptions}
            placeholder="Select Role"
          />

          {selectedRole && (
            <div className="animate-fadeIn">
              <SelectInput
                id="user-select"
                label="Select User"
                value={selectedUser}
                onChange={handleUserChange}
                options={users || []}
                placeholder={isLoading ? "Loading users..." : "Select User"}
              />
            </div>
          )}
        </div>
      </div>

      {/* Plans Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">User Plans</h2>
          {selectedUser && (
            <button
              onClick={getMonthlyPlans}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-300 flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                ></path>
              </svg>
              Refresh
            </button>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          {selectedUser ? (
            <>
              <div className="flex flex-col sm:flex-row gap-6 mb-8">
                <DateInput
                  label="Start Date"
                  value={startDate}
                  onChange={setStartDate}
                />
                <DateInput
                  label="End Date"
                  value={endDate}
                  onChange={setEndDate}
                />
              </div>

              {isLoading ? (
                <div className="py-12 flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : plansData.length > 0 ? (
                <div>
                  {plansData.map((plan) => (
                    <PlanCard
                      key={plan._id}
                      plan={plan}
                      onDataRefresh={refreshData}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No Plans Found"
                  message="Try adjusting your date range to see more results."
                  icon={
                    <svg
                      className="w-16 h-16 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      ></path>
                    </svg>
                  }
                />
              )}
            </>
          ) : (
            <EmptyState
              title="No User Selected"
              message="Please select a role and user to view their plans."
              icon={
                <svg
                  className="w-16 h-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
