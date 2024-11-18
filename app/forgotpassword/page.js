"use client";
import { useState } from "react";
import Image from "next/image";
import signin from "../assets/images/signin.jpg";
import logo from "../assets/images/logo.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import { useCreateMutation } from "../query";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const createMutation = useCreateMutation();

  const handleSubmit = (e) => {
    e.preventDefault();
    let url ="";
    let queryKey = "";
    url = "admin/forgot-password";
    queryKey = "Admin";
    const data = {email: email}
    createMutation.mutate({data , url, queryKey});
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
              Forgot Password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your email address to receive a password reset link.
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex-grow flex flex-col justify-center"
          >
            <div className="mb-6">
              <label className="text-base text-gray-500">Email</label>
              <input
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none border rounded-lg w-full mt-3 py-4 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="email"
                placeholder="Email"
                style={{ backgroundColor: "#5B48BB08" }}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-custom-gradient text-white flex items-center justify-center py-3 px-4 rounded-lg w-full bg-[#D4041C]"
              >
                Send Reset Link
              </button>
            </div>
          </form>
          <div className="text-center mt-4">
            <a href="/login" className="text-indigo-600 hover:text-indigo-500">
              Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
