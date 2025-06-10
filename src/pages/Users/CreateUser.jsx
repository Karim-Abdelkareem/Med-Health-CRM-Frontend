import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createUser } from "../../store/User/UserSlice";
import {
  FiUser,
  FiMail,
  FiLock,
  FiUsers,
  FiMap,
  FiArrowLeft,
} from "react-icons/fi";
import toast from "react-hot-toast";
import userService from "../../store/User/UserService";

export default function CreateUser() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    governate: "",
    LM: "",
    DM: "",
  });

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Lists for dropdowns
  const [lineManagers, setLineManagers] = useState([]);
  const [districtManagers, setDistrictManagers] = useState([]);

  // Role options
  const roleOptions = [
    { value: "R", label: "Representative" },
    { value: "LM", label: "Line Manager" },
    { value: "DM", label: "District Manager" },
    { value: "GM", label: "General Manager" },
    { value: "HR", label: "HR" },
  ];

  // Governate options
  const governates = [
    { value: "Faiyum", label: "Faiyum" },
    { value: "BaniSewif", label: "Bani Sewif" },
    { value: "Minya", label: "Minya" },
    { value: "Asyut", label: "Asyut" },
    { value: "Sohag", label: "Sohag" },
    { value: "Qena", label: "Qena" },
    { value: "Luxor", label: "Luxor" },
    { value: "Aswan", label: "Aswan" },
  ];

  // Fetch line managers and district managers
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        // Fetch district managers
        const dmResponse = await userService.getUsersByRole("DM");
        setDistrictManagers(dmResponse.data || []);

        // Fetch line managers
        const lmResponse = await userService.getUsersByRole("LM");
        setLineManagers(lmResponse.data || []);
      } catch (error) {
        console.error("Error fetching managers:", error);
      }
    };

    fetchManagers();
  }, []);

  // Form validation
  useEffect(() => {
    const { name, email, password, role } = formData;

    // Basic validation
    const isValid =
      name.trim() !== "" &&
      email.trim() !== "" &&
      password.trim() !== "" &&
      role !== "";

    // Additional validation for specific roles
    if (role === "R" && (!formData.LM || !formData.governate)) {
      setIsFormValid(false);
    } else if (role === "LM" && !formData.governate) {
      setIsFormValid(false);
    } else if (role === "DM" && (!formData.LM || !formData.governate)) {
      setIsFormValid(false);
    } else {
      setIsFormValid(isValid);
    }
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Reset dependent fields when role changes
    if (name === "role") {
      const updatedData = { ...formData, [name]: value };

      // Reset LM for non-R and non-DM roles
      if (value !== "R" && value !== "DM") {
        updatedData.LM = "";
      }

      // Reset governate for roles that don't need it
      if (value !== "R" && value !== "LM" && value !== "DM") {
        updatedData.governate = "";
      }

      setFormData(updatedData);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) return;

    // Create user data object based on role
    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };

    console.log(userData);

    // Add role-specific fields
    if (formData.role === "R") {
      userData.LM = formData.LM;
      userData.governate = formData.governate;
    } else if (formData.role === "LM") {
      userData.governate = formData.governate;
    } else if (formData.role === "DM") {
      userData.LM = formData.LM;
      userData.governate = formData.governate;
    }

    try {
      setIsSaving(true);
      await dispatch(createUser(userData)).unwrap();
      toast.success("User created successfully");
      navigate("/users");
    } catch (error) {
      toast.error(error.message || "Failed to create user");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center mb-10">
          <button
            onClick={() => navigate("/users")}
            className="mr-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <FiArrowLeft size={24} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Create User</h1>
            <p className="text-gray-500 mt-1">Add a new user to the system</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="space-y-12">
            {/* Basic Information Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-6">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="flex items-center text-gray-700 font-medium mb-2">
                    <FiUser className="mr-2" />
                    Full Name <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors bg-gray-50"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center text-gray-700 font-medium mb-2">
                    <FiMail className="mr-2" />
                    Email Address <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors bg-gray-50"
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>

              <div className="mt-8">
                <label className="flex items-center text-gray-700 font-medium mb-2">
                  <FiLock className="mr-2" />
                  Password <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors bg-gray-50"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            {/* Role & Location Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-6">
                Role & Location
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="flex items-center text-gray-700 font-medium mb-2">
                    <FiUsers className="mr-2" />
                    User Role <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 appearance-none"
                    required
                  >
                    <option value="">Select role</option>
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Conditional Fields Based on Role */}
                {(formData.role === "R" ||
                  formData.role === "LM" ||
                  formData.role === "DM") && (
                  <div>
                    <label className="flex items-center text-gray-700 font-medium mb-2">
                      <FiMap className="mr-2" />
                      Governate <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      name="governate"
                      value={formData.governate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 appearance-none"
                      required
                    >
                      <option value="">Select governate</option>
                      {governates.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Line Manager field for Representatives and DM */}
              {(formData.role === "R" || formData.role === "DM") && (
                <div className="mt-8">
                  <label className="flex items-center text-gray-700 font-medium mb-2">
                    <FiUsers className="mr-2" />
                    Line Manager <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    name="LM"
                    value={formData.LM}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 appearance-none"
                    required
                  >
                    <option value="">Select line manager</option>
                    {lineManagers.map((lm) => (
                      <option key={lm._id} value={lm._id}>
                        {lm.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="mt-16 flex justify-end space-x-6">
            <button
              type="button"
              onClick={() => navigate("/users")}
              className="px-6 py-3 text-gray-700 font-medium hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid || isSaving}
              className={`px-6 py-3 rounded-md text-white font-medium transition-colors ${
                isFormValid && !isSaving
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-300 cursor-not-allowed"
              }`}
            >
              {isSaving ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                "Create User"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
