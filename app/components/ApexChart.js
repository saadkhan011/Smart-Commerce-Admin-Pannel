import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { API_BASE_URL } from "../api";
import { useGetQuery } from "../query";

// Dynamically import ReactApexChart to avoid SSR issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const ApexChart = () => {
  const [supplierId, setsupplierId] = useState();
  const { data, isLoading } = useGetQuery({
    queryKey: ["Supplier"],
    url: `supplier?limit=${100000}`,
  });
  const [chartData, setChartData] = useState({
    series: [
      { name: "Revenue", data: [] },
      { name: "Commission Fees", data: [] },
      { name: "Delivery Fees", data: [] },
    ],
    options: {
      chart: {
        type: "bar",
        height: 350,
        toolbar: { show: false },
      },
      colors: ["#6C53FD", "#00d049", "#8626d9"],
      xaxis: {
        categories: [],
      },
      yaxis: {
        title: { text: "Values" },
      },
      fill: { opacity: 1 },
      legend: { position: "right", offsetX: 0, offsetY: 50 },
      tooltip: {
        theme: "dark",
        style: { fontSize: "12px" },
      },
    },
  });

  // Fetch chart data from the API with optional supplierId
  const fetchChartData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/apex-chart-data`,
        {
          params: { supplierId }, // Pass supplierId as a query parameter if available
        }
      );
      console.log(response.data,"red");
      const { series, categories } = response.data;
      setChartData((prev) => ({
        ...prev,
        series,
        options: {
          ...prev.options,
          xaxis: { categories },
        },
      }));
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  useEffect(() => {
    // Fetch chart data on component mount
     fetchChartData();
    console.log(supplierId, "userid");
  }, [supplierId]);
console.log(supplierId, "userid");
  return (
    <div>
      <div className="flex flex-row px-4">
        <div className="w-full text-end">
          <select className="border p-2 text-black " onChange={(e)=>setsupplierId(e.target.value)} value={supplierId}>
            <option value="" disabled>
              Select Supplier
            </option>
            <option value="">
              All
            </option>
            {data &&
              Array.isArray(data.supplier) &&
              data.supplier.map((element, indx) => {
                return (
                  <option key={indx} value={element._id}>
                    {element.name}
                  </option>
                );
              })}
          </select>
        </div>
      </div>
      <div>
        <ReactApexChart
          options={chartData.options}
          series={chartData.series}
          type="bar"
          height={350}
        />
      </div>
    </div>
  );
};

export default ApexChart;
