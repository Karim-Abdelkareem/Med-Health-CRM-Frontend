import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import userService from "../../store/User/UserService";
import {
  FiUser,
  FiMail,
  FiUsers,
  FiMap,
  FiArrowLeft,
  FiLock,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

// --- Constants ---
const GOVERNATES = [
  { value: "All", label: "All" },
  {
    value: "Faiyum-BaniSewif-Minya-Assuit",
    label: "Faiyum - Bani Sewif - Minya - Assuit",
  },
  { value: "Sohag-Qena-Luxor-Aswan", label: "Sohag - Qena - Luxor - Aswan" },
  { value: "Faiyum", label: "Faiyum" },
  { value: "BaniSewif", label: "Bani Sewif" },
  { value: "Minya", label: "Minya" },
  { value: "Asyut", label: "Asyut" },
  { value: "Sohag", label: "Sohag" },
  { value: "Qena", label: "Qena" },
  { value: "Luxor", label: "Luxor" },
  { value: "Aswan", label: "Aswan" },
];

const ROLE_HIERARCHY = ["R", "DM", "Area", "LM", "HR", "GM"];
const ALL_ROLE_OPTIONS = [
  { value: "R", label: "Representative" },
  { value: "DM", label: "District Manager" },
  { value: "Area", label: "Area Sales Manager" },
  { value: "LM", label: "Line Manager" },
  { value: "HR", label: "HR" },
  { value: "GM", label: "General Manager" },
];

// --- Utility Components ---
function InputField({ label, icon: Icon, ...props }) {
  return (
    <div>
      <label className="flex items-center text-gray-700 font-medium mb-2">
        {Icon && <Icon className="mr-2" />} {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        {...props}
        className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors bg-gray-50"
      />
    </div>
  );
}

function SelectField({ label, icon: Icon, options, ...props }) {
  return (
    <div>
      <label className="flex items-center text-gray-700 font-medium mb-2">
        {Icon && <Icon className="mr-2" />} {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        {...props}
        className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 appearance-none"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option
            key={option.value || option._id}
            value={option.value || option._id}
          >
            {option.label || option.name}
          </option>
        ))}
      </select>
    </div>
  );
}

// --- Custom Hooks ---
/**
 * Custom hook for user edit logic (fetch, update, validation)
 */
function useUserEditLogic(id, user) {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    role: "",
    governate: "",
    LM: "",
    DM: "",
    Area: "",
  });
  const [lineManagers, setLineManagers] = React.useState([]);
  const [districtManagers, setDistrictManagers] = React.useState([]);
  const [areaManagers, setAreaManagers] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isFormValid, setIsFormValid] = React.useState(false);

  React.useEffect(() => {
    async function fetchUserData() {
      setIsLoading(true);
      try {
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
      } catch {
        toast.error("Failed to fetch user data");
      } finally {
        setIsLoading(false);
      }
    }
    if (id) fetchUserData();
  }, [id]);

  React.useEffect(() => {
    async function fetchManagers() {
      try {
        setDistrictManagers(
          (await userService.getUsersByRole("DM")).data || []
        );
        setLineManagers((await userService.getUsersByRole("LM")).data || []);
        setAreaManagers((await userService.getUsersByRole("Area")).data || []);
      } catch {
        // silent
      }
    }
    fetchManagers();
  }, []);

  React.useEffect(() => {
    const { name, email, role } = formData;
    const isValid = name.trim() !== "" && email.trim() !== "" && role !== "";
    if (
      role === "R" &&
      (!formData.LM || !formData.governate || !formData.Area || !formData.DM)
    )
      setIsFormValid(false);
    else if (
      role === "DM" &&
      (!formData.LM || !formData.Area || !formData.governate)
    )
      setIsFormValid(false);
    else if (role === "LM" && !formData.governate) setIsFormValid(false);
    else if (role === "Area" && !formData.LM) setIsFormValid(false);
    else setIsFormValid(isValid);
  }, [formData]);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "role") {
      const updatedData = { ...formData, [name]: value };
      if (value !== "R" && value !== "DM") {
        updatedData.LM = "";
        updatedData.Area = "";
      }
      if (value !== "R") updatedData.DM = "";
      if (!["R", "LM", "DM", "Area"].includes(value))
        updatedData.governate = "";
      setFormData(updatedData);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  }

  function getFilteredRoleOptions() {
    const userRoleIndex = ROLE_HIERARCHY.indexOf(user?.role);
    if (user?.role === "GM" || user?.role === "HR") return ALL_ROLE_OPTIONS;
    return ALL_ROLE_OPTIONS.filter(
      (role) => ROLE_HIERARCHY.indexOf(role.value) < userRoleIndex
    );
  }

  return {
    formData,
    setFormData,
    lineManagers,
    districtManagers,
    areaManagers,
    isLoading,
    isSaving,
    setIsSaving,
    isFormValid,
    handleChange,
    getFilteredRoleOptions,
  };
}

