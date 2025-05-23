import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import { format } from "date-fns";
import toast from "react-hot-toast";
import planService from "../../store/Plan/planyService";
import LoadingSpinner from "../../components/LoadingSpinner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import locationService from "../../store/Location/locationService";

const EditPlan = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [planNotes, setPlanNotes] = useState("");
  const [locations, setLocations] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);

  useEffect(() => {
    fetchPlanDetails();
    fetchAvailableLocations();
  }, [id]);

  const fetchPlanDetails = async () => {
    try {
      setIsLoading(true);
      const response = await planService.getPlanById(id);
      setPlan(response);

      // Set form states with existing data
      setPlanNotes(response.notes || "");

      // Handle locations based on the plan structure
      const regions =
        response.region || response.plans || response.locations || [];

      const mappedLocations = regions.map((region) => {
        // Debug the region structure

        // Determine the location ID - it could be in various places
        const locationId =
          // If it's an object with a location object that has an _id
          (region.location &&
            typeof region.location === "object" &&
            region.location._id) ||
          // If it's an object with a location that is an ID string
          (region.location &&
            typeof region.location === "string" &&
            region.location) ||
          // If it's just a string ID directly on the region
          region._id;

        return {
          id: region._id || `temp-${Date.now()}`,
          locationId: locationId, // Store the location ID for reference
          locationName:
            (region.location && region.location.locationName) ||
            region.locationName ||
            "Unknown Location",
          startDate: region.startDate ? new Date(region.startDate) : null,
          endDate: region.endDate ? new Date(region.endDate) : null,
          status: region.status || "incomplete",
          notes: region.notes || [],
          coordinates: region.coordinates || null,
        };
      });

      setLocations(mappedLocations);
    } catch (error) {
      console.error("Error fetching plan details:", error);
      toast.error("Failed to load plan details");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableLocations = async () => {
    try {
      const response = await locationService.getAllLocations();

      if (response.status === 200) {
        setAvailableLocations(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch locations:", error);
      toast.error("Failed to load locations");
    }
  };

  // Update location field handler
  const handleLocationChange = (index, field, value) => {
    const updatedLocations = [...locations];
    updatedLocations[index] = { ...updatedLocations[index], [field]: value };
    setLocations(updatedLocations);
  };

  // Add new location handler
  const handleAddLocation = () => {
    setLocations([
      ...locations,
      {
        id: `temp-${Date.now()}`, // Temporary ID for new locations
        locationId: "", // Will be set when user selects a location
        locationName: "",
        status: "incomplete",
        startDate: null,
        endDate: null,
        coordinates: null,
      },
    ]);
  };

  // Remove location handler
  const handleRemoveLocation = (index) => {
    const updatedLocations = [...locations];
    updatedLocations.splice(index, 1);
    setLocations(updatedLocations);
  };

  // Save changes handler
  const handleSave = async () => {
    if (isSaving) return;

    // Validate that all locations have a locationId
    const invalidLocations = locations.filter((loc) => !loc.locationId);
    if (invalidLocations.length > 0) {
      toast.error("Please select a location for all entries");
      return;
    }

    setIsSaving(true);
    try {
      // Format the locations data for the API
      const formattedLocations = locations.map((loc) => ({
        location: loc.locationId, // Use locationId as the reference to the location
        locationName: loc.locationName,
        status: loc.status,
        startDate: loc.startDate,
        endDate: loc.endDate,
        coordinates: loc.coordinates,
      }));

      // Create the updated plan object
      const updatedPlan = {
        notes: planNotes,
        locations: formattedLocations,
      };

      // Call the API to update the plan
      await planService.updatePlan(plan._id, updatedPlan);
      toast.success("Plan updated successfully");
      navigate(-1);
    } catch (error) {
      console.error("Failed to update plan:", error);
      toast.error("Failed to update plan");
    } finally {
      setIsSaving(false);
    }
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
          The plan you're trying to edit doesn't exist or has been removed.
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

  // Extract visit date for display
  const visitDate =
    plan.visitDate || plan.date || plan.startDate || new Date().toISOString();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <FiArrowLeft className="mr-2" /> Back to Plan Details
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Edit Plan</h1>
              <p className="text-gray-600 mt-1">
                {new Date(visitDate).toLocaleDateString("en-GB", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 ${
                  isSaving ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                <FiSave /> {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* Plan Notes Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Plan Notes
          </h2>
          <textarea
            value={planNotes}
            onChange={(e) => setPlanNotes(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Add notes about this plan..."
          />
        </div>

        {/* Locations Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Locations</h2>
            <button
              onClick={handleAddLocation}
              className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-200"
            >
              + Add Location
            </button>
          </div>

          {locations.length === 0 ? (
            <p className="text-gray-500 italic">No locations added yet.</p>
          ) : (
            <div className="space-y-6">
              {locations.map((location, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex justify-between mb-4">
                    <h3 className="font-medium text-gray-800">
                      Location #{index + 1}
                    </h3>
                    <button
                      onClick={() => handleRemoveLocation(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Location Name */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <select
                        value={location.locationId || ""}
                        onChange={(e) => {
                          const selectedId = e.target.value;

                          if (!selectedId) {
                            // Handle clearing the selection
                            const updatedLocation = {
                              ...location,
                              locationId: "",
                              locationName: "",
                              coordinates: null,
                            };
                            const newLocations = [...locations];
                            newLocations[index] = updatedLocation;
                            setLocations(newLocations);
                            return;
                          }

                          const selectedLocation = availableLocations.find(
                            (loc) => loc._id === selectedId
                          );

                          if (selectedLocation) {
                            // Create a new location object with all updated fields
                            const updatedLocation = {
                              ...location,
                              locationId: selectedId,
                              locationName: selectedLocation.locationName,
                            };

                            // If location has coordinates, add those too
                            if (
                              selectedLocation.latitude &&
                              selectedLocation.longitude
                            ) {
                              updatedLocation.coordinates = [
                                selectedLocation.latitude,
                                selectedLocation.longitude,
                              ];
                            }

                            // Update the entire location object at once
                            const newLocations = [...locations];
                            newLocations[index] = updatedLocation;
                            setLocations(newLocations);
                          }
                        }}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a location</option>
                        {availableLocations.map((loc) => (
                          <option key={loc._id} value={loc._id}>
                            {loc.locationName} - {loc.address || ""},{" "}
                            {loc.city || ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status, Start Date, and End Date on the same line */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 col-span-2">
                      {/* Status */}
                      <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={location.status}
                          onChange={(e) =>
                            handleLocationChange(
                              index,
                              "status",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="incomplete">Incomplete</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>

                      {/* Start Date */}
                      <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date & Time
                        </label>
                        <div className="w-full">
                          <DatePicker
                            selected={location.startDate}
                            onChange={(date) =>
                              handleLocationChange(index, "startDate", date)
                            }
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            showTimeSelect
                            dateFormat="dd/MM/yyyy h:mm aa"
                            placeholderText="Select date and time"
                            wrapperClassName="w-full"
                          />
                        </div>
                      </div>

                      {/* End Date */}
                      <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date & Time
                        </label>
                        <div className="w-full">
                          <DatePicker
                            selected={location.endDate}
                            onChange={(date) =>
                              handleLocationChange(index, "endDate", date)
                            }
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            showTimeSelect
                            dateFormat="dd/MM/yyyy h:mm aa"
                            placeholderText="Select date and time"
                            wrapperClassName="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 ${
              isSaving ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPlan;
