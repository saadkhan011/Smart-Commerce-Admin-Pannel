"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api";
import { Button } from "antd";
import { useGetQuery } from "../query";
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

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
const years = [2020, 2021, 2022, 2023, 2024]; // You can add more years as needed
const quarters = ["Q1", "Q2", "Q3", "Q4"];
const monthDays = {
  Jan: 31,
  Feb: 28,
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

const OrderChart = () => {
  let user;
  const [selected, setSelected] = useState("Month"); // Default selected button
  const [selectedDropdownValue, setSelectedDropdownValue] = useState("");
  const [selectedDropdownData, setSelectedDropdownData] = useState();
  const [type, setType] = useState("supplier"); // Default type
  const [selectedYear, setSelectedYear] = useState(years[0]); // Default year
  const [selectedQuarter, setSelectedQuarter] = useState(quarters[0]); // Default quarter
  const [selectedMonth, setSelectedMonth] = useState(
    monthNames[new Date().getMonth()]
  ); // Default to the current month
  const [selectedValue, setSelectedValue] = useState(
    monthNames[new Date().getMonth()]
  ); // Set initial selected value

  if (typeof window !== "undefined") {
    user = JSON.parse(localStorage.getItem("meatmeuserweb"));
  }
  let token;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("meatmetokenAdmin");
  }

  const { data, isLoading } = useGetQuery({
    queryKey: ["Supplier", type],
    url: `${type}?limit=${100000}`,
  });
  useEffect(()=>{
    if(data){
      setSelectedDropdownData(data.supplier ? data.supplier : data.restaurants);
    }
  })

  const getDropdownOptions = () => {
    switch (selected) {
      case "Month":
        return monthNames;
      case "Year":
        return years;
      case "Quarter":
        return quarters;
      default:
        return [];
    }
  };

  const handleDropdownChange = (e) => {
    const selectedValue = e.target.value;
    if (selected === "Month") {
      setSelectedMonth(selectedValue);
    } else if (selected === "Year") {
      setSelectedYear(selectedValue);
    } else if (selected === "Quarter") {
      setSelectedQuarter(selectedValue);
    }
    setSelectedValue(selectedValue);
  };

  // Initial chart data
  const [chartData, setChartData] = useState({
    series: [
      {
        name: "Sales",
        data: [],
      },
    ],
    options: {
      chart: {
        height: 350,
        type: "area",
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
      },
      colors: ["#FF0000"],
      xaxis: {
        type: "category",
        categories: [],
      },
      yaxis: {
        labels: {
          formatter: function (value) {
            return `${value}`;
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
            return `Day ${value}`;
          },
        },
      },
    },
  });

  // Function to fetch sales data from the API
  const fetchSalesData = async () => {
    let url = `${API_BASE_URL}/admin/order-graph-data?type=${selected}&selectedValue=${selectedValue}`;

    // Add restaurantId only if selectedRestaurant has a value
    if (selectedDropdownValue && type === "restaurant") {
      url += `&restaurantId=${selectedDropdownValue}`;
    }
    if (selectedDropdownValue && type === "supplier") {
      url += `&supplierId=${selectedDropdownValue}`;
    }
    
    
    try {
      const response = await axios.get(url, {
        headers: {
          "x-access-token": token,
        },
      });

      const salesData = response.data.data;

      if (Array.isArray(salesData)) {
        const salesAmounts = salesData.map((item) => item.totalOrders);
        let categories = [];
        let tooltipFormatter;

        // Adjust categories and tooltip format based on selected time range
        if (selected === "Month") {
          categories = salesData.map((item) => item.day); // Day of the month
          tooltipFormatter = (value) => `Day ${value}`;
        } else if (selected === "Year") {
          categories = monthNames; // Show month names on x-axis
          tooltipFormatter = (value) => `${value}`; // Show month name in tooltip
        } else if (selected === "Quarter") {
          const quarterMonths = {
            Q1: ["Jan", "Feb", "Mar"],
            Q2: ["Apr", "May", "Jun"],
            Q3: ["Jul", "Aug", "Sep"],
            Q4: ["Oct", "Nov", "Dec"],
          };
          categories = quarterMonths[selectedValue]; // Show months for the selected quarter
          tooltipFormatter = (value) => `${value}`; // Show month name in tooltip
        }

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

  useEffect(() => {
    fetchSalesData();
  }, [selected, selectedValue, selectedDropdownValue]);

  return (
    <div className="w-full p-4 mt-6">
      <div>
        <div className="flex md:flex-row flex-col  my-2">
          <div className="md:w-1/2 w-full mt-2 ">
            <Button
              className={`${
                selected === "Month"
                  ? "bg-[#e62f39] text-white"
                  : "bg-white hover:bg-[#e62f39] text-[#e62f39] border border-[#e62f39]"
              } rounded-2xl p-4 me-2`}
              onClick={() => setSelected("Month")}
            >
              Month
            </Button>

            <Button
              className={`${
                selected === "Quarter"
                  ? "bg-[#e62f39] text-white"
                  : "bg-white text-[#e62f39] border border-[#e62f39]"
              } rounded-2xl p-4 mx-2`}
              onClick={() => setSelected("Quarter")}
            >
              Quarter
            </Button>

            <Button
              className={`${
                selected === "Year"
                  ? "bg-[#e62f39] text-white"
                  : "bg-white text-[#e62f39] border border-[#e62f39]"
              } rounded-2xl p-4 mx-2`}
              onClick={() => setSelected("Year")}
            >
              Year
            </Button>
          </div>

          <div className="md:w-1/2 w-full mt-2  text-end">
            <select
              className="border p-2 text-black me-4"
              value={type}
              onChange={(e) => setType(e.target.value)} // Add onChange handler here
            >
              <option value="" disabled>
                Select
              </option>
              <option value="">All</option>
              <option value="restaurant">Restaurant</option>
              <option value="supplier">Supplier</option>
            </select>
            <select
              className="border p-2 text-black"
              value={selectedDropdownValue}
              onChange={(e) => setSelectedDropdownValue(e.target.value)} // Add onChange handler here
            >
              <option value="" disabledZ>
                Select Supplier
              </option>
              <option value="">All</option>
              {data &&
                Array.isArray(selectedDropdownData) &&
                selectedDropdownData.map((element, indx) => (
                  <option key={indx} value={element._id}>
                    {element.name}
                  </option>
                ))}
            </select>
          </div>
          
        </div>

        <div className="bg-white rounded-lg shadow-lg h-80 md:col-span-2">
          <div className="flex items-center p-2">
            <h3 className="text-black text-xl w-1/2 font-semibold">
              Order Distribution
            </h3>
            <div className="w-1/2 flex justify-end">
              <select
                className="border rounded p-1 px-3 bg-red-50 border-red-600 text-black"
                value={selectedValue}
                onChange={handleDropdownChange}
              >
                {getDropdownOptions().map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div id="chart">
            <ReactApexChart
              options={chartData.options}
              series={chartData.series}
              type="area"
              height={280}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderChart;
