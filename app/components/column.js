// src/components/tables/categoryColumns.js

import { Button, Tag, Dropdown, Tooltip } from "antd";
import { VscKebabVertical } from "react-icons/vsc";
import { DownOutlined } from "@ant-design/icons";

// Function to generate columns
export const getCategoryColumns = (menu) => [
  {
    title: "Category Name",
    render: (data) => (
      <div className="flex items-center">
        <img
          src={data.image ? data?.image.url : ""}
          width={30}
          height={30}
          className="w-8 h-8 object-cover rounded-full"
          alt={data.name} // Add alt text for accessibility
        />
        <span className="ml-2">{data.name}</span>
      </div>
    ),
    className: "hidden md:table-cell",
  },
  {
    title: "Sub Categories",
    key: "subcategories",
    render: (data) => (
      <div className="flex flex-wrap gap-2">
        {data.subcategories.map((subcategory) => (
          <p
            key={subcategory._id} // Use _id as the unique key
            type="primary"
            className="bg-[#e2e6fe]  text-[#5a46cf] px-5 py-1 rounded-full"
          >
            {subcategory.name} {/* Access the name property */}
          </p>
        ))}
      </div>
    ),
    className: "hidden md:table-cell",
  },
  {
    title: "Status",
    key: "status",
    dataIndex: "status",
    render: (status) => (
      <Tag
        color={status === "Active" ? "green" : "volcano"}
        style={{ borderRadius: "10px" }}
      >
        {status.toUpperCase()}
      </Tag>
    ),
    className: "hidden md:table-cell",
  },
  {
    title: "Action",
    key: "action",
    render: (text, record) => (
      <Dropdown overlay={menu(record)} className="bg-gray-100">
        <Button>
          <VscKebabVertical />
        </Button>
      </Dropdown>
    ),
    className: "hidden md:table-cell",
  },
];

// Function to generate mobile columns
export const getMobileCategoryColumns = (menu) => [
  {
    title: "Details",
    render: (record) => (
      <div className="flex flex-col p-4 bg-gray-100 rounded-md mb-4">
        <div className="flex items-center mb-2">
          <span className="font-semibold">Category Name: </span>
          {record.name}
        </div>
        <div className="mb-1">
          <span className="font-semibold">Status: </span>
          {record.status}
        </div>
        <div className="flex flex-wrap gap-2">
        {record.subcategories.map((subcategory) => (
          <p
            key={subcategory._id} // Use _id as the unique key
            type="primary"
            className="bg-red-100  text-[#5a46cf] px-5 py-1 rounded-full"
          >
            {subcategory.name} {/* Access the name property */}
          </p>
        ))}
      </div>
        <div className="mt-2">
          <Dropdown overlay={menu(record)} className="bg-gray-100">
            <Button>
              Actions <DownOutlined />
            </Button>
          </Dropdown>
        </div>
        <hr className="border-t border-gray-300 mt-2" />
      </div>
    ),
    responsive: ["xs"],
  },
];

export const getProductColumns = (menu) => [
  {
    title: "Product",
    render: (data) => (
      <div className="flex items-center">
        <img
          src={data.image ? data?.image.url : ""}
          width={30}
          height={30}
          className="w-8 h-8 object-cover rounded-full"
        />
        <span className="ml-2">{data.name}</span>
      </div>
    ),
    className: "hidden md:table-cell",
  },
  {
    title: "Category",
    render: (data) => <span className="ml-2">{data?.category?.name}</span>,
    className: "hidden md:table-cell",
  },
  {
    title: "Sub-Category",
    render: (data) => (
      <span className="ml-2">
        {data?.subcategoryName ? (
          data.subcategoryName
        ) : (
          <Tooltip title="This product is not visible because the subcategory has been changed. To display this product, change the subcategory.">
            <span className="text-[#5a46cf]">Subcategory Missing</span>
          </Tooltip>
        )}
      </span>
    ),
    className: "hidden md:table-cell",
  },
  {
    title: "Price",
    dataIndex: "price",
    key: "price",
    className: "hidden md:table-cell",
  },
  {
    title: "Supplier",
    render: (data) => <span className="ml-2">{data?.supplierId?.name}</span>,
    className: "hidden md:table-cell",
  },
  {
    title: "Weight",
    dataIndex: "weight",
    key: "weight",
    className: "hidden md:table-cell",
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
    className: "hidden md:table-cell word-wrap",
    render: (text) => text ? text.substring(0, 20)+"..." : '...', // Show only the first 4 characters
  },
  {
    title: "Status",
    key: "status",
    dataIndex: "status",
    render: (status) => (
      <Tag
        color={status === "Active" ? "green" : "volcano"}
        style={{ borderRadius: "10px" }}
      >
        {status.toUpperCase()}
      </Tag>
    ),
    className: "hidden md:table-cell",
  },
  {
    title: "Action",
    key: "action",
    render: (text, record) => (
      <Dropdown overlay={menu(record)} className="bg-gray-100">
        <Button>
          <VscKebabVertical />
        </Button>
      </Dropdown>
    ),
    className: "hidden md:table-cell",
  },
];

