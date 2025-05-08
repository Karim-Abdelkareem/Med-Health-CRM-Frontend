import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const { login, errors, loading } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
    setError,
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
      await login(data);
    } catch (error) {
      // سيتم معالجة الأخطاء في useEffect
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

        <div className="flex justify-center sm:justify-start">
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4 w-full sm:w-auto ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </form>
    </div>
  );
}
