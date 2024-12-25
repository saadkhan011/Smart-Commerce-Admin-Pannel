"use client";
import React from "react";
import Cards from "../components/card";
import Charts from "../components/charts";
import NewOrdersTable from "../components/newOrdersTable";
import withAuth from "../withAuth";
import { useGetQuery } from "../query";

function Dashboard() {
  const { data, isLoading, error } = useGetQuery({
    queryKey: ["admin"],
    url: `admin/admin-dashboard`,
  });
  console.log("👩", data)
  let cardData = [];
  if (data) {
    cardData = [
      {
        title: "Total Sales",
        value: "$" + data.totalAmountSum.toFixed(2),
        change: "+ overAll",
        color: "bg-red-100",
      },
      {
        title: "Total Orders",
        value: data?.totalOrders,
        change: "+ overAll",
        color: "bg-yellow-100",
      },
      {
        title: "Total Buyer",
        value: data?.totalBuyers,
        change: "+ overAll",
        color: "bg-green-100",
      },
      {
        title: "Total Suppliers",
        value: data?.totalSuppliers,
        change: "+ overAll",
        color: "bg-purple-100",
      },
      {
        title: "Total Earning",
        value: data?.totalFees.toFixed(2),
        change: "+ overAll",
        color: "bg-blue-100",
      },
    ];
  }
  return (
    <div>
      <Cards cards={cardData} />
      <Charts graphData={data}/>
      <NewOrdersTable />
    </div>
  );
}

export default withAuth(Dashboard);
