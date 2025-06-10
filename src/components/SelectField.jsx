import React from "react";
import Select from "react-select";

// Reusable Select Component
export default function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  disabled = false,
  isMulti = false,
}) {
  // Convert the value to the format expected by react-select
  const selectedValue = isMulti
    ? options?.filter((option) => value?.includes(option.value)) || []
    : options?.find((option) => option.value === value) || null;

  // Handle change event
  const handleChange = (selectedOption) => {
    onChange({
      target: {
        value: isMulti ? selectedOption || [] : selectedOption?.value || "",
      },
    });
  };

  return (
    <div className="mb-4">
      <label
        htmlFor={label.toLowerCase().replace(/\s/g, "-")}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Select
        id={label.toLowerCase().replace(/\s/g, "-")}
        value={selectedValue}
        onChange={handleChange}
        options={options}
        placeholder={placeholder}
        isDisabled={disabled}
        isSearchable={true}
        isMulti={isMulti}
        className="react-select-container"
        classNamePrefix="react-select"
        styles={{
          control: (base) => ({
            ...base,
            minHeight: "42px",
            borderColor: "#D1D5DB",
            "&:hover": {
              borderColor: "#2563EB",
            },
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
              ? "#2563EB"
              : state.isFocused
              ? "#EFF6FF"
              : "white",
            color: state.isSelected ? "white" : "#374151",
            "&:hover": {
              backgroundColor: state.isSelected ? "#2563EB" : "#EFF6FF",
            },
          }),
          multiValue: (base) => ({
            ...base,
            backgroundColor: "#EFF6FF",
            borderRadius: "9999px",
          }),
          multiValueLabel: (base) => ({
            ...base,
            color: "#2563EB",
            padding: "2px 8px",
          }),
          multiValueRemove: (base) => ({
            ...base,
            color: "#2563EB",
            ":hover": {
              backgroundColor: "#DBEAFE",
              color: "#1D4ED8",
            },
          }),
        }}
      />
    </div>
  );
}
