// Reusable Input Component
export default function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div className="mb-4">
      <label
        htmlFor={label.toLowerCase().replace(/\s/g, "-")}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={label.toLowerCase().replace(/\s/g, "-")}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        required={required}
      />
    </div>
  );
}
