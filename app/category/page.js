"use client";
import { useState, useEffect } from "react";
import {
  Drawer,
  Form,
  Input,
  Tag,
  message,
  Select,
  Radio,
  Button,
  Upload,
  Menu,
  Dropdown,
  Table,
  Pagination,
} from "antd";
import withAuth from "../withAuth";
import {
  UploadOutlined,
  DownOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import {
  useCreateMutation,
  useDeleteMutation,
  useGetQuery,
  useUpdateMutation,
} from "../query";
import { ToastContainer } from "react-toastify";
import { VscKebabVertical } from "react-icons/vsc";
import {
  getCategoryColumns,
  getMobileCategoryColumns,
} from "../components/column";
import { getFilteredMembers } from "../api";

const { Option } = Select;

const CategoryTable = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(720);
  const [imageFile, setImageFile] = useState(null); // State for storing the image file
  const [imagePreview, setImagePreview] = useState(""); // State for image preview URL
  const [form] = Form.useForm();
  const [filteredData, setFilteredData] = useState();
  const createMutation = useCreateMutation();
  const updateMutation = useUpdateMutation();
  const deleteMutation = useDeleteMutation();
  const [editingRecord, setEditingRecord] = useState(null);
  const [memberType, selectedMemberType] = useState();
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const [currentPremiumPage, setCurrentPremiumPage] = useState(1); // State for current page
  const [pageSize, setPageSize] = useState(10); // Number of items per page
  const [subcategories, setSubcategories] = useState([
    { value: "", supplierId: "", role: "" },
  ]);

  const { data, isLoading, error } = useGetQuery({
    queryKey: ["Category", currentPage, pageSize],
    url: `category?page=${currentPage}&limit=${pageSize}`,
  });
  console.log(data);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setDrawerWidth(window.innerWidth < 768 ? "100%" : 720);
    }
    if (data) {
      setFilteredData(data.categories); // Set filtered data to full data initially
    }
  }, [data]);

  let token;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("meatmetokenAdmin");
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const handleAddSubcategory = () => {
    setSubcategories([...subcategories, { value: "" }]);
  };

  const handleRemoveSubcategory = (index) => {
    const newSubcategories = subcategories.filter((_, i) => i !== index);
    setSubcategories(newSubcategories);
  };

  const handleSubcategoryChange = (index, event) => {
    const newSubcategories = [...subcategories];
    newSubcategories[index].value = event.target.value;
    setSubcategories(newSubcategories);
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      name: record.name,
      status: record.status,
    });
    // Set the subcategories
    setSubcategories(record.subcategories.map((sub) => ({ value: sub.name, supplierId: sub.supplierId, role: sub.role})));
    // Set image preview if image exists
    if (record.image) {
      setImagePreview(record.image.url); // Assuming `record.image` contains the URL to the image
    }
    setEditingRecord(record); // Set the record being edited
    showDrawer(); // Show the drawer
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
      {record.status !== "Active" && (
        <Menu.Item onClick={() => handleStatusChange(record, "Active")} key="3">
          Active
        </Menu.Item>
      )}

      {record.status !== "Inactive" && (
        <Menu.Item
          onClick={() => handleStatusChange(record, "Inactive")}
          key="4"
        >
          Inactive
        </Menu.Item>
      )}
    </Menu>
  );

  const handleStatusChange = (record, status) => {
    let url = `category/change-status/${record?._id}`;
    console.log(record);
    updateMutation.mutate({
      data: { status },
      url,
      queryKey: "Category",
    });
  };
  const columns = getCategoryColumns(menu);
  const mobileColumns = getMobileCategoryColumns(menu);

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setEditingRecord(null); // Clear the editing record
    form.resetFields();
    setSubcategories([{ value: "" }]);
    setImageFile();
    setImagePreview();
    setDrawerVisible(false);
  };

  const handleDelete = (record) => {
    deleteMutation.mutate({
      id: record._id,
      url: `category`,
      queryKey: "Category",
    });
  };

  const typeOfMember = async (e) => {
    const value = e.key;
    selectedMemberType(value);
    if (value === "All") {
      setFilteredData(data.categories); // Show all data if "All" is selected
      return;
    }

    try {
      // Fetch the filtered data based on the selected member type
      const data = await getFilteredMembers(value, "category", token);
      console.log(data);
      setFilteredData(data); // Update filtered data with the response
    } catch (error) {
      console.log(error);
    }
  };

  const handleFileChange = (info) => {
    if (info.file.status === "done") {
      const file = info.file.originFileObj;
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const customRequest = async ({ file, onSuccess, onError }) => {
    // Optionally handle the custom request here
    onSuccess();
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
      <Menu.Item key="Active">Active</Menu.Item>
      <Menu.Item key="Inactive">Inactive</Menu.Item>
    </Menu>
  );

  const handleSave = async () => {
    try {
      const values = await form.validateFields().then((values) => {
        const formattedValues = {
          ...values,
          subcategories: subcategories.map((sub) => sub.value),
        };
        return formattedValues; // Return the formattedValues
      });
      console.log(values);
      console.log(subcategories,"SUBCATEGORY");
      const formData = new FormData();

      // Populate FormData
      formData.append("name", values.name);
      formData.append("status", values.status);


      if (imageFile) {
        formData.append("image", imageFile);
      }
      const isEdit = editingRecord?._id; // Check if ID is present to determine if it's an edit
      console.log(imageFile);

      let url = "category";
      let queryKey = "Category";

      if (isEdit) {
        console.log(formData);
        // Update operation
        url = `category/${isEdit}`;
        subcategories.forEach((subcategory, index) => {
          // You can choose a key format based on your backend requirements
          formData.append(`subcategories[${index}][value]`, subcategory.value);
          formData.append(`subcategories[${index}][role]`, subcategory.role);
          formData.append(`subcategories[${index}][supplierId]`, subcategory.supplierId);
        });
        updateMutation.mutate(
          {
            data: formData,
            url,
            queryKey,
          },
          {
            onSuccess: () => {
              form.resetFields();
              closeDrawer();
              setImageFile(null);
              setImagePreview("");
            },
            onError: (error) => {
              console.error("Error updating supplier:", error);
            },
          }
        );
      } else {
        formData.append("subcategories", values.subcategories);
        createMutation.mutate(
          { data: formData, url, queryKey },
          {
            onSuccess: () => {
              form.resetFields();
              setImageFile(null);
              setImagePreview("");
              closeDrawer();
            },
            onError: (error) => {
              console.error("Error updating supplier:", error);
            },
          }
        );
      }

      setEditingRecord();
      // Reset subcategories
      setSubcategories([{ value: "" }]);

      // Send formData to your mutation or API endpoint
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  return (
    <div className="p-4 order-table-dashoboard-product">
      <ToastContainer />
      {/* <h1 className="text-xl font-semibold mb-4 text-black">Categories</h1> */}
      <div className="flex flex-col md:flex-row justify-between mb-4">
        <div className="flex gap-2 items-center">
          <Dropdown overlay={menuStatus}>
            <Button className="bg-[#5a46cf] text-white font-normal border-none w-full md:w-[128px] h-[40px]">
              Status <DownOutlined />
            </Button>
          </Dropdown>
        </div>

        <div className="flex gap-2 mt-4 md:mt-0">
          <Button
            onClick={showDrawer}
            className="bg-[#5a46cf] text-white border-none py-5 w-full md:w-auto"
          >
            + Add Category
          </Button>
        </div>
      </div>

      <div className="">
        {memberType === "Active" || memberType === "Inactive" ? (
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
              total={data?.pagination?.totalCategories}
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
            <span>{editingRecord ? "Edit Product" : "Add Product"}</span>
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
          layout="vertical"
          hideRequiredMark
          form={form}
          className="w-full md:w-[80%] mx-auto"
        >
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true }]}
          >
            <Input className="py-3 bg-[#EBEBEB3D]" />
          </Form.Item>
          <Form.Item label="Upload Image">
            <Upload
              customRequest={customRequest}
              showUploadList={false}
              onChange={handleFileChange}
            >
              <Button icon={<UploadOutlined />}>Upload Image</Button>
            </Upload>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Image preview"
                style={{ marginTop: 10, maxWidth: "50%" }}
              />
            )}
          </Form.Item>
          <Form.Item label="Subcategories">
            {subcategories &&
              subcategories.map((sub, index) => (
                <div key={index} className="flex items-center mb-2">
                  <Input
                    value={sub.value}
                    onChange={(e) => handleSubcategoryChange(index, e)}
                    className="py-3 bg-[#EBEBEB3D] flex-grow"
                    placeholder={`Subcategory ${index + 1}`}
                  />
                  <Button
                    type="link"
                    icon={<MinusCircleOutlined />}
                    onClick={() => handleRemoveSubcategory(index)}
                    disabled={subcategories.length === 1} // Disable removal if only one subcategory left
                  />
                </div>
              ))}
            <Button
              type="dashed"
              onClick={handleAddSubcategory}
              className="flex items-center"
              icon={<PlusOutlined />}
            >
              Add Subcategory
            </Button>
          </Form.Item>

          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="Active">Active</Radio>
              <Radio value="Inactive">Inactive</Radio>
            </Radio.Group>
          </Form.Item>
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
        </Form>
      </Drawer>
    </div>
  );
};

export default withAuth(CategoryTable);
