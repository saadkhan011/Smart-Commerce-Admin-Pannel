"use client";
import React, { useEffect, useState } from "react";
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
  Space,
  Button,
  Modal,
  Pagination,
  DatePicker,
} from "antd";
import {
  GoogleMap,
  Marker,
  LoadScript,
  Autocomplete,
} from "@react-google-maps/api";
import {
  DownOutlined,
  PlusOutlined,
  CalendarOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { countries } from "countries-list";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  useCreateMutation,
  useDeleteMutation,
  useGetQuery,
  useUpdateMutation,
} from "../query";
import { API_BASE_URL, getFilteredMembers } from "../api";
import axios from "axios";
import { VscKebabVertical } from "react-icons/vsc";
import {
  getSupplierColumns,
  getSupplierMobileColumns,
} from "../components/column";
import withAuth from "../withAuth";

const { Option } = Select;

const SuppliersTable = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [coordinates, setCoordinates] = useState({
    lat: 43.65107,
    lng: -79.347015,
  }); // Default coordinates (e.g., Toronto)
  const [autocomplete, setAutocomplete] = useState(null);
  const [address, setAddress] = useState("");
  const { RangePicker } = DatePicker;
  const [drawerWidth, setDrawerWidth] = useState(620);
  const [form] = Form.useForm();
  const [feeForm] = Form.useForm();
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
  const [supplierAllData, setSupplierAllData] = useState();
  const { data, isLoading, error } = useGetQuery({
    queryKey: ["Supplier", currentPage, pageSize],
    url: `supplier?page=${currentPage}&limit=${pageSize}`,
  });
  let token;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("meatmetokenAdmin");
  }
  useEffect(() => {
    if (typeof window !== "undefined") {
      setDrawerWidth(window.innerWidth <= 768 ? "100%" : 620);
    }
    if (data) {
      setFilteredData(data.supplier); // Set filtered data to full data initially
    }
    // fetchData();
  }, [data, dateRange]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const handleEdit = (record) => {
    const recordWithoutPassword = { ...record };
    delete recordWithoutPassword.password;
    form.setFieldsValue(recordWithoutPassword);
    setEditingRecord(record);
    showDrawer();
  };

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
        <Menu.Item
          onClick={() => handleStatusChange(record, "Approve")}
          key="3"
        >
          Approve
        </Menu.Item>
      )}

      {record.status !== "Pending" && (
        <Menu.Item
          onClick={() => handleStatusChange(record, "Pending")}
          key="4"
        >
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

  const columns = getSupplierColumns(menu);
  const mobileColumns = getSupplierMobileColumns(menu);

  const handleStatusChange = (record, status) => {
    let url = `supplier/change-status/${record?._id}`;
    console.log(record);
    updateMutation.mutate({
      data: { status },
      url,
      queryKey: "Supplier",
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

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const isEdit = editingRecord?._id; // Check if ID is present to determine if it's an edit
      console.log(isEdit);

      let url = "supplier";
      let queryKey = "Supplier";
      if (isEdit) {
        // Update operation with success callback
        updateMutation.mutate(
          {
            data: { ...values, id: isEdit, role: "Admin", address },
            url,
            queryKey,
          },
          {
            onSuccess: () => {
              form.resetFields();
              setAddress();
              closeDrawer();
            },
            onError: (error) => {
              console.error("Error updating supplier:", error);
            },
          }
        );
      } else {
        // Create operation with success callback
        createMutation.mutate(
          { data: { ...values, role: "Admin", address }, url, queryKey },
          {
            onSuccess: () => {
              form.resetFields();
              setAddress();
              closeDrawer();
            },
            onError: (error) => {
              console.error("Error creating supplier:", error);
            },
          }
        );
      }
    } catch (errorInfo) {
      console.log("Validate Failed:", errorInfo);
    }
  };

  const handleDelete = (record) => {
    deleteMutation.mutate({
      id: record._id,
      url: `supplier`,
      queryKey: "Supplier",
    });
  };

  const typeOfMember = async (e, con) => {
    const value = e.key;
    selectedMemberType(value);
    if (con) {
      // selecting country filter
      selectedMemberType("country");
    }
    setDateRange(null);
    if (value === "All") {
      setFilteredData(data.supplier); // Show all data if "All" is selected
      return;
    }

    try {
      // Fetch the filtered data based on the selected member type
      const data = await getFilteredMembers(value, "supplier", token);
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
    }
    try {
      const response = await axios.get(
        `${API_BASE_URL}/supplier/filter-by-date/${startDate}/${endDate}`,{
          headers: {
            "x-access-token": token, // Add the x-access-token to the headers
          },
        }
      );
      setFilteredData(response.data);
    } catch (error) {
      toast.error("Failed to fetch data.");
    }
  };

  const handleDateChange = (dates) => {
    const [startDate, endDate] = dates;
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

  const showModal = async () => {
    setModalVisible(true);
    const response = await axios.get(`${API_BASE_URL}/supplier?limit=1000`,{
      headers: {
        "x-access-token": token, // Add the x-access-token to the headers
      },
    });
    setSupplierAllData(response?.data?.supplier);
    console.log(response);
  };

  const closeModal = () => {
    setModalVisible(false);
    feeForm.resetFields();
  };

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

  const addFees = async () => {
    try {
      await feeForm.validateFields(); // Validate all fields in the modal form
      const values = feeForm.getFieldsValue(); // Get the form values
      console.log(values);

      const { supplier, percentage } = values;
      let url = "admin/assign-fee";
      let queryKey = "Supplier";
      updateMutation.mutate({
        data: { fees: percentage, supplierId: supplier },
        url,
        queryKey,
      });

      closeModal(); // Close the modal after saving
    } catch (error) {
      console.error("Failed to add fees:", error);
    }
  };

  const handleAddressChange = async (address) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${key_of_google}`
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
    <div className="container mx-auto px-4 py-8 order-table-dashoboard-supplier">
      <ToastContainer />
      <div className="flex flex-col md:flex-row justify-between mb-4">
        <div className="flex gap-2">
          <Dropdown overlay={menuStatus}>
            <Button className="bg-[#5a46cf] text-white font-semibold border-none w-1/2 md:w-[128px] h-[40px]">
              {memberType === "Pending" ||
              memberType === "Approve" ||
              memberType === "Reject"
                ? memberType
                : "status"}{" "}
              <DownOutlined />
            </Button>
          </Dropdown>
          {/* <Dropdown overlay={menuCity}>
            <Button className="bg-[#5a46cf] text-gray-500 font-normal border-none w-full md:w-[128px] h-[40px]">
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
            className="w-full"
          />
          {/* Date Range Picker */}

          <Button
            className="bg-[#5a46cf] text-white border-none py-5 w-full md:w-auto"
            onClick={showDrawer}
          >
            <PlusOutlined /> Add Supplier
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
            <span>{editingRecord ? "Edit Supplier" : "Add Supplier"}</span>
            <CloseOutlined
              style={{ cursor: "pointer", fontSize: "20px" }}
              onClick={closeDrawer}
            />
          </div>
        }
        width={620}
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
            {editingRecord ? "Edit Supplier" : "Add Supplier"}
          </p>
          <Form.Item
            name="name"
            label="Supplier Name"
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
            rules={[
              {
                type: "password",
              },
            ]}
          >
            <Input className="py-3 bg-[#EBEBEB3D]" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[{ required: true }]}
          >
            <Input className="py-3 bg-[#EBEBEB3D] " />
          </Form.Item>
          <p className="font-semibold py-2 text-xl">Address</p>
{/* 
          <Form.Item
            name="country"
            label="Country"
            rules={[{ required: true }]}
            className="py-3 select-hover"
          >
            <Select placeholder="Please select country">
              const menuCity = (
              {Object.keys(countries).map((key) => (
                <Option value={countries[key].name}>
                  {countries[key].name}
                </Option>
              ))}
              );
              <Option value="Canada">Canada</Option>
            </Select>
          </Form.Item> */}
          {/* <Form.Item name="city" label="City" rules={[{ required: true }]}>
            <Input className="py-3 bg-[#EBEBEB3D]" />
          </Form.Item> */}
          {/* <Form.Item
            name="zipcode"
            label="Zip/Postal Code"
            rules={[{ required: true }]}
          >
            <Input className="py-3 bg-[#EBEBEB3D]" />
          </Form.Item> */}
          {/* Map displaying location */}
          <div className="mb-5">
            <LoadScript
              googleMapsApiKey="AIzaSyAezXyrlQ8OxN7Y7fneGjPLBMxNOj3IM5g"
              libraries={["places"]}
            >
              <GoogleMap
                center={coordinates}
                zoom={15}
                mapContainerStyle={{ width: "100%", height: "300px" }}
              >
                <Marker position={coordinates} />
              </GoogleMap>

              <Autocomplete
                className="mt-4"
                onLoad={onLoad}
                onPlaceChanged={onPlaceChanged}
              >
                <>
                  <label>Shipping Address</label>
                  <Input
                    className="py-3 mt-2 bg-[#EBEBEB3D]"
                    placeholder="Enter your billing address"
                    value={address} // Bind the input to the address state
                    onChange={(e) => {
                      setAddress(e.target.value); // Update the state on user input
                      handleAddressChange(e.target.value); // Update the map with the address input
                    }}
                  />
                </>
              </Autocomplete>
            </LoadScript>
          </div>
          {/* <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="Approve">Approve</Radio>
              <Radio value="Pending">Pending</Radio>
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
                {" "}
                cancel
              </button>
              <button
                className="bg-[#5a46cf] text-white border-none py-2 w-1/2 rounded-m"
                onClick={handleSave}
              >
                {" "}
                save
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
          <Form.Item name="supplier" label="Select Supplier">
            <Select
              placeholder="Please select a supplier"
              className="bg-[#EBEBEB3D]"
            >
              {supplierAllData &&
                supplierAllData.map((supplier) => (
                  <Option key={supplier.key} value={supplier._id}>
                    {supplier.name}
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

export default withAuth(SuppliersTable);
