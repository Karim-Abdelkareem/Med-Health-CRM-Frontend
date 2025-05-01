import React from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const onSubmit = (data) => login(data);
  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="relative">
          <input
            className="bg-gray-200 rounded w-full text-gray-700 focus:outline-none border-b-4 border-gray-300 focus:border-blue-500 transition duration-500 px-3 pb-2 pt-6 peer"
            {...register("email", { required: true })}
            placeholder=" "
            id="email"
          />
          <label
            htmlFor="email"
            className="absolute left-3 top-4 text-gray-600 transition-all pointer-events-none peer-focus:text-xs peer-focus:top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:top-2"
          >
            Email <span className="text-red-500">*</span>
          </label>
          {errors.username && (
            <span className="text-red-500 text-sm">This field is required</span>
          )}
        </div>

        <div className="relative">
          <input
            className="bg-gray-200 rounded w-full text-gray-700 focus:outline-none border-b-4 border-gray-300 focus:border-blue-500 transition duration-500 px-3 pb-2 pt-6 peer"
            type="password"
            {...register("password", { required: true })}
            placeholder=" "
            id="password"
          />
          <label
            htmlFor="password"
            className="absolute left-3 top-4 text-gray-600 transition-all pointer-events-none peer-focus:text-xs peer-focus:top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:top-2"
          >
            Password <span className="text-red-500">*</span>
          </label>
          {errors.password && (
            <span className="text-red-500 text-sm">This field is required</span>
          )}
        </div>
        <div className="flex justify-center sm:justify-start">
          <input
            value={"Sign In"}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4 w-full sm:w-auto"
            type="submit"
          />
        </div>
      </form>
    </div>
  );
}