/**
 * Custom hook for password change logic
 */
function usePasswordChangeLogic() {
  const [passwordData, setPasswordData] = React.useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isPasswordFormValid, setIsPasswordFormValid] = React.useState(false);
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [currentUserPassword, setCurrentUserPassword] = React.useState("");

  React.useEffect(() => {
    const { password, confirmPassword } = passwordData;
    const hasMinLength = password.length >= 8;
    const passwordsMatch = password === confirmPassword;
    setIsPasswordFormValid(password !== "" && hasMinLength && passwordsMatch);
  }, [passwordData]);

  return {
    passwordData,
    setPasswordData,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    isPasswordFormValid,
    isChangingPassword,
    setIsChangingPassword,
    showPasswordModal,
    setShowPasswordModal,
    currentUserPassword,
    setCurrentUserPassword,
  };
}

// --- Modal Component ---
function PasswordConfirmationModal({
  show,
  onCancel,
  onConfirm,
  currentUserPassword,
  setCurrentUserPassword,
  disabled,
}) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Confirm Password Change
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Please enter your current password to confirm this change.
        </p>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Your Password
          </label>
          <input
            type="password"
            value={currentUserPassword}
            onChange={(e) => setCurrentUserPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your current password"
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={disabled}
            className={`px-4 py-2 rounded-md text-white ${
              disabled
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Confirm Change
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---
export default function UserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Form logic
  const {
    formData,
    lineManagers,
    districtManagers,
    areaManagers,
    isLoading,
    isSaving,
    setIsSaving,
    isFormValid,
    handleChange,
    getFilteredRoleOptions,
  } = useUserEditLogic(id, user);

  // Password logic
  const passwordLogic = usePasswordChangeLogic();

  // Handle form submission
  async function handleSubmit(e) {
    e.preventDefault();
    if (!isFormValid) return;
    const userData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
    };
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
      userData.governate = formData.governate;
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
  }

  // Handle password form submission
  function handlePasswordSubmit(e) {
    e.preventDefault();
    if (!passwordLogic.isPasswordFormValid) return;
    passwordLogic.setShowPasswordModal(true);
  }

  // Confirm password update
  async function confirmPasswordUpdate() {
    if (!passwordLogic.isPasswordFormValid) return;
    try {
      passwordLogic.setIsChangingPassword(true);
      await userService.updateUserPassword(id, {
        password: passwordLogic.passwordData.password,
        currentUserPassword: passwordLogic.currentUserPassword,
      });
      toast.success("Password updated successfully");
      passwordLogic.setPasswordData({ password: "", confirmPassword: "" });
      passwordLogic.setCurrentUserPassword("");
      passwordLogic.setShowPasswordModal(false);
    } catch (error) {
      toast.error(
        error.response?.data?.error.message || "Failed to update password"
      );
    } finally {
      passwordLogic.setIsChangingPassword(false);
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const roleOptions = getFilteredRoleOptions();

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
                <InputField
                  label="Full Name"
                  icon={FiUser}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />
                <InputField
                  label="Email Address"
                  icon={FiMail}
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
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
                <SelectField
                  label="User Role"
                  icon={FiUsers}
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  options={roleOptions}
                  required
                />
                {(formData.role === "R" ||
                  formData.role === "LM" ||
                  formData.role === "DM" ||
                  formData.role === "Area") && (
                  <SelectField
                    label="Governate"
                    icon={FiMap}
                    name="governate"
                    value={formData.governate}
                    onChange={handleChange}
                    options={GOVERNATES}
                    required
                  />
                )}
              </div>
              {(formData.role === "R" ||
                formData.role === "DM" ||
                formData.role === "Area") && (
                <div className="mt-8">
                  <SelectField
                    label="Line Manager"
                    icon={FiUsers}
                    name="LM"
                    value={formData.LM}
                    onChange={handleChange}
                    options={lineManagers}
                    required
                  />
                </div>
              )}
              {(formData.role === "R" || formData.role === "DM") && (
                <div className="mt-8">
                  <SelectField
                    label="Area Manager"
                    icon={FiUsers}
                    name="Area"
                    value={formData.Area}
                    onChange={handleChange}
                    options={areaManagers}
                    required
                  />
                </div>
              )}
              {formData.role === "R" && (
                <div className="mt-8">
                  <SelectField
                    label="District Manager"
                    icon={FiUsers}
                    name="DM"
                    value={formData.DM}
                    onChange={handleChange}
                    options={districtManagers}
                    required
                  />
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
        {/* Password Change Form */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Change Password
          </h2>
          <p className="text-gray-500 mb-8">
            Update the user's password. The password must be at least 8
            characters long.
          </p>
          <form onSubmit={handlePasswordSubmit} className="max-w-lg">
            <div className="space-y-6">
              <div>
                <label className="flex items-center text-gray-700 font-medium mb-2">
                  <FiLock className="mr-2" /> New Password{" "}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type={passwordLogic.showPassword ? "text" : "password"}
                    name="password"
                    value={passwordLogic.passwordData.password}
                    onChange={(e) =>
                      passwordLogic.setPasswordData({
                        ...passwordLogic.passwordData,
                        password: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 pr-10"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                    onClick={() =>
                      passwordLogic.setShowPassword(!passwordLogic.showPassword)
                    }
                    tabIndex="-1"
                  >
                    {passwordLogic.showPassword ? (
                      <FiEyeOff size={20} />
                    ) : (
                      <FiEye size={20} />
                    )}
                  </button>
                </div>
                {passwordLogic.passwordData.password && (
                  <div className="mt-2 grid grid-cols-1 gap-2 text-sm">
                    <div
                      className={`flex items-center ${
                        passwordLogic.passwordData.password.length >= 8
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      <span
                        className={`mr-1 block w-2 h-2 rounded-full ${
                          passwordLogic.passwordData.password.length >= 8
                            ? "bg-green-600"
                            : "bg-gray-400"
                        }`}
                      ></span>
                      At least 8 characters
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="flex items-center text-gray-700 font-medium mb-2">
                  <FiLock className="mr-2" /> Confirm Password{" "}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type={
                      passwordLogic.showConfirmPassword ? "text" : "password"
                    }
                    name="confirmPassword"
                    value={passwordLogic.passwordData.confirmPassword}
                    onChange={(e) =>
                      passwordLogic.setPasswordData({
                        ...passwordLogic.passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 pr-10"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                    onClick={() =>
                      passwordLogic.setShowConfirmPassword(
                        !passwordLogic.showConfirmPassword
                      )
                    }
                    tabIndex="-1"
                  >
                    {passwordLogic.showConfirmPassword ? (
                      <FiEyeOff size={20} />
                    ) : (
                      <FiEye size={20} />
                    )}
                  </button>
                </div>
                {passwordLogic.passwordData.password &&
                  passwordLogic.passwordData.confirmPassword && (
                    <div className="mt-2">
                      {passwordLogic.passwordData.password ===
                      passwordLogic.passwordData.confirmPassword ? (
                        <p className="text-green-600 text-sm flex items-center">
                          <span className="mr-1 block w-2 h-2 rounded-full bg-green-600"></span>
                          Passwords match
                        </p>
                      ) : (
                        <p className="text-red-500 text-sm flex items-center">
                          <span className="mr-1 block w-2 h-2 rounded-full bg-red-500"></span>
                          Passwords do not match
                        </p>
                      )}
                    </div>
                  )}
              </div>
            </div>
            <div className="mt-10">
              <button
                type="submit"
                disabled={
                  !passwordLogic.isPasswordFormValid ||
                  passwordLogic.isChangingPassword
                }
                className={`px-6 py-3 rounded-md text-white font-medium transition-colors ${
                  passwordLogic.isPasswordFormValid &&
                  !passwordLogic.isChangingPassword
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-300 cursor-not-allowed"
                }`}
              >
                {passwordLogic.isChangingPassword ? (
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
                    Updating Password...
                  </span>
                ) : (
                  "Update Password"
                )}
              </button>
            </div>
          </form>
        </div>
        <PasswordConfirmationModal
          show={passwordLogic.showPasswordModal}
          onCancel={() => passwordLogic.setShowPasswordModal(false)}
          onConfirm={confirmPasswordUpdate}
          currentUserPassword={passwordLogic.currentUserPassword}
          setCurrentUserPassword={passwordLogic.setCurrentUserPassword}
          disabled={!passwordLogic.currentUserPassword}
        />
      </div>
    </div>
  );
}
