import React from "react";

export default function PlanCard({ plan, isSelected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer p-6 rounded-xl shadow-sm border-2 transition-all duration-300 transform hover:scale-105 ${
        isSelected
          ? "bg-blue-50 border-blue-500 text-blue-800 shadow-md"
          : "bg-gray-50 hover:bg-gray-100 border-gray-200"
      }`}
    >
      <h2 className="text-lg font-semibold text-center">{plan.label}</h2>

      {isSelected && (
        <div className="flex justify-center mt-2">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
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
  );
}