export const getProductMobileColumn = (menu) => [
  {
    title: "Details",
    render: (record) => (
      <div className="flex flex-col p-4 bg-gray-100 rounded-md mb-4">
        <div className="flex items-center mb-2">
          <span className="font-semibold">Supplier: </span>
          {record.name}
        </div>
        <div className="mb-1">
          <span className="font-semibold">Phone: </span>
          {record.phone}
        </div>
        <div className="mb-1">
          <span className="font-semibold">Email: </span>
          {record.email}
        </div>
        <div className="mb-1">
          <span className="font-semibold">City: </span>
          {record.city}
        </div>
        <div className="mb-1">
          <span className="font-semibold">Status: </span>
          {record.status}
        </div>
        <div className="mt-2">
          <Dropdown overlay={menu(record)} className="bg-gray-100">
            <Button>
              Actions <DownOutlined />
            </Button>
          </Dropdown>
        </div>
        <hr className="border-t border-gray-300 mt-2" /> {/* Breakpoint line */}
      </div>
    ),
    responsive: ["xs"], // Display on extra small devices
  },
];


export const getBuyerColumn = (menu) => [
  {
    title: "Buyer Name",
    dataIndex: "name",
    key: "name",
    className: "hidden md:table-cell",
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
    className: "hidden md:table-cell",
  },
  {
    title: "Phone",
    dataIndex: "phone",
    key: "phone",
    className: "hidden md:table-cell",
  },
  {
    title: "Address",
    dataIndex: "shippingAddress",
    key: "shippingAddress",
    className: "hidden md:table-cell",
  },
  {
    title: "City",
    dataIndex: "city",
    key: "city",
    className: "hidden md:table-cell",
  },
  {
    title: "Fee %",
    dataIndex: "fees",
    key: "fees",
    className: "hidden md:table-cell",
  },
  {
    title: "Status",
    key: "status",
    dataIndex: "status",
    render: (status) => (
      <Tag
        color={
          status === "Pending"
            ? "blue"
            : status === "Approve"
            ? "green"
            : status === "Reject"
            ? "volcano"
            : "defaultColor" // Fallback color
        }
        style={{ borderRadius: "10px", width: "70px", textAlign: "center" }}
      >
        {status.toUpperCase()}
      </Tag>
    ),
    className: "hidden md:table-cell",
  },
  {
    title: "Action",
    key: "action",
    render: (text, record) => (
      <Dropdown className="bg-gray-100" overlay={menu(record)}>
        <Button>
          <VscKebabVertical />
        </Button>
      </Dropdown>
    ),
    className: "hidden md:table-cell",
  },
];


export const getBuyerMobileColumn = (menu)=>[
  {
    title: "Details",
    render: (record) => (
      <div className="flex flex-col p-4 bg-gray-100 rounded-md mb-4">
        <div className="mb-1">
          <span className="font-semibold">Buyer Name: </span>
          {record.name}
        </div>
        <div className="mb-1">
          <span className="font-semibold">Phone: </span>
          {record.phone}
        </div>
        <div className="mb-1">
          <span className="font-semibold">Email: </span>
          {record.email}
        </div>
        <div className="mb-1">
          <span className="font-semibold">City: </span>
          {record.city}
        </div>
        <div className="mb-1">
          <span className="font-semibold">Status: </span>
          {record.status}
        </div>
        <div className="mt-2">
          <Dropdown overlay={menu(record)}>
            <Button>
              Actions <DownOutlined />
            </Button>
          </Dropdown>
        </div>
        <hr className="border-t border-gray-300 mt-2" />{" "}
        {/* Breakpoint line */}
      </div>
    ),
    responsive: ["xs"], // Display on extra small devices
  },
];

export const getSupplierColumns = (menu) =>[
  {
    title: "Supplier",
    dataIndex: "name",
    key: "name",
    render: (text) => <a>{text}</a>,
    className: "hidden md:table-cell",
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
    className: "hidden md:table-cell",
  },
  {
    title: "Phone",
    dataIndex: "phone",
    key: "phone",
    className: "hidden md:table-cell",
  },
  {
    title: "Address",
    dataIndex: "address",
    key: "address",
    className: "hidden md:table-cell",
  },
  {
    title: "City",
    dataIndex: "city",
    key: "city",
    className: "hidden md:table-cell",
  },
  {
    title: "Fee %",
    dataIndex: "fees",
    key: "fees",
    className: "hidden md:table-cell",
  },
  {
    title: "Status",
    key: "status",
    dataIndex: "status",
    render: (status) => (
      <Tag
        color={
          status === "Pending"
            ? "blue"
            : status === "Approve"
            ? "green"
            : status === "Reject"
            ? "volcano"
            : "defaultColor" // Fallback color
        }
        style={{ borderRadius: "10px", width: "70px", textAlign: "center" }}
      >
        {status.toUpperCase()}
      </Tag>
    ),
    className: "hidden md:table-cell",
  },
  {
    title: "Action",
    key: "action",
    render: (text, record) => (
      <Dropdown overlay={menu(record)} className="bg-gray-100">
        <Button>
          <VscKebabVertical />
        </Button>
      </Dropdown>
    ),
    className: "hidden md:table-cell",
  },
];


