"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import signin from "../assets/images/signin.jpg";
import logo from "../assets/images/logo.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCreateMutation } from "../query";

export default function Page() {
  const router = useRouter();

  // Suspense boundary for useSearchParams
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmNewPassword: "",
  });

  const createMutation = useCreateMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmNewPassword) {
      toast.error("Passwords do not match");
      return;
    }
    const data = { newPassword: formData.newPassword, token };
    let url = "";
    let queryKey = "";
    url = "restaurant/reset-password";
    queryKey = "Restaurant";
    createMutation.mutate(
      { data, url, queryKey },
      {
        onSuccess: (response) => {
          // Check if the mutation was successful
          if (response?.status === 200) {
            // Navigate to the login page after a brief delay
            setTimeout(() => {
              window.location.href = "/login";
            }, 2000); // Adjust the delay as needed
          }
        },
        onError: (error) => {
          toast.error("Failed to reset password. Please try again.");
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <ToastContainer />
      <div className="hidden md:flex w-1/2 h-screen items-center justify-center">
        <Image
          src={signin}
          alt="Wedding Illustration"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center">
        <div className="max-w-md w-full space-y-8">
          <div>
            <Image
              src={logo}
              alt="SoulWatch Logo"
              className="mx-auto h-23 w-auto"
            />
            <h2 className="mt-6 pb-5 text-center text-3xl font-extrabold text-gray-900">
              Reset Password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your new password below.
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex-grow flex flex-col justify-center"
          >
            <div className="mb-6">
              <label className="text-base text-gray-500">New Password</label>
              <input
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="appearance-none border rounded-lg w-full mt-3 py-4 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="password"
                placeholder="New Password"
                style={{ backgroundColor: "#5B48BB08" }}
              />
            </div>
            <div className="mb-6">
              <label className="text-base text-gray-500">
                Confirm New Password
              </label>
              <input
                name="confirmNewPassword"
                value={formData.confirmNewPassword}
                onChange={handleChange}
                className="appearance-none border rounded-lg w-full mt-3 py-4 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="password"
                placeholder="Confirm New Password"
                style={{ backgroundColor: "#5B48BB08" }}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-custom-gradient text-white flex items-center justify-center py-3 px-4 rounded-lg w-full bg-[#D4041C]"
              >
                Reset Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
