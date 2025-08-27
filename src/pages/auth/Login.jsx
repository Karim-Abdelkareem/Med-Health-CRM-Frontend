import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const { login, errors, loading, clearErrors } = useAuth(); // Add clearErrors if available
  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
    setError,
    clearErrors: clearFormErrors,
  } = useForm();

  // عرض رسائل الخطأ من الخادم
  useEffect(() => {
    if (errors) {
      if (typeof errors === "string") {
        toast.error(errors);
      } else if (Array.isArray(errors)) {
        errors.forEach((error) => toast.error(error));
      } else if (typeof errors === "object") {
        Object.entries(errors).forEach(([field, message]) => {
          setError(field, { type: "server", message });
        });
      }
    }
  }, [errors, setError]);

  const onSubmit = async (data) => {
    try {
      // Clear previous form errors
      clearFormErrors();

      // Clear previous auth errors if clearErrors function exists
      if (clearErrors) {
        clearErrors();
      }

      await login(data);
    } catch (error) {
      // Error handling is done in useEffect
      console.log("Login failed:", error);
    }
  };

  return (
    <div className="flex">
      {/* نموذج تسجيل الدخول - العرض الكامل */}
      <div className="w-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="relative">
              <input
                className={`bg-gray-200 rounded w-full text-gray-700 focus:outline-none border-b-4 ${
                  formErrors.email ? "border-red-500" : "border-gray-300"
                } focus:border-blue-500 transition duration-500 px-3 pb-2 pt-6 peer`}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                placeholder=" "
                id="email"
                type="email"
              />
              <label
                htmlFor="email"
                className="absolute left-3 top-4 text-gray-600 transition-all pointer-events-none peer-focus:text-xs peer-focus:top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:top-2"
              >
                Email <span className="text-red-500">*</span>
              </label>
              {formErrors.email && (
                <span className="text-red-500 text-sm mt-1 block">
                  {formErrors.email.message}
                </span>
              )}
            </div>

            <div className="relative">
              <input
                className={`bg-gray-200 rounded w-full text-gray-700 focus:outline-none border-b-4 ${
                  formErrors.password ? "border-red-500" : "border-gray-300"
                } focus:border-blue-500 transition duration-500 px-3 pb-2 pt-6 peer`}
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                placeholder=" "
                id="password"
              />
              <label
                htmlFor="password"
                className="absolute left-3 top-4 text-gray-600 transition-all pointer-events-none peer-focus:text-xs peer-focus:top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:top-2"
              >
                Password <span className="text-red-500">*</span>
              </label>
              {formErrors.password && (
                <span className="text-red-500 text-sm mt-1 block">
                  {formErrors.password.message}
                </span>
              )}
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline w-full ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
