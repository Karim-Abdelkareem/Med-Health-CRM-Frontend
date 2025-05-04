import React, { useState } from "react";
import AddLocation from "./AddLocation";
import EditLocation from "./EditLocation";

export default function Location() {
  const [mode, setMode] = useState("add");

  const isSelected = (value) => mode === value;

  return (
    <div className="m-6">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Locations</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add Location Box */}
        <div
          onClick={() => setMode("add")}
          className={`cursor-pointer p-6 rounded-xl shadow-sm border-2 transition-all duration-300 transform hover:scale-105 ${
            isSelected("add")
              ? "bg-green-50 border-green-500 text-green-800 shadow-md"
              : "bg-gray-50 hover:bg-gray-100 border-gray-200"
          }`}
        >
          <h2 className="text-lg font-semibold text-center">Add Location</h2>
          {isSelected("add") && (
            <div className="flex justify-center mt-2">
              <svg
                className="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
          )}
        </div>

        {/* Edit Location Box */}
        <div
          onClick={() => setMode("edit")}
          className={`cursor-pointer p-6 rounded-xl shadow-sm border-2 transition-all duration-300 transform hover:scale-105 ${
            isSelected("edit")
              ? "bg-blue-50 border-blue-500 text-blue-800 shadow-md"
              : "bg-gray-50 hover:bg-gray-100 border-gray-200"
          }`}
        >
          <h2 className="text-lg font-semibold text-center">
            Edit/Delete Location
          </h2>
          {isSelected("edit") && (
            <div className="flex justify-center mt-2">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
          )}
        </div>
      </div>

      {mode === "add" && <AddLocation />}
      {mode === "edit" && <EditLocation />}
    </div>
  );
}
