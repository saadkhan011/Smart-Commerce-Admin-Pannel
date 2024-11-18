"use client";
import { useState } from "react";
import Image from "next/image";
import signin from "../assets/images/signin.jpg";
import logo from "../assets/images/logo.png";
import { useMutation } from "react-query";
import { createRequest } from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons from react-icons
import { useRouter } from "next/navigation";

export default function Page() {
  // State to manage form data
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // State to manage password visibility
  const [showPassword, setShowPassword] = useState(false);

  const createMutation = useMutation({
    mutationFn: (data) => createRequest(data, "admin/login-admin"),
    onSuccess: (response) => {
      if (response.data.success) {
        localStorage.setItem("meatmetokenAdmin", response.data.token);
        localStorage.setItem("meatmeAdmin", JSON.stringify(response.data.admin));
        toast.success("correct password");
        window.location.href = "/"
      } else {
        toast.error(error.response.data.message || "Wrong Email and password");
      }
    },
    onError: (error) => {
      toast.error(error.response.data.message || "An error occurred");
    },
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle form submission
  const handleSave = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
    // Handle form data (e.g., submit to an API or process it)
    console.log("Form Data:", formData);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 px-2">
      <ToastContainer />
      <div className="hidden md:flex w-1/2 h-screen items-center justify-center">
        <Image
          src={signin}
          alt="Wedding Illustration"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-center items-center bg-white">
        <div className="max-w-md w-full flex flex-col space-y-8">
          <div className="text-center">
            <Image
              src={logo}
              alt="SoulWatch Logo"
              style={{ width: "130px" }}
              className="mx-auto"
            />
            <h2 className="mt-6 pb-5 text-3xl font-extrabold text-gray-900">
              Login
            </h2>
            <p className="mt-2 text-sm text-gray-600">
            Please Login to continue
            </p>
          </div>
          <form
            onSubmit={handleSave}
            className="flex-grow flex flex-col justify-center"
          >
            <div className="mb-6">
              <label className="text-base text-gray-500">Username</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="appearance-none border rounded-lg w-full mt-3 py-4 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                placeholder="user@gmail.com"
                style={{ backgroundColor: "#5B48BB08" }}
              />
            </div>
            <div className="mb-4 relative">
              <label className="text-base text-gray-500">Password</label>
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="appearance-none border rounded-lg w-full mt-3 py-4 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type={showPassword ? "text" : "password"}
                placeholder="******"
                style={{ backgroundColor: "#5B48BB08" }}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  className="text-gray-600 focus:outline-none pt-7"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <FaEyeSlash size={22} />
                  ) : (
                    <FaEye size={22} />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-0 pt-0 mb-8">
              <div className="flex items-center">
                <input
                  id="remember_me"
                  name="remember_me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember_me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="/forgotpassword"
                  className="font-medium text-red-500 hover:text-indigo-500"
                >
                  Forgot Password?
                </a>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center justify-center py-3 px-4 rounded-lg w-full bg-[#D4041C] text-white"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
