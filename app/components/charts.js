"use client";
import dynamic from "next/dynamic";
import { PieChart } from "@mui/x-charts/PieChart";
import { useEffect, useState } from "react";
import { PiCircleNotchFill } from "react-icons/pi";
import axios from "axios";
import { API_BASE_URL } from "../api";
import { Button } from "antd";
import ApexChart from "./ApexChart";
import OrderDetail from "./OrderChart";
import OrderChart from "./OrderChart";
import { useGetQuery } from "../query";
import CommissionersGraph from "./commisionGraph";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const Chart = ({ graphData }) => {
  let token;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("meatmetokenAdmin");
  }
  // Map the month number (0-11) to the month name
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const currentMonth = new Date().getMonth();

  // Set the current month as the default selected month
  const [selectedMonth, setSelectedMonth] = useState(monthNames[currentMonth]);
  const [selectedRestaurant, setSelectedRestaurant] = useState();
  const { data: restaurantData, isLoading } = useGetQuery({
    queryKey: ["Restaurant"],
    url: `restaurant?limit=${100000}`,
  });
  // Map the month to the number of days it contains
  const monthDays = {
    Jan: 31,
    Feb: 28, // Handle leap years if needed
    Mar: 31,
    Apr: 30,
    May: 31,
    Jun: 30,
    Jul: 31,
    Aug: 31,
    Sep: 30,
    Oct: 31,
    Nov: 30,
    Dec: 31,
  };

  // Initial chart data
  const [chartData, setChartData] = useState({
    series: [
      {
        name: "Sales",
        data: [], // Initially empty, will be populated with API data
      },
    ],
    options: {
      chart: {
        height: 350,
        type: "area",
        toolbar: {
          show: false, // Hides chart toolbar
        },
      },
      dataLabels: {
        enabled: false, // Disables data labels on points
      },
      stroke: {
        curve: "smooth", // Smooth curve for area chart
      },
      colors: ["#FF0000"], // Color for the chart
      xaxis: {
        type: "category", // Categorical data on x-axis
        categories: monthNames, // Set the x-axis to display month names
      },
      yaxis: {
        labels: {
          formatter: function (value) {
            return `$${value}`; // Formats y-axis labels as currency
          },
        },
      },
      tooltip: {
        theme: "dark", // Add this line to change tooltip background color
        style: {
          fontSize: "12px",
          colors: ["#FFF"], // Change tooltip text color
        },
        x: {
          formatter: function (value) {
            return `${monthNames[value - 1]}`; // Tooltip displays the month name
          },
        },
      },
    },
  });

  // Function to fetch sales data from the API
  const fetchSalesData = async () => {
    let url = `${API_BASE_URL}/admin/order-graph-data?type=Month&selectedValue=${selectedMonth}`;

    // Add restaurantId only if selectedRestaurant has a value
    if (selectedRestaurant) {
      url += `&restaurantId=${selectedRestaurant}`;
    }

    try {
      const response = await axios.get(url, {
        headers: {
          "x-access-token": token,
        },
      });

      const salesData = response.data.data;

      if (Array.isArray(salesData)) {
        const salesAmounts = salesData.map((item) => item.totalSales);
        let categories = [];
        let tooltipFormatter;

        // Adjust categories and tooltip format based on selected time range

        categories = salesData.map((item) => item.day); // Day of the month
        tooltipFormatter = (value) => `Day ${value}`;

        setChartData((prevData) => ({
          ...prevData,
          series: [
            {
              name: "Sales",
              data: salesAmounts,
            },
          ],
          options: {
            ...prevData.options,
            xaxis: {
              ...prevData.options.xaxis,
              categories, // Set the categories (days, months, etc.) dynamically
            },
            tooltip: {
              ...prevData.options.tooltip,
              x: {
                formatter: tooltipFormatter, // Set tooltip format
              },
            },
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching sales data:", error);
    }
  };

  // Handle change in the month dropdown
  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);

    // Fetch and update chart data for the selected month
    fetchSalesData(month);
  };

  // Fetch data for the default selected month on component mount
  useEffect(() => {
    fetchSalesData(selectedMonth);
  }, [selectedMonth, selectedRestaurant]);

  const [pendingPercentage, setPendingPercentage] = useState(0);
  const [cancelledPercentage, setCancelledPercentage] = useState(0);
  const [completedPercentage, setCompletedPercentage] = useState(0);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (graphData) {
      setPendingPercentage(
        (graphData?.pendingOrders / graphData?.totalOrders) * 100 || 0
      );
      setCompletedPercentage(
        (graphData?.completedOrders / graphData?.totalOrders) * 100 || 0
      );
      setCancelledPercentage(
        (graphData?.cancelledOrders / graphData?.totalOrders) * 100 || 0
      );
    }
  }, [graphData]);

  // Update PieChart data whenever percentages change
  useEffect(() => {
    setData([
      {
        title: "Completed",
        value: completedPercentage.toFixed(1),
        color: "rgba(212, 4, 28, 1)",
      },
      {
        title: "Pending",
        value: pendingPercentage.toFixed(1),
        color: "rgb(134 38 217)",
      },
      {
        title: "Cancelled",
        value: cancelledPercentage.toFixed(1),
        color: "rgb(0 208 73)",
      },
    ]);
  }, [completedPercentage, pendingPercentage, cancelledPercentage]);

  return (
    <div>
      <ApexChart />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        <div className="bg-white rounded-lg shadow-md h-80 md:col-span-2">
          <div className="flex justify-between items-center p-2">
            {/* Heading and Month Selector */}
            <h3 className="text-black text-xl font-semibold">
              Sales of Restaurants
            </h3>
            <div>
              <select
                className="border rounded p-1 px-3 bg-red-50 border-red-600 text-black"
                value={selectedMonth}
                onChange={handleMonthChange}
              >
                {Object.keys(monthDays).map((month, index) => (
                  <option key={index} value={month}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                className="border rounded p-1 px-3 bg-red-50 border-red-600 text-black ms-4"
                value={selectedRestaurant}
                onChange={(e) => setSelectedRestaurant(e.target.value)}
              >
                <option value="">All</option>
                {restaurantData &&
                  Array.isArray(restaurantData.restaurants) &&
                  restaurantData.restaurants.map((element, index) => (
                    <option key={index} value={element._id}>
                      {element.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Chart rendering */}
          <div id="chart">
            <ReactApexChart
              options={chartData.options}
              series={chartData.series}
              type="area"
              height={280}
            />
          </div>

          <div id="html-dist"></div>
        </div>
        <div className="bg-white rounded-lg shadow-md h-80 flex flex-col items-center justify-between p-4">
          <h3 className="text-black text-xl font-semibold">
            Order Status Distribution
          </h3>
          <div className="w-full h-full flex items-center justify-center">
            <PieChart
              series={[
                {
                  data: data.map((item) => ({
                    ...item,
                    label: `${item.value}%`,
                  })),
                  innerRadius: 33,
                  outerRadius: 100,
                  paddingAngle: 3,
                  cornerRadius: 4,
                  startAngle: -180,
                  endAngle: 180,
                },
              ]}
            />
          </div>
          <div className="flex flex-row justify-around w-full">
            <p className="text-black">
              <span>
                <PiCircleNotchFill className="inline text-red-500 text-sm" />
              </span>{" "}
              Completed
            </p>
            <p className="text-black">
              <span>
                <PiCircleNotchFill className="inline text-purple-500 text-sm" />
              </span>{" "}
              Pending
            </p>
            <p className="text-black">
              <span>
                <PiCircleNotchFill className="inline text-green-500 text-sm" />
              </span>{" "}
              Cancelled
            </p>
          </div>
        </div>
      </div>
      <OrderChart />
      <CommissionersGraph />
    </div>
  );
};

export default Chart;
