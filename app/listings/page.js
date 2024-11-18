"use client";
import React, { useState, useEffect, useRef } from "react";
import { Checkbox, Button, Form } from "antd";
import { useCreateMutation, useGetQuery, useUpdateMutation } from "../query";
import { ToastContainer } from "react-toastify";
import withAuth from "../withAuth";

const ManageRestaurants = () => {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(40);
  const [supplierPageSize, setSupplierPageSize] = useState(40);
  const [supplierDataUpdated, setSupplierDataUpdated] = useState(false);

  const dropdownRef = useRef(null);
const createMutation = useCreateMutation();

  const { data, isLoading, error } = useGetQuery({
    queryKey: ["Restaurant", currentPage, pageSize],
    url: `restaurant?page=${currentPage}&limit=${pageSize}`,
  });

  const { data: supplierData, isLoading: supplierIsLoading, refetch: refetchSupplierData } = useGetQuery({
    queryKey: ["Supplier", supplierPageSize],
    url: `supplier?page=1&limit=${supplierPageSize}`,
  });

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleRestaurantSelect = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setSelectedSuppliers(restaurant.suppliers); // Set the suppliers from the selected restaurant
    setIsDropdownOpen(false); // Close dropdown after selection
  };

  const loadMoreRestaurants = () => {
    setPageSize((prevPageSize) => prevPageSize + 5);
  };

  const handleSuppliersChange = (checkedValues) => {
    setSelectedSuppliers(checkedValues);
  };

  const handleSubmit = (values) => {
    if (selectedRestaurant) {
      const updatedRestaurant = {
        suppliers: selectedSuppliers, // Update the suppliers list
      };



      let url = "admin/supplier-assign";
      let queryKey = "Restaurant";
      console.log(updatedRestaurant?.suppliers)
      createMutation.mutate({
        data: { suppliers: updatedRestaurant?.suppliers, restaurantId : selectedRestaurant?._id },
        url,
        queryKey,
      });
    } else {
      console.error("No restaurant selected");
      // Optionally, show an error message indicating that no restaurant is selected
    }
  };

  const moreClick = () => {
    setSupplierPageSize((prevPageSize) => prevPageSize + 2);
    setSupplierDataUpdated(!supplierDataUpdated); // Force re-render
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
    <div className="flex flex-col">
      <ToastContainer />
      <div className="p-6 mx-6">
        {/* <h1 className="text-xl mb-6 text-black">Manage Restaurants</h1> */}
        <Form layout="vertical" onFinish={handleSubmit}>
          <div className="bg-white rounded-lg shadow-md p-10">
            <Form.Item
              label="Select Restaurants"
              name="restaurant"
            >
              <div className="relative" ref={dropdownRef}>
                <div
                  className="dropdown-header py-2 px-4 border rounded cursor-pointer"
                  onClick={toggleDropdown}
                >
                  {selectedRestaurant
                    ? `${selectedRestaurant.name} (${selectedRestaurant.email})`
                    : "Select a restaurant"}
                </div>
                {isDropdownOpen && (
                  <div className="dropdown-menu absolute bg-gray-50 border rounded mt-1 w-full z-10">
                    <div className="restaurant-list max-h-48 overflow-y-auto">
                      {data &&
                        data.restaurants.map((restaurant) => (
                          <div
                            key={restaurant._id}
                            className="restaurant-item p-2 hover:bg-gray-200 cursor-pointer"
                            onClick={() => handleRestaurantSelect(restaurant)}
                          >
                            {restaurant.name} &nbsp; ({restaurant.email})
                          </div>
                        ))}
                    </div>
                    <button
                      type="button"
                      onClick={loadMoreRestaurants}
                      className="text-blue-500 p-2 block w-full text-center"
                    >
                      More...
                    </button>
                  </div>
                )}
              </div>
            </Form.Item>

            <Form.Item
              label="Select Suppliers"
              name="suppliers"
            >
              <Checkbox.Group
                style={{ width: "100%" }}
                value={selectedSuppliers} // Use selectedSuppliers to pre-check checkboxes
                onChange={handleSuppliersChange}
              >
                <div className="flex flex-col space-y-2">
                  {supplierData &&
                    supplierData?.supplier.map((supplier) => (
                      <Checkbox value={supplier._id} key={supplier._id}>
                        {supplier.name} &nbsp; ({supplier.email})
                      </Checkbox>
                    ))}
                </div>
              </Checkbox.Group>
              <button
                type="button"
                onClick={moreClick}
                className="text-blue-500 mt-2"
              >
                More...
              </button>
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
    </div>
  );
};

export default withAuth(ManageRestaurants);
