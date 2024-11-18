"use client";
import { useEffect, useState } from "react";
import { Switch } from "antd";
import { useUpdateMutation } from "../query";
import { ToastContainer } from "react-toastify";
import withAuth from "../withAuth";

function Settings() {
  const [userId, setUserId] = useState();
  const [generalSettings, setGeneralSettings] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    zipCode: "",
    country: "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("meatmeAdmin"));
    if (user) {
      setUserId(user);
      setGeneralSettings({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        street: user.street || "",
        city: user.city || "",
        zipCode: user.zipCode || "",
        country: user.country || "",
      });
    }
  }, []);

  const handleGeneralSettingsChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings((prevState) => ({ ...prevState, [name]: value }));
  };

  const updateMutation = useUpdateMutation();

  let url = "";
  let queryKey = "";
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle profile form submission logic here

    url = `admin/update-admin`;
    queryKey = "admin";
    updateMutation.mutate({
      data: { ...generalSettings, _id: userId?._id },
      url,
      queryKey,
    });
  };

  return (
    <>
      <div className="container mx-auto px-4 mt-12">
        <ToastContainer />
        {/* General Settings */}
        <div className="bg-white p-4 rounded-lg shadow text-black">
          {/* <h2 className="text-xl font-bold mb-4 text-black">
            General Settings
          </h2> */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div className="flex flex-col">
              <label htmlFor="Name" className="text-black mb-3 font-normal">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={generalSettings.name}
                onChange={handleGeneralSettingsChange}
                className="w-full p-2 rounded bg-gray-100 py-3 focus:outline-none focus:outline-red-600"
                style={{ outlineWidth: '1px' }} 
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="email" className="text-black mb-3 font-normal">
                Email
              </label>
              <input
                type="text"
                id="email"
                name="email"
                value={generalSettings.email}
                onChange={handleGeneralSettingsChange}
                className="w-full p-2 rounded bg-gray-100 py-3 focus:outline-none focus:outline-red-600"
                style={{ outlineWidth: '1px' }} 
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="phoneNumber"
                className="text-black mb-3 font-normal"
              >
                Phone Number
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={generalSettings.phone}
                onChange={handleGeneralSettingsChange}
                className="w-full p-2 rounded bg-gray-100 py-3 focus:outline-none focus:outline-red-600"
                style={{ outlineWidth: '1px' }} 
              />
            </div>
          </div>
          <p className="font-semibold pt-5 text-xl">Address</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            <div className="flex flex-col">
              <label htmlFor="street" className="text-black mb-3 font-normal">
                Street
              </label>
              <input
                type="text"
                id="street"
                name="street"
                value={generalSettings.street}
                onChange={handleGeneralSettingsChange}
                className="w-full p-2 rounded bg-gray-100 py-3 focus:outline-none focus:outline-red-600"
                style={{ outlineWidth: '1px' }} 
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="city" className="text-black mb-3 font-normal">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={generalSettings.city}
                onChange={handleGeneralSettingsChange}
                className="w-full p-2 rounded bg-gray-100 py-3 focus:outline-none focus:outline-red-600"
                style={{ outlineWidth: '1px' }} 
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="zipCode" className="text-black mb-3 font-normal">
                Zip Code
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={generalSettings.zipCode}
                onChange={handleGeneralSettingsChange}
                className="w-full p-2 rounded bg-gray-100 py-3 focus:outline-none focus:outline-red-600"
                style={{ outlineWidth: '1px' }} 
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="country" className="text-black mb-3 font-normal">
                Country
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={generalSettings.country}
                onChange={handleGeneralSettingsChange}
                className="w-full p-2 rounded bg-gray-100 py-3 focus:outline-none focus:outline-red-600"
                style={{ outlineWidth: '1px' }} 
              />
            </div>
          </div>

          <button
            className="bg-[#D4041C] text-white font-bold py-2 px-4 rounded-md mt-4 w-[190px]"
            onClick={handleSubmit}
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
}

export default withAuth(Settings);
