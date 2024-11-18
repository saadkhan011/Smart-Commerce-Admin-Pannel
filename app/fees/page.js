"use client";
import React, { useState, useEffect, useRef } from "react";
import { Form, Input, Button } from "antd";
import { useCreateMutation, useGetQuery } from "../query";
import { ToastContainer } from "react-toastify";

const Page = () => {
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedFees, setSelectedFees] = useState({});

  const dropdownRef = useRef(null);
  const createMutation = useCreateMutation();

  const { data, isLoading, error } = useGetQuery({
    queryKey: ["Supplier", currentPage, pageSize],
    url: `supplier?page=${currentPage}&limit=${pageSize}`,
  });

  // Handle changes in fees for each restaurant
  const handleFeeChange = (value, restaurantId) => {
    setSelectedFees((prev) => ({
      ...prev,
      [restaurantId]: value,
    }));
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleSupplierSelect = (supplier) => {
    setSelectedSupplier(supplier);
    setSelectedSuppliers(supplier.restaurants || []); // Use empty array if no restaurants
    setIsDropdownOpen(false); // Close dropdown after selection
  };

  const loadMoreSupplier = () => {
    setPageSize((prevPageSize) => prevPageSize + 5);
  };

  const handleSubmit = (values) => {
    console.log("Selected Values:", values);
    console.log("Selected Fees:", selectedFees);
    console.log(selectedSupplier._id)
    // // Call the mutation to update the fees in the backend

    let url = "admin/assign-fee";
    let queryKey = "Restaurant";
    createMutation.mutate({
      data: { supplierId: selectedSupplier._id, fees: selectedFees },
      url,
      queryKey,
    });



  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="p-6 mx-6">
      <ToastContainer />
      <h1 className="text-xl mb-6 text-black">Manage Fees</h1>
      <Form layout="vertical" onFinish={handleSubmit}>
        <div className="bg-white rounded-lg shadow-md p-10">
          <Form.Item label="Select Supplier" name="supplier">
            <div className="relative" ref={dropdownRef}>
              <div
                className="dropdown-header py-2 px-4 border rounded cursor-pointer"
                onClick={toggleDropdown}
              >
                {selectedSupplier
                  ? `${selectedSupplier?.name} (${selectedSupplier.email})`
                  : "Select a supplier"}
              </div>
              {isDropdownOpen && (
                <div className="dropdown-menu absolute bg-gray-50 border rounded mt-1 w-full z-10">
                  <div className="supplier-list max-h-48 overflow-y-auto">
                    {data &&
                      data.supplier.map((supplier) => (
                        <div
                          key={supplier._id}
                          className="supplier-item p-2 hover:bg-gray-200 cursor-pointer"
                          onClick={() => handleSupplierSelect(supplier)}
                        >
                          {supplier?.name} &nbsp; ({supplier?.email})
                        </div>
                      ))}
                  </div>
                  <button
                    type="button"
                    onClick={loadMoreSupplier}
                    className="text-blue-500 p-2 block w-full text-center"
                  >
                    More...
                  </button>
                </div>
              )}
            </div>
          </Form.Item>

          <Form.Item
            label="Select Fees"
            name="fees"
            rules={[
              {
                required: true,
                message: "Please enter fees for at least one restaurant",
              },
            ]}
          >
            <div className="flex flex-col">
              {selectedSupplier?.restaurants && selectedSuppliers.map(({ restaurant, fees }) => (
                <div
                  key={restaurant?._id}
                  className="flex items-start"
                >
                  <div className="w-1/4">
                  <p className="pt-2">{restaurant?.name}</p>
                  </div>
                  <div>
                  <Input
                    placeholder="Enter fee"
                    defaultValue={fees}
                    size="small"
                    className="ml-20 w-20"
                    onChange={(e) =>
                      handleFeeChange(e.target.value, restaurant._id)
                    }
                  />
                  <span> &nbsp;% </span>
                  </div>
                </div>
              ))}
              {selectedSuppliers.length === 0 && <span>No restaurants available for this supplier.</span>}
            </div>
          </Form.Item>
        </div>
        <Form.Item>
          <button
            type="submit"
            className="py-3 mt-5 px-20 rounded-lg bg-[#D4041C] text-white"
          >
            Save
          </button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Page;
