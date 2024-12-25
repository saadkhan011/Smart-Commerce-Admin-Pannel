import React from "react";
import {
  Modal,
  Descriptions,
  List,
  Typography,
  Dropdown,
  Menu,
  Button,
  Tag,
} from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import { useUpdateMutation } from "../query";

const OrderDetailsModal = ({
  isModalVisible,
  handleOk,
  handleCancel,
  selectedOrder,
  setSelectedOrder, // Assuming this is passed from the parent component
}) => {
  const updateMutation = useUpdateMutation();

  const handleStatusChange = (record, status) => {
    const url = `order/update-status-byitemId/${record?._id}/${selectedOrder?._id}`;
    updateMutation.mutate(
      {
        data: { status },
        url,
        queryKey: "Orders",
      },
      {
        onSuccess: () => {
          // Update the state to reflect the new status in the UI
          handleOk();
          const updatedItems = selectedOrder.items.map((item) =>
            item._id === record._id ? { ...item, status } : item
          );

          // Set the updated order details
          setSelectedOrder({ ...selectedOrder, items: updatedItems });
        },
      }
    );
  };

  const renderActionMenu = (item) => (
    <Menu>
      {/* Conditionally render status change options based on the current status */}
      {item.status !== "Approved" && (
        <Menu.Item onClick={() => handleStatusChange(item, "Approved")} key="3">
          Approved
        </Menu.Item>
      )}
  
      {item.status !== "Pending" && (
        <Menu.Item onClick={() => handleStatusChange(item, "Pending")} key="4">
          Pending
        </Menu.Item>
      )}
  
      {item.status !== "Shipped" && (
        <Menu.Item onClick={() => handleStatusChange(item, "Shipped")} key="5">
          Shipped
        </Menu.Item>
      )}
  
      {item.status !== "Delivered" && (
        <Menu.Item onClick={() => handleStatusChange(item, "Delivered")} key="6">
          Delivered
        </Menu.Item>
      )}
  
      {item.status !== "Rejected" && (
        <Menu.Item onClick={() => handleStatusChange(item, "Rejected")} key="7">
          Rejected
        </Menu.Item>
      )}
    </Menu>
  );
  

  return (
    <Modal
      title="Order Details"
      visible={isModalVisible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={1000} // Adjust width as needed
    >
      {selectedOrder && (
        <div>
          <Descriptions title="Buyer Information" bordered>
            <Descriptions.Item label="Buyer Name" span={3}>
              {selectedOrder?.buyerId?.name}
            </Descriptions.Item>
            <Descriptions.Item label="Buyer Email" span={3}>
              {selectedOrder?.buyerId?.email}
            </Descriptions.Item>
          </Descriptions>

          <Descriptions
            title="Order Information"
            bordered
            style={{ marginTop: "16px" }}
          >
            <Descriptions.Item label="Order ID">
              {selectedOrder._id}
            </Descriptions.Item>
            <Descriptions.Item label="Order Date">
              {new Date(selectedOrder?.orderDate).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {selectedOrder?.status}
            </Descriptions.Item>
            <Descriptions.Item label="Total Amount">
              {selectedOrder?.totalAmount}
            </Descriptions.Item>
            <Descriptions.Item label="Shipping Address" span={3}>
              {selectedOrder?.shippingAddress}
            </Descriptions.Item>
            <Descriptions.Item label="Billing Address" span={3}>
              {selectedOrder?.billingAddress}
            </Descriptions.Item>
          </Descriptions>

          <List
            header={<div style={{ fontWeight: "bold" }}>Ordered Items</div>}
            bordered
            dataSource={selectedOrder.items}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Dropdown
                    overlay={renderActionMenu(item)}
                    trigger={["click"]}
                    key="dropdown"
                  >
                    <Button type="text" icon={<EllipsisOutlined />} />
                  </Dropdown>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Typography.Text>{item?.productId?.name}</Typography.Text>
                  }
                  description={
                    <>
                      <div>Category: {item?.productId?.category}</div>
                      <div>
                        Supplier: {item?.supplierId?.name} (
                        {item?.supplierId?.email})
                      </div>
                      <div>Price: ${item?.price}</div>
                      <div>Quantity: {item?.quantity}</div>
                      <Tag
                        color={
                          item?.status === "Delivered" ? "green" : "volcano"
                        }
                        style={{ borderRadius: "10px", marginTop: "5px" }}
                      >
                        {item?.status.toUpperCase()}
                      </Tag>
                    </>
                  }
                />
              </List.Item>
            )}
            style={{ marginTop: "16px" }}
          />
        </div>
      )}
    </Modal>
  );
};

export default OrderDetailsModal;
