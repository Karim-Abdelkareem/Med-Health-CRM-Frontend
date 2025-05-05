import React, { useState, useEffect } from "react";
import { FiEdit, FiTrash } from "react-icons/fi"; // Import icons

export default function EditPlanModal({
  isOpen,
  onClose,
  onUpdate,
  selectedPlanData,
}) {
  const [visitDate, setVisitDate] = useState("");
  const [locationNotes, setLocationNotes] = useState([]);
  const [selectedLocationIndex, setSelectedLocationIndex] = useState(0);
  const [currentNote, setCurrentNote] = useState("");
  const [editingNoteIndex, setEditingNoteIndex] = useState(null); // Track which note is being edited

  useEffect(() => {
    if (selectedPlanData) {
      // Format date from ISO string to YYYY-MM-DD
      const formattedDate = selectedPlanData.visitDate
        ? new Date(selectedPlanData.visitDate).toISOString().split("T")[0]
        : "";

      setVisitDate(formattedDate);

      // Initialize the location notes from the existing plan data
      const initialLocationNotes = selectedPlanData.notes || [];
      setLocationNotes(initialLocationNotes);

      // Reset the selected location to the first one if available
      if (selectedPlanData.locations && selectedPlanData.locations.length > 0) {
        setSelectedLocationIndex(0);

        // Find note for first location if it exists
        const firstLocationId = selectedPlanData.locations[0].location._id;
        const firstLocationNote = initialLocationNotes.find(
          (note) =>
            note.location === firstLocationId ||
            (note.location._id && note.location._id === firstLocationId)
        );

        setCurrentNote(firstLocationNote ? firstLocationNote.note : "");
      } else {
        setCurrentNote("");
      }

      // Reset editing state
      setEditingNoteIndex(null);
    }
  }, [selectedPlanData]);

  // Helper function to find location note
  const findLocationNote = (plan, locationId) => {
    if (!plan.notes) return null;

    const noteObj = plan.notes.find(
      (note) =>
        note.location === locationId ||
        (note.location._id && note.location._id === locationId)
    );

    return noteObj ? noteObj.note : null;
  };

  // Handle location change in the dropdown
  const handleLocationChange = (e) => {
    const index = parseInt(e.target.value);
    setSelectedLocationIndex(index);

    if (selectedPlanData.locations[index]) {
      const locationId = selectedPlanData.locations[index].location._id;

      // Use the findLocationNote helper function
      const existingNote = findLocationNote(selectedPlanData, locationId);
      setCurrentNote(existingNote || "");
    } else {
      setCurrentNote("");
    }
  };

  // Handle saving the current note
  const handleSaveNote = () => {
    if (!selectedPlanData.locations[selectedLocationIndex]) return;

    const locationId =
      selectedPlanData.locations[selectedLocationIndex].location._id;

    // Check if a note for this location already exists
    const existingNoteIndex = locationNotes.findIndex(
      (note) =>
        note.location === locationId ||
        (note.location._id && note.location._id === locationId)
    );

    if (existingNoteIndex >= 0) {
      // Update existing note
      const updatedNotes = [...locationNotes];
      updatedNotes[existingNoteIndex] = {
        ...updatedNotes[existingNoteIndex],
        note: currentNote,
      };
      setLocationNotes(updatedNotes);
    } else {
      // Add new note
      setLocationNotes([
        ...locationNotes,
        {
          location: locationId,
          note: currentNote,
        },
      ]);
    }

    // Clear current note after saving
    setCurrentNote("");
  };

  // Handle editing a note
  const handleEditNote = (index) => {
    const note = locationNotes[index];

    // Find the location index in the dropdown
    let locationIndex = 0;
    if (selectedPlanData.locations) {
      const locationId =
        typeof note.location === "string" ? note.location : note.location._id;
      locationIndex = selectedPlanData.locations.findIndex(
        (loc) => loc.location._id === locationId
      );
      if (locationIndex === -1) locationIndex = 0;
    }

    // Set the location dropdown to the note's location
    setSelectedLocationIndex(locationIndex);

    // Set the current note text to the note being edited
    setCurrentNote(note.note || "");

    // Set the editing index to track which note is being edited
    setEditingNoteIndex(index);
  };

  // Handle deleting a note
  const handleDeleteNote = (index) => {
    const updatedNotes = [...locationNotes];
    updatedNotes.splice(index, 1);
    setLocationNotes(updatedNotes);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Save the current note before submitting if there's any content
    if (
      currentNote.trim() &&
      selectedPlanData.locations[selectedLocationIndex]
    ) {
      handleSaveNote();
    }

    const updatedPlan = {
      ...selectedPlanData,
      visitDate,
      notes: locationNotes,
    };

    onUpdate(updatedPlan);
    onClose();
  };

  if (!isOpen || !selectedPlanData) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Edit Plan</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Visit Date</label>
            <input
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="w-full border rounded p-2"
              required
            />
          </div>

          {selectedPlanData.locations &&
          selectedPlanData.locations.length > 0 ? (
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Select Location
                </label>
                <select
                  value={selectedLocationIndex}
                  onChange={handleLocationChange}
                  className="w-full border rounded p-2"
                >
                  {selectedPlanData.locations.map((loc, index) => (
                    <option key={index} value={index}>
                      {loc.location.locationName}
                    </option>
                  ))}
                </select>
              </div>

              {selectedPlanData.locations[selectedLocationIndex] && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="mb-2">
                    <span className="font-medium">
                      {
                        selectedPlanData.locations[selectedLocationIndex]
                          .location.locationName
                      }
                    </span>
                    <div className="text-sm text-gray-600">
                      {
                        selectedPlanData.locations[selectedLocationIndex]
                          .location.address
                      }
                    </div>
                    <div className="mt-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          selectedPlanData.locations[selectedLocationIndex]
                            .status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {
                          selectedPlanData.locations[selectedLocationIndex]
                            .status
                        }
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Location Note
                    </label>
                    <textarea
                      value={currentNote}
                      onChange={(e) => setCurrentNote(e.target.value)}
                      className="w-full border rounded p-2"
                      rows="3"
                      placeholder={`Add notes for ${selectedPlanData.locations[selectedLocationIndex].location.locationName}`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveNote}
                    className="mt-2 px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
                  >
                    {editingNoteIndex !== null ? "Update Note" : "Save Note"}
                  </button>

                  {editingNoteIndex !== null && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNoteIndex(null);
                        setCurrentNote("");
                      }}
                      className="mt-2 ml-2 px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              )}

              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">
                  Saved Location Notes
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {locationNotes.length > 0 ? (
                    locationNotes.map((note, index) => {
                      // Find the corresponding location to display its name
                      const matchingLocation = selectedPlanData.locations.find(
                        (loc) =>
                          loc.location._id === note.location ||
                          (typeof note.location === "object" &&
                            loc.location._id === note.location._id)
                      );

                      return (
                        <div
                          key={index}
                          className="p-2 bg-gray-100 rounded text-sm"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">
                                {matchingLocation
                                  ? matchingLocation.location.locationName
                                  : "Unknown Location"}
                              </div>
                              <div className="text-gray-700 mt-1">
                                {note.note}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={() => handleEditNote(index)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <FiEdit size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteNote(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <FiTrash size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-gray-500">
                      No notes saved yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">
                No locations available for this plan
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
