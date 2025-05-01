import React from "react";
import {
  BsChevronDown,
  BsPersonFill,
  BsThreeDotsVertical,
} from "react-icons/bs";
import { MdCalendarToday } from "react-icons/md";
import Chart from "react-apexcharts";

export default function Dashboard() {
  const options = {
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: {
        enabled: false,
      },
    },
    xaxis: {
      categories: [
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
      ],
    },

    stroke: {
      curve: "smooth",
      colors: ["#1E3A8A"],
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0.1,
        colorStops: [
          { offset: 0, color: "#1E3A8A", opacity: 0.8 },
          { offset: 100, color: "#1E3A8A", opacity: 0 },
        ],
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      colors: ["#1E3A8A"],
      strokeColors: "#1E3A8A",
      strokeWidth: 2,
    },
    tooltip: {
      theme: "light",
      marker: {
        fillColors: ["#1E3A8A"],
      },
    },
  };

  const series = [
    {
      name: "Users",
      data: [300, 400, 350, 500, 490, 600, 700, 800, 900, 850, 750, 650],
    },
  ];

  const optionsDonut = {
    labels: ["MEMBERS ONLY", "VIP ONLY"],
    colors: ["#1E3A8A", "#60A5FA"],
    legend: { show: false },
    dataLabels: { enabled: true },
  };

  const total = 1000 + 200;
  const regularPercent = ((1000 / total) * 100).toFixed(2);
  const vipPercent = ((200 / total) * 100).toFixed(2);

  const seriesDonut = [1000, 200];

  return (
    <>
      <div className="container mt-10 mx-auto p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-2">User</p>
                <h3 className="text-xl font-semibold">1000</h3>
              </div>
              <BsPersonFill size={36} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-2">Plan</p>
                <h3 className="text-xl font-semibold">1000</h3>
              </div>
              <MdCalendarToday size={36} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-2">Represntative</p>
                <h3 className="text-xl font-semibold">1000</h3>
              </div>
              <BsPersonFill size={36} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-2">User</p>
                <h3 className="text-xl font-semibold">1000</h3>
              </div>
              <BsPersonFill size={36} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-16">
          <div className="col-span-2 bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Analytics</h2>
                <p className="text-gray-400 text-sm">
                  Lorem ipsum dolor sit amet, consectetur adip
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="border rounded-lg px-3 py-1 text-sm bg-white flex items-center gap-2">
                  Users
                  <BsChevronDown className="text-red-500 font-bold" />
                </button>
                <select className="border rounded-lg px-3 py-1 text-sm bg-white">
                  <option>2025</option>
                  <option>2024</option>
                  <option>2023</option>
                </select>
                <button className="p-1">
                  <BsThreeDotsVertical className="text-gray-400" />
                </button>
              </div>
            </div>
            <div className="h-[350px] bg-white rounded-lg">
              {/* Chart placeholder */}
              <Chart
                options={options}
                series={series}
                type="area"
                height={350}
              />
            </div>
          </div>
          {/*"Donut Desktop"*/}
          <div className="hidden md:block bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">Event Type</h2>
            </div>
            <div className="h-[350px]">
              <div className="mb-6">
                <Chart
                  options={optionsDonut}
                  series={seriesDonut}
                  type="donut"
                  height={350}
                />
              </div>
              <div className="space-y-3">
                <EventTypeRow
                  color="#1E3A8A"
                  label="MEMBERS ONLY"
                  percentage={`${regularPercent}%`}
                />
                <EventTypeRow
                  color="#60A5FA"
                  label="Representative"
                  percentage={`${vipPercent}%`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const EventTypeRow = ({ color, label, percentage }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
      ></div>
      <span className="text-sm">{label}</span>
    </div>
    <span className="text-sm text-green-500">{percentage}</span>
  </div>
);
