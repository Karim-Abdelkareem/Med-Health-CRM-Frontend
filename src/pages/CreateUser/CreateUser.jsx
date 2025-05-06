import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { base_url } from '../../constants/axiosConfig';
import InputField from '../../components/InputField';
import toast from 'react-hot-toast';

export default function CreateUser() {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    LM: '',
    DM: '',
    governate: ''
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  
  // Lists for dropdowns
  const [lineManagers, setLineManagers] = useState([]);
  const [districtManagers, setDistrictManagers] = useState([]);
  
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
  
  // Role options
  const roleOptions = [
    { label: "HR", value: "HR" },
    { label: "Line Manager", value: "LM" },
    { label: "District Manager", value: "DM" },
    { label: "Representative", value: "R" },
  ];
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Get auth token for API requests
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };
  
  // API functions
  const fetchUsersByRole = async (role) => {
    try {
      const response = await axios.get(
        `${base_url}/api/users/get/role?role=${role}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${role} users:`, error);
      throw error;
    }
  };
  
  const createUserAPI = async (userData) => {
    try {
      const response = await axios.post(`${base_url}/api/users`, userData, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error.response?.data?.message || error.message;
    }
  };
  
  // Fetch line managers and district managers
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        // Fetch line managers
        const lmResponse = await fetchUsersByRole("LM");
        setLineManagers(lmResponse.data || []);
        
        // Fetch district managers
        const dmResponse = await fetchUsersByRole("DM");
        setDistrictManagers(dmResponse.data || []);
      } catch (error) {
        toast.error("Failed to load managers");
      }
    };
    
    fetchManagers();
  }, []);
  
  // Form validation
  useEffect(() => {
    const { name, email, password, confirmPassword, role } = formData;
    
    // Basic validation
    const isValid = 
      name.trim() !== '' && 
      email.trim() !== '' && 
      password.trim() !== '' && 
      password === confirmPassword &&
      role !== '';
      
    // Additional validation for specific roles
    if (
      role === 'R' &&
      (!formData.LM ||
        !formData.DM ||
        !formData.governate)
    ) {
      setIsFormValid(false);
    } else if (
      role === 'LM' &&
      (!formData.DM || !formData.governate)
    ) {
      setIsFormValid(false);
    } else if (role === 'DM' && !formData.governate) {
      setIsFormValid(false);
    } else {
      setIsFormValid(isValid);
    }
  }, [formData]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid) return;
    
    // Create user data object based on role
    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role
    };
    
    // Add role-specific fields
    if (formData.role === 'R') {
      userData.LM = formData.LM;
      userData.DM = formData.DM;
      userData.governate = formData.governate;
    } else if (formData.role === 'LM') {
      userData.DM = formData.DM;
      userData.governate = formData.governate;
    } else if (formData.role === 'DM') {
      userData.governate = formData.governate;
    }
    
    try {
      setIsLoading(true);
      await createUserAPI(userData);
      toast.success("User created successfully");
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
        LM: '',
        DM: '',
        governate: ''
      });
    } catch (error) {
      toast.error(error || "Failed to create user");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reusable Select Input Component
  const SelectInput = ({
    id,
    label,
    name,
    value,
    onChange,
    options,
    placeholder,
    required = false,
  }) => {
    return (
      <div className="mb-4">
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          required={required}
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
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-sm text-gray-600">Create and manage system users</p>
        </div>
        
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          <div className="p-6 bg-blue-600 text-white">
            <h2 className="text-2xl font-bold">Create New User</h2>
            <p className="mt-1 text-blue-100">Add a new user to the system</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 pb-2 border-b border-gray-200">
                  User Information
                </h3>
                
                <InputField
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => handleChange({
                    target: {
                      name: "name",
                      value: e.target.value
                    }
                  })}
                  name="name"
                  placeholder="Enter full name"
                  required={true}
                />
                
                <InputField
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange({
                    target: {
                      name: "email",
                      value: e.target.value
                    }
                  })}
                  name="email"
                  placeholder="Enter email address"
                  required={true}
                />
                
                <InputField
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange({
                    target: {
                      name: "password",
                      value: e.target.value
                    }
                  })}
                  name="password"
                  placeholder="Enter password"
                  required={true}
                />
                
                <InputField
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange({
                    target: {
                      name: "confirmPassword",
                      value: e.target.value
                    }
                  })}
                  name="confirmPassword"
                  placeholder="Confirm password"
                  required={true}
                />
                
                {formData.password && formData.confirmPassword && 
                 formData.password !== formData.confirmPassword && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <p className="text-red-700 text-sm">Passwords do not match</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 pb-2 border-b border-gray-200">
                  Role & Hierarchy
                </h3>
                
                <SelectInput
                  id="role"
                  label="User Role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  options={roleOptions}
                  placeholder="Select role"
                  required={true}
                />
                
                {formData.role && (
                  <div className="space-y-6 animate-fadeIn">
                    {(formData.role === 'R' || formData.role === 'LM' || formData.role === 'DM') && (
                      <SelectInput
                        id="governate"
                        label="Governate"
                        name="governate"
                        value={formData.governate}
                        onChange={handleChange}
                        options={governates}
                        placeholder="Select governate"
                        required={true}
                      />
                    )}
                    
                    {(formData.role === 'R' || formData.role === 'LM') && (
                      <SelectInput
                        id="DM"
                        label="District Manager"
                        name="DM"
                        value={formData.DM}
                        onChange={handleChange}
                        options={districtManagers}
                        placeholder={districtManagers.length > 0 ? "Select district manager" : "Loading..."}
                        required={true}
                      />
                    )}
                    
                    {formData.role === 'R' && (
                      <SelectInput
                        id="LM"
                        label="Line Manager"
                        name="LM"
                        value={formData.LM}
                        onChange={handleChange}
                        options={lineManagers}
                        placeholder={lineManagers.length > 0 ? "Select line manager" : "Loading..."}
                        required={true}
                      />
                    )}
                  </div>
                )}
                
                <div className="pt-6 mt-8">
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-4">Form Actions</h4>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        type="button"
                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors flex-1"
                        onClick={() => {
                          setFormData({
                            name: '',
                            email: '',
                            password: '',
                            confirmPassword: '',
                            role: '',
                            LM: '',
                            DM: '',
                            governate: ''
                          });
                        }}
                      >
                        Clear Form
                      </button>
                      
                      <button
                        type="submit"
                        className={`px-6 py-3 rounded-lg text-white transition-colors flex-1 ${
                          isFormValid
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-blue-300 cursor-not-allowed"
                        }`}
                        disabled={!isFormValid || isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating User...
                          </span>
                        ) : (
                          "Create User"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