export const getSupplierMobileColumns = (menu)=>[
  {
    title: "Details",
    render: (record) => (
      <div className="flex flex-col p-4 bg-gray-100 rounded-md mb-4">
        <div className="flex items-center mb-2">
          <span className="font-semibold">Supplier: </span>
          {record.name}
        </div>
        <div className="mb-1">
          <span className="font-semibold">Phone: </span>
          {record.phone}
        </div>
        <div className="mb-1">
          <span className="font-semibold">Email: </span>
          {record.email}
        </div>
        <div className="mb-1">
          <span className="font-semibold">City: </span>
          {record.city}
        </div>
        <div className="mb-1">
          <span className="font-semibold">Status: </span>
          {record.status}
        </div>
        <div className="mt-2">
          <Dropdown overlay={menu(record)} className="bg-gray-100">
            <Button>
              Actions <DownOutlined />
            </Button>
          </Dropdown>
        </div>
        <hr className="border-t border-gray-300 mt-2" />{" "}
        {/* Breakpoint line */}
      </div>
    ),
    responsive: ["xs"], // Display on extra small devices
  },
];

export const getOrderColumns = (menu)=> [
  {
    title: "Order #",
    render: (data) => <span className="">{data?._id.slice(0,7)}</span>,
    className: "hidden md:table-cell",
  },
  {
    title: "Date",
    render: (data) => {
      const formattedDate = data?.orderDate.slice(0, 10).split('-').reverse().join('-');
      return <span className="">{formattedDate}</span>;
    },
    
    className: "hidden md:table-cell",
  },
  {
    title: "Buyer",
    render: (data) => (
      <div className="flex flex-col">
        <span className="ml-2">{data?.buyerId?.name}</span>
        <span className="ml-2">{data?.buyerId?.email}</span>
      </div>
    ),
    className: "hidden md:table-cell",
  },
  {
    title: "Total Cost",
    dataIndex: "totalAmount",
    key: "totalAmount",
    className: "hidden md:table-cell",
  },
  {
    title: "Shipping Address",
    dataIndex: "shippingAddress",
    key: "shippingAddress",
    className: "hidden md:table-cell",
  },
  {
    title: "Status",
    key: "status",
    dataIndex: "status",
    render: (status) => (
      <Tag
        color={status === "Active" ? "green" : "volcano"}
        style={{ borderRadius: "10px" }}
      >
        {status.toUpperCase()}
      </Tag>
    ),
    className: "hidden md:table-cell",
  },
  {
    title: "Action",
    key: "action",
    render: (text, record) => (
      <Dropdown overlay={menu(record)} className="bg-gray-100">
        <Button>
          <VscKebabVertical />
        </Button>
      </Dropdown>
    ),
    className: "hidden md:table-cell",
  },
];

export const getMobileOrderColumns = (menu)=>[
  {
    title: "Details",
    render: (record) => (
      <div className="flex flex-col p-4 bg-gray-100 rounded-md mb-4">
        <div className="flex items-center mb-2">
          <span className="font-semibold">Buyer Name: </span>
          {record?.buyerId?.name}
        </div>
        <div className="mb-1">
          <span className="font-semibold">Buyer Email: </span>
          {record?.buyerId?.email}
        </div>
        <div className="mb-1">
          <span className="font-semibold">Billing Address: </span>
          {record.billingAddress}
        </div>
        <div className="mb-1">
          <span className="font-semibold">Shipping Address: </span>
          {record.shippingAddress}
        </div>
        <div className="mb-1">
          <span className="font-semibold">Total Price: </span>
          {record.totalAmount}
        </div>
        <div className="mb-1">
          <span className="font-semibold">Status: </span>
          {record.status}
        </div>
        <div className="mt-2">
          <Dropdown overlay={menu(record)}>
            <Button>
              Actions <DownOutlined />
            </Button>
          </Dropdown>
        </div>
        <hr className="border-t border-gray-300 mt-2" />{" "}
        {/* Breakpoint line */}
      </div>
    ),
    responsive: ["xs"], // Display on extra small devices
  },
];