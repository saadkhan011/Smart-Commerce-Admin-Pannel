"use client";

import React, { useState, useEffect } from "react";
import { countries } from "countries-list";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Table,
  Tag,
  Dropdown,
  Menu,
  Drawer,
  Form,
  Input,
  Radio,
  Select,
  Modal,
  Button,
  Pagination,
  DatePicker,
} from "antd";
import {
  DownOutlined,
  PlusOutlined,
  CloseOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { VscKebabVertical } from "react-icons/vsc";
import {
  useCreateMutation,
  useDeleteMutation,
  useGetQuery,
  useUpdateMutation,
} from "../query";
import { API_BASE_URL, getFilteredMembers } from "../api";
import axios from "axios";
import { getBuyerColumn, getBuyerMobileColumn } from "./column";
import {
  GoogleMap,
  Marker,
  LoadScript,
  Autocomplete,
} from "@react-google-maps/api";
import withAuth from "../withAuth";
const { Option } = Select;

const BuyerTable = () => {
  const { RangePicker } = DatePicker;
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(620);
  const [form] = Form.useForm();
  const [feeForm] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const createMutation = useCreateMutation();
  const updateMutation = useUpdateMutation();
  const deleteMutation = useDeleteMutation();
  const [editingRecord, setEditingRecord] = useState(null);
  const [filteredData, setFilteredData] = useState();
  const [memberType, selectedMemberType] = useState();
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const [currentPremiumPage, setCurrentPremiumPage] = useState(1); // State for current page
  const [pageSize, setPageSize] = useState(10); // Number of items per page
  const [dateRange, setDateRange] = useState([null, null]);
  const [buyerAllData, setBuyerAllData] = useState();
  const [coordinates, setCoordinates] = useState({
    lat: 43.65107,
    lng: -79.347015,
  }); // Default coordinates (e.g., Toronto)
  const [autocomplete, setAutocomplete] = useState(null);
  const [address, setAddress] = useState("");
  const { data, isLoading, error } = useGetQuery({
    queryKey: ["Buyer", currentPage, pageSize],
    url: `buyer?page=${currentPage}&limit=${pageSize}`,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDrawerWidth(window.innerWidth <= 768 ? "100%" : 620);
    }
    if (data) {
      setFilteredData(data.buyers); // Set filtered data to full data initially
    }
    // fetchData();
  }, [data, dateRange]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const menu = (record) => (
    <Menu>
      <Menu.Item key="1" onClick={() => handleEdit(record)}>
        Edit
      </Menu.Item>
      <Menu.Item onClick={() => handleDelete(record)} key="2">
        Delete
      </Menu.Item>
  
      {/* Conditionally render status change options based on the current status */}
      {record.status !== "Approve" && (
        <Menu.Item onClick={() => handleStatusChange(record, "Approve")} key="3">
          Approve
        </Menu.Item>
      )}
  
      {record.status !== "Pending" && (
        <Menu.Item onClick={() => handleStatusChange(record, "Pending")} key="4">
          Pending
        </Menu.Item>
      )}
  
      {record.status !== "Reject" && (
        <Menu.Item onClick={() => handleStatusChange(record, "Reject")} key="5">
          Reject
        </Menu.Item>
      )}
    </Menu>
  );
  const showModal = async () => {
    setModalVisible(true);
    const response = await axios.get(`${API_BASE_URL}/buyer?limit=1000`,{
      headers: {
        "x-access-token": token, // Add the x-access-token to the headers
      },
    });
    setBuyerAllData(response?.data?.buyers);
    console.log(response);
  };

  const closeModal = () => {
    setModalVisible(false);
    feeForm.resetFields();
  };
  const addFees = async () => {
    try {
      await feeForm.validateFields(); // Validate all fields in the modal form
      const values = feeForm.getFieldsValue(); // Get the form values
      console.log(values);

      const { buyer, percentage } = values;
      let url = "admin/assign-fee-to-buyer";
      let queryKey = "Buyer";
      updateMutation.mutate({
        data: { fees: percentage, buyerId: buyer },
        url,
        queryKey,
      });

      closeModal(); // Close the modal after saving
    } catch (error) {
      console.error("Failed to add fees:", error);
    }
  };
  let token;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("meatmetokenAdmin");
  }
  const columns = getBuyerColumn(menu);
  const mobileColumns = getBuyerMobileColumn(menu);

  const handleStatusChange = (record, status) => {
    let url = `buyer/change-status/${record?._id}`;
    console.log(record);
    updateMutation.mutate({
      data: { status },
      url,
      queryKey: "Buyer",
    });
  };

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setEditingRecord(null); // Clear the editing record
    form.resetFields();
    setAddress();
    setDrawerVisible(false);
  };

  const handleEdit = (record) => {
    const recordWithoutPassword = { ...record };
    delete recordWithoutPassword.password;
    form.setFieldsValue(recordWithoutPassword);
    setEditingRecord(record);
    setAddress(record?.shippingAddress)
    showDrawer();
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const isEdit = editingRecord?._id; // Check if ID is present to determine if it's an edit

      let url = "buyer";
      let queryKey = "Buyer";

      if (isEdit) {
        // Update operation
        await new Promise((resolve, reject) => {
          updateMutation.mutate(
            {
              data: { ...values, id: isEdit, shippingAddress: address, role: "Admin" },
              url,
              queryKey,
            },
            {
              onSuccess: () => resolve(),
              onError: (error) => reject(error),
            }
          );
        });
      } else {
        // Create operation
        await new Promise((resolve, reject) => {
          createMutation.mutate(
            {
              data: { ...values, role: "Admin", shippingAddress: address, },
              url,
              queryKey,
            },
            {
              onSuccess: () => resolve(),
              onError: (error) => reject(error),
            }
          );
        });
      }
      setAddress();
      form.resetFields();
      closeDrawer();
    } catch (error) {
      console.log("Validate Failed:", error);
      // Optionally, handle the error state or show an error message to the user
    }
  };

  const handleDelete = (record) => {
    deleteMutation.mutate({
      id: record._id,
      url: `buyer`,
      queryKey: "Buyer",
    });
  };

  const typeOfMember = async (e, con) => {
    const value = e.key;
    setDateRange(null);
    selectedMemberType(value);
    if (con) {
      // selecting country filter
      selectedMemberType("country");
    }
    if (value === "All") {
      setFilteredData(data.buyers); // Show all data if "All" is selected
      return;
    }

    try {
      // Fetch the filtered data based on the selected member type
      const data = await getFilteredMembers(value, "buyer", token);
      console.log(data);
      setFilteredData(data); // Update filtered data with the response
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch member data.");
    }
  };

  const fetchData = async (startDate, endDate) => {
    if (startDate && endDate) {
      startDate = startDate.format("YYYY-MM-DD");
      endDate = endDate.format("YYYY-MM-DD");
      console.log(startDate, endDate);
    }
    try {
      const response = await axios.get(
        `${API_BASE_URL}/buyer/filter-by-date/${startDate}/${endDate}`,{
          headers: {
            "x-access-token": token, // Add the x-access-token to the headers
          },
        },
      );
      console.log(response.data);
      setFilteredData(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch data.");
    }
  };

  const handleDateChange = (dates) => {
    const [startDate, endDate] = dates;
    console.log(dates); // Should now print the correct selected dates
    setDateRange(dates); // Update state if needed elsewhere in the component
    selectedMemberType("Date");
    fetchData(startDate, endDate); // Pass dates directly to fetchData
  };

  // Handle page change
  const onPageChange = (page) => {
    setCurrentPremiumPage(page);
  };

  // Paginate the data
  const paginatedData = filteredData
    ? filteredData.slice(
        (currentPremiumPage - 1) * pageSize,
        currentPremiumPage * pageSize
      )
    : [];

  const menuStatus = (
    <Menu onClick={typeOfMember}>
      <Menu.Item key="All">All</Menu.Item>
      <Menu.Item key="Pending">Pending</Menu.Item>
      <Menu.Item key="Approve">Approve</Menu.Item>
      <Menu.Item key="Reject">Reject</Menu.Item>
    </Menu>
  );

  const menuCity = (
    <Menu
      className="scrollable-menu"
      onClick={(e) => {
        typeOfMember(e, "true");
      }}
    >
      {Object.keys(countries).map((key) => (
        <Menu.Item key={countries[key].name}>{countries[key].name}</Menu.Item>
      ))}
    </Menu>
  );

  const handleAddressChange = async (address) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=AIzaSyBFZW8emYS3DQLTWsd0IIFw6TM87CKD4pA`
      );
      const data = await response.json();
      if (data.results && data.results[0]) {
        const location = data.results[0].geometry.location;
        setCoordinates({ lat: location.lat, lng: location.lng });
      }
    } catch (error) {
      console.error("Error fetching geocode:", error);
    }
  };

  const onLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      const location = place.geometry?.location;
      const formattedAddress = place.formatted_address;

      if (location) {
        setCoordinates({
          lat: location.lat(),
          lng: location.lng(),
        });
      }

      if (formattedAddress) {
        setAddress(formattedAddress); // Set the input value with the selected address
      }
    } else {
      console.log("Autocomplete is not loaded yet!");
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 order-table-dashoboard-buyer">
      <ToastContainer />
      <div className="flex flex-col md:flex-row justify-between mb-4">
        <div className="flex gap-2">
          <Dropdown overlay={menuStatus}>
            <Button className="bg-[#5a46cf] text-white font-normal border-none w-1/2 md:w-[128px] h-[40px]">
              {memberType === "Pending" ||
              memberType === "Approve" ||
              memberType === "Reject"
                ? memberType
                : "status"}{" "}
              <DownOutlined />
            </Button>
          </Dropdown>
          {/* <Dropdown overlay={menuCity}>
            <Button className="bg-[#5a46cf] text-gray-500 font-normal border-none w-1/2 md:w-[128px] h-[40px]">
              Country <DownOutlined />
            </Button>
          </Dropdown> */}
        </div>
        <div className="flex md:flex-row flex-col gap-2 mt-4 md:mt-0">
        <Button
            className="bg-[#5a46cf] text-white border-none py-5 font-medium"
            onClick={showModal}
          >
            {" "}
            Add Percentage
          </Button>
          <RangePicker
            value={dateRange}
            onChange={handleDateChange}
            style={{ width: "100%" }}
          />
          <Button
            className="bg-[#5a46cf] text-white font-medium border-none py-5 w-full md:w-auto"
            onClick={showDrawer}
          >
            <PlusOutlined /> Add Buyer
          </Button>
        </div>
      </div>
      <div className="">
        {memberType === "Pending" ||
        memberType === "Approve" ||
        memberType === "Reject" ||
        memberType === "Date" ||
        memberType === "country" ? (
          <>
            {" "}
            <Table
              dataSource={paginatedData}
              columns={columns.concat(mobileColumns)}
              rowKey="id"
              pagination={false}
              className="rounded-lg table-responsive"
            />
            {/* Pagination component */}
            <Pagination
              current={currentPremiumPage}
              pageSize={pageSize}
              total={filteredData?.length}
              onChange={onPageChange}
              className="mt-4 flex justify-center"
            />
          </>
        ) : (
          <>
            {" "}
            <Table
              columns={columns.concat(mobileColumns)}
              dataSource={filteredData}
              rowKey="_id"
              pagination={false}
            />
            <Pagination
              className="mt-4 justify-center"
              current={currentPage}
              pageSize={pageSize}
              total={data?.pagination?.totalUsers}
              onChange={(page) => {
                setCurrentPage(page);
              }}
            />
          </>
        )}
      </div>

      <Drawer
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{editingRecord ? "Edit Buyer" : "Add Buyer"}</span>
            <CloseOutlined
              style={{ cursor: "pointer", fontSize: "20px" }}
              onClick={closeDrawer}
            />
          </div>
        }
        width={drawerWidth}
        onClose={closeDrawer}
        visible={drawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        closable={false} // Remove the default close icon
      >
        <Form
          form={form}
          layout="vertical"
          hideRequiredMark
          className="w-[80%] mx-auto"
        >
          <Form.Item name="id" noStyle>
            <Input type="hidden" />
          </Form.Item>
          <p className="text-black font-semibold text-2xl mb-3">
            {editingRecord ? "Edit Buyer" : "Add Buyer"}
          </p>
          <Form.Item
            name="name"
            label="Buyer Name"
            rules={[{ required: true }]}
          >
            <Input className="py-3 bg-[#EBEBEB3D]" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: "Email is required" },
              {
                type: "email",
                message: "Please enter a valid email address",
              },
            ]}
          >
            <Input className="py-3 bg-[#EBEBEB3D]" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
          >
            <Input className="py-3 bg-[#EBEBEB3D]" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[{ required: true }]}
          >
            <Input className="py-3 bg-[#EBEBEB3D]" />
          </Form.Item>
          <Form.Item
            name="contactPerson"
            label="Contact Person"
            rules={[{ required: true }]}
          >
            <Input className="py-3 bg-[#EBEBEB3D]" />
          </Form.Item>

          <p className="font-semibold py-2 text-xl">Address</p>
          {/* <Form.Item
            name="country"
            label="Country"
            rules={[{ required: true }]}
            className="py-3 select-hover"
          >
            <Select placeholder="Please select country">
              <Option value={"Canada"}>Canada</Option>
            </Select>
          </Form.Item> */}

          {/* <Form.Item name="city" label="City" rules={[{ required: true }]}>
            <Input className="py-3 bg-[#EBEBEB3D]" />
          </Form.Item> */}

          {/* Map displaying location */}
          <div className="mb-5">
            <LoadScript
              googleMapsApiKey=""
              libraries={["places"]}
            >
              <GoogleMap
                center={coordinates}
                zoom={15}
                mapContainerStyle={{ width: "100%", height: "300px" }}
              >
                <Marker position={coordinates} />
              </GoogleMap>

              {/* <Form.Item
                name="billingAddress"
                label="Billing Address"
                rules={[{ required: true }]}
                className="mt-3"
              > */}
              <Autocomplete className="mt-4" onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                <>
                  <label>Shipping Address</label>
                  <Input
                    className="py-3 mt-2 bg-[#EBEBEB3D]"
                    placeholder="Enter your shipping address"
                    value={address} // Bind the input to the address state
                    onChange={(e) => {
                      setAddress(e.target.value); // Update the state on user input
                      handleAddressChange(e.target.value); // Update the map with the address input
                    }}
                  />
                </>
              </Autocomplete>
              {/* </Form.Item> */}
            </LoadScript>
          </div>

          {/* <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="Pending">Pending</Radio>
              <Radio value="Approve">Approve</Radio>
              <Radio value="Reject">Reject</Radio>
            </Radio.Group>
          </Form.Item> */}
          <Form.Item>
            <div className="flex justify-between gap-5">
              <button
                className="bg-[#A8A8A83D] text-gray-800 border-none py-2 w-1/2 rounded-md"
                onClick={closeDrawer}
                type="button"
              >
                Cancel
              </button>
              <button
                className="bg-[#5a46cf] text-white border-none py-2 w-1/2 rounded-md"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </Form.Item>
        </Form>
      </Drawer>
      <Modal
        title="Add Fee"
        visible={modalVisible}
        onCancel={closeModal}
        footer={null}
        centered
        className="w-[700px] h-[400px] mx-auto"
      >
        <Form layout="vertical " className="p-2" form={feeForm}>
          <Form.Item name="buyer" label="Select Buyer">
            <Select
              placeholder="Please select a buyer"
              className="bg-[#EBEBEB3D]"
            >
              {buyerAllData &&
                buyerAllData.map((buyer) => (
                  <Option key={buyer.key} value={buyer._id}>
                    {buyer.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item name="percentage" label="Add Percentage">
            <Input
              type="number"
              placeholder="Enter percentage"
              className="bg-[#EBEBEB3D]"
            />
          </Form.Item>
          <button
            className="bg-[#5a46cf] text-white border-none py-3 w-full  rounded-md mx-auto"
            onClick={addFees}
          >
            {" "}
            save
          </button>
        </Form>
      </Modal>
    </div>
  );
};

export default withAuth(BuyerTable);
