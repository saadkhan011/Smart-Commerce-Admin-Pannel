"use client";
import React, { useState } from "react";
import Image from "next/image";
import logo from "../assets/images/dp.png";
import { useGetQuery } from "../query";
import { Button, Dropdown, Menu, Pagination, Table, Tag } from "antd";
import OrderDetailsModal from "./orderDetailsModal";
import { DownOutlined } from "@ant-design/icons";
import { FaEye } from "react-icons/fa";

const NewOrdersTable = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { data, isLoading, error } = useGetQuery({
    queryKey: ["Orders"],
    url: `order/get-all-order`,
  });
  console.log(data);
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const columns = [
    {
      title: "Order #",
      render: (data) => <span className="">{data?._id.slice(0, 7)}</span>,
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
        <Button onClick={() => showModal(record)}>
          <FaEye />
        </Button>
      ),
      className: "hidden md:table-cell",
    },
  ];
  const showModal = (order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const mobileColumns = [
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
            <Button onClick={() => showModal(record)}>
              <FaEye />
            </Button>
          </div>
          <hr className="border-t border-gray-300 mt-2" />{" "}
          {/* Breakpoint line */}
        </div>
      ),
      responsive: ["xs"], // Display on extra small devices
    },
  ];

  return (
    <div className="p-4">
      <div className="overflow-x-auto order-table-dashboard-home">
        <div className="overflow-x-auto">
          {/* <table className="w-full bg-white border-collapse">
            <thead className="bg-white text-black border-b-2 border-black">
              <tr>
                <th className="py-2 px-4 text-left">Email</th>
                <th className="py-2 px-4 text-left">Date</th>
                <th className="py-2 px-4 text-left">Buyer Name</th>
                <th className="py-2 px-4 text-left">Phone</th>
                <th className="py-2 px-4 text-left">Country</th>
                <th className="py-2 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.buyers.slice(0, 3).map((order, index) => (
                <tr key={index} className="border-t hover:bg-[#E62F391F]">
                  <td className="py-2 px-4 text-black">{order.email}</td>
                  <td className="py-2 px-4 text-black">{order.dateRegistered.slice(0,10)}</td>
                  <td className="py-2 px-4 flex items-center text-black">
                    <Image src={logo} height={50} width={50} className="rounded-full px-2" alt="logo" />
                    {order.name}
                  </td>
                  <td className="py-2 px-4 text-black">{order.phone}</td>
                  <td className="py-2 px-4 text-black">{order.country}</td>
                  <td className="py-2 px-4 text-black">
                    <span className="inline-block bg-gray-200 text-gray-800 py-1 px-3 rounded-full text-xs">
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table> */}
          <>
            {" "}
            <Table
              dataSource={data?.orders.slice(0, 3)}
              columns={columns.concat(mobileColumns)}
              rowKey="id"
              pagination={false}
              className="rounded-lg table-responsive"
            />
          </>
        </div>
        <OrderDetailsModal
        setSelectedOrder={setSelectedOrder}
          isModalVisible={isModalVisible}
          handleOk={handleOk}
          handleCancel={handleCancel}
          selectedOrder={selectedOrder}
        />
      </div>
    </div>
  );
};

export default NewOrdersTable;
