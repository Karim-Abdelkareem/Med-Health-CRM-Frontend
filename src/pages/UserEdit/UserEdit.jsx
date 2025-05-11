import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import userService from "../../store/User/UserService";
import { FiUser, FiMail, FiUsers, FiMap, FiArrowLeft } from "react-icons/fi";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

export default function UserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    governate: "",
    LM: "",
    DM: "",
    Area: "",
  });

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Lists for dropdowns
  const [lineManagers, setLineManagers] = useState([]);
  const [districtManagers, setDistrictManagers] = useState([]);
  const [areaManagers, setAreaManagers] = useState([]);

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

  // Define role hierarchy (higher index = higher permission)
  const roleHierarchy = ["R", "DM", "Area", "LM", "HR", "GM"];

  // Filter role options based on logged-in user's role
  const getFilteredRoleOptions = () => {
    const userRoleIndex = roleHierarchy.indexOf(user?.role);
    
    // Define all possible role options
    const allRoleOptions = [
      { value: "R", label: "Representative" },
      { value: "DM", label: "District Manager" },
      { value: "Area", label: "Area Sales Manager" },
      { value: "LM", label: "Line Manager" },
      { value: "HR", label: "HR" },
      { value: "GM", label: "General Manager" },
    ];
    
    // If user is GM or HR, show all roles
    if (user?.role === "GM" || user?.role === "HR") {
      return allRoleOptions;
    }
    
    // Otherwise, filter roles based on hierarchy
    return allRoleOptions.filter(role => {
      const roleIndex = roleHierarchy.indexOf(role.value);
      return roleIndex < userRoleIndex; // Only show roles with lower permission level
    });
  };

  // Role options
  const roleOptions = getFilteredRoleOptions();

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await userService.getUserById(id);
        const userData = response.data;

        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          role: userData.role || "",
          governate: userData.governate || "",
          LM: userData.LM?._id || userData.LM || "",
          DM: userData.DM?._id || userData.DM || "",
          Area: userData.Area?._id || userData.Area || "",
        });
      } catch (error) {
        toast.error("Failed to fetch user data");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchUserData();
    }
  }, [id]);

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

        // Fetch area managers
        const areaResponse = await userService.getUsersByRole("Area");
        setAreaManagers(areaResponse.data || []);
      } catch (error) {
        console.error("Error fetching managers:", error);
      }
    };

    fetchManagers();
  }, []);

  // Form validation
  useEffect(() => {
    const { name, email, role } = formData;

    // Basic validation
    const isValid = name.trim() !== "" && email.trim() !== "" && role !== "";

    // Additional validation for specific roles
    if (role === "R" && (!formData.LM || !formData.governate || !formData.Area || !formData.DM)) {
      setIsFormValid(false);
    } else if (role === "DM" && (!formData.LM || !formData.Area || !formData.governate)) {
      setIsFormValid(false);
    } else if (role === "LM" && !formData.governate) {
      setIsFormValid(false);
    } else if (role === "Area" && !formData.LM) {
      setIsFormValid(false);
    } else {
      setIsFormValid(isValid);
    }
  }, [formData]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Reset dependent fields when role changes
    if (name === "role") {
      const updatedData = { ...formData, [name]: value };

      // Reset fields based on role
      if (value !== "R" && value !== "DM") {
        updatedData.LM = "";
        updatedData.Area = "";
      }

      if (value !== "R") {
        updatedData.DM = "";
      }

      // Reset governate for roles that don't need it
      if (value !== "R" && value !== "LM" && value !== "DM" && value !== "Area") {
        updatedData.governate = "";
      }

      setFormData(updatedData);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) return;

    // Create user data object based on role
    const userData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
    };

    // Add role-specific fields
    if (formData.role === "R") {
      userData.LM = formData.LM;
      userData.Area = formData.Area;
      userData.DM = formData.DM;
      userData.governate = formData.governate;
    } else if (formData.role === "DM") {
      userData.LM = formData.LM;
      userData.Area = formData.Area;
      userData.governate = formData.governate;
    } else if (formData.role === "LM") {
      userData.governate = formData.governate;
    } else if (formData.role === "Area") {
      userData.LM = formData.LM;
    }

    try {
      setIsSaving(true);
      await userService.updateUser(id, userData);
      toast.success("User updated successfully");
      navigate("/users");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-800">Edit User</h1>
            <p className="text-gray-500 mt-1">
              Update user information and role
            </p>
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
                  formData.role === "DM" ||
                  formData.role === "Area") && (
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

              {/* Line Manager field */}
              {(formData.role === "R" || formData.role === "DM" || formData.role === "Area") && (
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

              {/* Area Manager field */}
              {(formData.role === "R" || formData.role === "DM") && (
                <div className="mt-8">
                  <label className="flex items-center text-gray-700 font-medium mb-2">
                    <FiUsers className="mr-2" />
                    Area Manager <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    name="Area"
                    value={formData.Area}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 appearance-none"
                    required
                  >
                    <option value="">Select area manager</option>
                    {areaManagers.map((area) => (
                      <option key={area._id} value={area._id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* District Manager field */}
              {formData.role === "R" && (
                <div className="mt-8">
                  <label className="flex items-center text-gray-700 font-medium mb-2">
                    <FiUsers className="mr-2" />
                    District Manager <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    name="DM"
                    value={formData.DM}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 appearance-none"
                    required
                  >
                    <option value="">Select district manager</option>
                    {districtManagers.map((dm) => (
                      <option key={dm._id} value={dm._id}>
                        {dm.name}
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
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
