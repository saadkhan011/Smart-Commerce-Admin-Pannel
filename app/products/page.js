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
  Modal,
  InputNumber,
} from "antd";
import { UploadOutlined, DownOutlined, CloseOutlined } from "@ant-design/icons";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import {
  useCreateMutation,
  useDeleteMutation,
  useGetQuery,
  useUpdateMutation,
} from "../query";
import { ToastContainer } from "react-toastify";
import { VscKebabVertical } from "react-icons/vsc";
import {
  getProductColumns,
  getProductMobileColumn,
} from "../components/column";
import { getFilteredMembers } from "../api";
import AddBulkProduct from "../components/AddBulkProduct";
import withAuth from "../withAuth";

const { Option } = Select;

const ProductTable = () => {
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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [file, setFile] = useState(null);
  const [keyFeatures, setKeyFeatures] = useState([
    { title: "", description: "" },
  ]);
  let token;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("meatmetokenAdmin");
  }
  const { data, isLoading, error } = useGetQuery({
    queryKey: ["Products", currentPage, pageSize],
    url: `products?page=${currentPage}&limit=${pageSize}`,
  });
  console.log(data, ">");
  const { data: categoryData, isLoading: iscategoryLoading } = useGetQuery({
    queryKey: ["Category", currentPage, pageSize],
    url: `category?limit=${1000}`,
  });

  const { data: supplierData, isLoading: supplierIsLoading } = useGetQuery({
    queryKey: ["Supplier", currentPage, pageSize],
    url: `supplier?limit=${1000}`,
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      setDrawerWidth(window.innerWidth < 768 ? "100%" : 720);
    }
    if (data) {
      setFilteredData(data.products); // Set filtered data to full data initially
    }
  }, [data]);

  useEffect(() => {
    if (selectedCategory) {
      const category = categoryData.categories.find(
        (cat) => cat._id === selectedCategory
      );
      setSubcategories(category ? category.subcategories : []);
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory]);
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const handleEdit = (record) => {
    // Ensure the record has features, otherwise set to an empty array
    const features = Array.isArray(record.features) ? record.features : [];

    // Set form values for editing, including features
    form.setFieldsValue({
      ...record,
      category: record.category?._id, // Set category to its ID
      subcategory: record.subcategory, // Directly set the subcategory value as it's already an ID
      supplier: record.supplierId?._id, // Set supplier name
      features: features.map((feature) => ({
        title: feature.title,
        description: feature.description,
      })), // Set features array
    });

    setKeyFeatures(features); // Update state with features
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
    let url = `products/change-status/${record?._id}`;
    console.log(record);
    updateMutation.mutate({
      data: { status },
      url,
      queryKey: "Products",
    });
  };

  const columns = getProductColumns(menu);
  const mobileColumns = getProductMobileColumn(menu);

  const showDrawer = () => {
    setDrawerVisible(true);
  };
  const showModal = async () => {
    setModalVisible(true);
  };
  const closeModal = () => {
    setFile(null);
    const fileInput = document.querySelector("input[type='file']");
    setModalVisible(false);
    if (fileInput) {
      fileInput.value = "";
    }
  };
  const closeDrawer = () => {
    setEditingRecord(null); // Clear the editing record
    form.resetFields();
    setDrawerVisible(false);
    setImageFile();
    setImagePreview();
  };

  const handleDelete = (record) => {
    deleteMutation.mutate({
      id: record._id,
      url: `products`,
      queryKey: "Products",
    });
  };

  const typeOfMember = async (e, pro) => {
    const value = e.key || e.target.value;
    selectedMemberType(value);
    if (pro) {
      selectedMemberType("Category");
    }
    console.log(value);
    if (value === "All") {
      setFilteredData(data.products); // Show all data if "All" is selected
      return;
    }

    try {
      // Fetch the filtered data based on the selected member type
      const data = await getFilteredMembers(value, "products", token);
      console.log(data);
      setFilteredData(data);
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
      const values = await form.validateFields();
      const formData = new FormData();

      // Use _id for category and subcategory instead of their names
      formData.append("category", values.category);
      formData.append("subcategory", values.subcategory);
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("weight", values.weight);
      formData.append("price", values.price);
      formData.append("supplierId", values.supplier);
      formData.append("status", values.status);
      formData.append("features", JSON.stringify(keyFeatures));

      if (imageFile) {
        formData.append("image", imageFile);
      }
      console.log("fs",imageFile)
      console.log("form", formData)

      const isEdit = editingRecord?._id;
      let url = "products";
      let queryKey = "Products";

      if (isEdit) {
        formData.append("id", isEdit);
        url = `products/${isEdit}`;
        updateMutation.mutate(
          {
            data: formData,
            url,
            queryKey,
          },
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
      } else {
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

      setEditingRecord(null);
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  const handleAddFeature = () => {
    setKeyFeatures([...keyFeatures, { title: "", description: "" }]);
  };

  const handleRemoveFeature = (index) => {
    const newKeyFeatures = keyFeatures.filter((_, i) => i !== index);
    setKeyFeatures(newKeyFeatures);
  };

  const handleFeatureChange = (index, field, value) => {
    const newKeyFeatures = [...keyFeatures];
    newKeyFeatures[index][field] = value;
    setKeyFeatures(newKeyFeatures);
  };
  return (
    <div className="p-4 order-table-dashoboard-product">
      <ToastContainer />
      {/* <h1 className="text-xl font-semibold mb-4 text-black">Products</h1> */}
      <div className="flex flex-col md:flex-row justify-between mb-4">
        <div className="flex gap-2 items-center">
          <Dropdown overlay={menuStatus}>
            <Button className="bg-[#5a46cf] text-white font-normal border-none w-full md:w-[128px] h-[40px]">
              {memberType === "Active" || memberType === "Inactive"
                ? memberType
                : "Status"}{" "}
              <DownOutlined />
            </Button>
          </Dropdown>
          <select
            onChange={(e) => {
              typeOfMember(e, "true");
            }}
            className="bg-[#5a46cf] text-white border-none w-full md:w-[148px] h-[40px] rounded-md px-3 flex items-center justify-center"
          >
            <option
              value=""
              className="bg-white text-gray-500 border-none py-3 px-2"
            >
              Category
            </option>
            <>
              {categoryData &&
                Array.isArray(categoryData.categories) &&
                categoryData?.categories.map((element) => {
                  return (
                    <option
                      key={element._id}
                      value={element._id}
                      className="bg-white text-gray-500 border-none py-3 px-2"
                    >
                      {element.name}
                    </option>
                  );
                })}
            </>
          </select>
        </div>

        <div className="flex gap-2 mt-4 md:mt-0">
          <Button
            onClick={showDrawer}
            className="bg-[#5a46cf] text-white border-none py-5 w-full md:w-auto"
          >
            + Add Product
          </Button>
          <Button
            onClick={showModal}
            className="bg-[#5a46cf] text-white border-none py-5 w-full md:w-auto"
          >
            + Add Bulk Product
          </Button>
        </div>
      </div>

      <div className="">
        {memberType === "Active" ||
        memberType === "Inactive" ||
        memberType === "Reject" ||
        memberType === "Category" ? (
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
              total={data?.pagination?.totalProducts}
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
            label="Product Name"
            rules={[{ required: true }]}
          >
            <Input className="py-3 bg-[#EBEBEB3D]" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true }]}
          >
            <Input.TextArea className="py-3 bg-[#EBEBEB3D]" rows={4} />
          </Form.Item>
          <Form.Item
            name="weight"
            label="Weight (kg)"
            rules={[
              {
                required: true,
                type: "number",
                message: "Please enter a valid weight",
              },
            ]}
          >
            <InputNumber
              className="py-2 bg-[#EBEBEB3D] w-full"
              min={0} // Optionally set a minimum value
              step={0.01} // Optionally set the step size
              formatter={(value) => `${value} kg`} // Format the displayed value
              parser={(value) => value.replace(" kg", "")} // Parse the value back from formatted string
            />
          </Form.Item>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true }]}
            className="select-hover"
          >
            <Select
              className="bg-[#EBEBEB3D]"
              onChange={(value) => setSelectedCategory(value)}
            >
              {categoryData &&
                Array.isArray(categoryData.categories) &&
                categoryData.categories.map((category) => (
                  <Option
                    key={category._id}
                    value={category._id}
                    className="bg-white text-gray-500 border-none py-3 px-2"
                  >
                    {category.name}
                    {category.status === "Inactive" && (
                      <span className="font-semibold text-red-400">
                        {" "}
                        (Inactive)
                      </span>
                    )}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="subcategory"
            label="Subcategory"
            rules={[{ required: true }]}
            className="select-hover"
          >
            <Select className="bg-[#EBEBEB3D]">
              {subcategories.map((subcategory, index) => (
                <Option
                  key={index}
                  value={subcategory._id}
                  className="bg-white text-gray-500 border-none py-3 px-2"
                >
                  {subcategory.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="supplier"
            label="Supplier"
            rules={[{ required: true }]}
            className="select-hover"
          >
            <Select className="bg-[#EBEBEB3D]">
              {supplierData &&
                supplierData?.supplier.map((element) => {
                  return (
                    <option
                      key={element._id}
                      value={element._id}
                      className="bg-white text-gray-500 border-none py-3 px-2"
                    >
                      {element?.name}
                      {element?.status === "Reject" ||
                        (element?.status === "Pending" && (
                          <span className="font-semibold text-red-400">
                            {" "}
                            ({element.status})
                          </span>
                        ))}
                    </option>
                  );
                })}
            </Select>
          </Form.Item>
          <Form.Item
            name="price"
            label="Price"
            rules={[
              {
                required: true,
                type: "number",
                message: "Please enter a valid price",
              },
            ]}
          >
            <InputNumber
              className="py-2 w-full bg-[#EBEBEB3D]"
              min={0} // Optionally set a minimum value
              step={0.01} // Optionally set the step size for cents
              formatter={(value) =>
                `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              } // Format the displayed value with commas and a dollar sign
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")} // Parse the value back from formatted string
            />
          </Form.Item>
          <Form.Item label="Key Features">
            {keyFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 mb-3">
                <Form.Item
                  name={["features", index, "title"]} // Use an array-based name for features
                  rules={[{ message: "Please enter a title" }]}
                  className="w-1/2"
                >
                  <Input
                    placeholder="Title"
                    onChange={(e) =>
                      handleFeatureChange(index, "title", e.target.value)
                    }
                    className="bg-[#EBEBEB3D] py-3"
                  />
                </Form.Item>
                <Form.Item
                  name={["features", index, "description"]} // Use an array-based name for description
                  rules={[{ message: "Please enter a description" }]}
                  className="w-1/2"
                >
                  <Input.TextArea
                    placeholder="Description"
                    onChange={(e) =>
                      handleFeatureChange(index, "description", e.target.value)
                    }
                    className="bg-[#EBEBEB3D] py-3"
                    rows={1}
                  />
                </Form.Item>
                <MinusOutlined
                  className="cursor-pointer text-red-500"
                  onClick={() => handleRemoveFeature(index)}
                />
              </div>
            ))}
            <Button
              type="dashed"
              onClick={handleAddFeature}
              icon={<PlusOutlined />}
              className="w-full"
            >
              Add Key Feature
            </Button>
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
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="Active">Active</Radio>
              <Radio value="Inactive">Inactive</Radio>
            </Radio.Group>
          </Form.Item>
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
        title="Add Bulk Product"
        visible={modalVisible}
        onCancel={closeModal}
        footer={null}
        centered
        className="w-[700px] h-[400px] mx-auto"
      >
        <AddBulkProduct onClose={closeModal} file={file} setFile={setFile} />
      </Modal>
    </div>
  );
};

export default withAuth(ProductTable);
