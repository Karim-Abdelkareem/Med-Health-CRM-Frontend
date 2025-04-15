import React, { useEffect, useRef, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiHome,
  FiSettings,
  FiUser,
  FiChevronDown,
} from "react-icons/fi";
import { Link } from "react-router";

export default function Sidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [bgColor, setBgColor] = useState("#000000");

  const dropdownRef = useRef(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  useEffect(() => {
    const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
    setBgColor(randomColor);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={`bg-gray-100 h-full shadow-lg flex flex-col border-r border-gray-200 justify-between bg-gray-1 text-black transition-all duration-300 ${
        isSidebarOpen ? "w-64" : "w-16"
      }`}
    >
      <div className="p-4" ref={dropdownRef}>
        {/* App logo and user dropdown */}
        <button
          onClick={toggleUserDropdown}
          className="flex justify-between w-full items-center hover:bg-gray-200 rounded duration-200 transition-all"
        >
          <div className="m-auto py-3 flex justify-between items-center w-full">
            <div
              className={`h-8 w-8  ${
                isSidebarOpen && "mr-4"
              } rounded-full flex items-center justify-center text-white font-bold`}
              style={{ backgroundColor: bgColor }}
            >
              A
            </div>
            {isSidebarOpen && (
              <>
                <div className="flex flex-col items-start">
                  {isSidebarOpen && (
                    <div className="ml-2 text-sm font-semibold">
                      Med-Health CRM
                    </div>
                  )}
                  <div className="flex items-center">
                    <span className="ml-2 text-xs text-gray-600 font-medium">
                      John Doe
                    </span>
                  </div>
                </div>
                <FiChevronDown className="ml-auto" />
              </>
            )}
          </div>
        </button>
        <div className="mb-6">
          {isUserDropdownOpen && (
            <div className="absolute left-2 max-w-60 right-0 mt-1 bg-white shadow-md rounded-md py-1 z-10 border border-gray-200">
              <a href="#" className="block px-4 py-2 text-sm hover:bg-gray-100">
                Profile
              </a>
              <a href="#" className="block px-4 py-2 text-sm hover:bg-gray-100">
                Settings
              </a>
              <Link
                to={"/login"}
                className="block px-4 py-2 text-sm hover:bg-gray-100 text-red-500"
              >
                Sign out
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar navigation */}
        <nav className="mt-6">
          <ul>
            <li className="mb-2">
              <a
                href="#"
                className="flex items-center p-2 hover:bg-gray-200 rounded duration-200 transition-all"
              >
                <FiHome className="text-sm" />
                {isSidebarOpen && <span className="ml-2">Dashboard</span>}
              </a>
            </li>
            <li className="mb-2">
              <a
                href="#"
                className="flex items-center p-2 hover:bg-gray-200 rounded"
              >
                <FiSettings className="text-sm" />
                {isSidebarOpen && <span className="ml-2">Settings</span>}
              </a>
            </li>
            <li className="mb-2">
              <a
                href="#"
                className="flex items-center p-2 hover:bg-gray-200 rounded"
              >
                <FiUser className="text-sm" />
                {isSidebarOpen && <span className="ml-2">Profile</span>}
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="p-4 mt-auto">
        <button
          onClick={toggleSidebar}
          className="w-full flex justify-start items-center p-2 text-base text-gray-800 hover:text-gray-900 font-semibold hover:bg-gray-200 rounded"
        >
          {isSidebarOpen ? <FiChevronLeft /> : <FiChevronRight />}
          {isSidebarOpen && <span className="ml-1 text-sm">Collapse</span>}
        </button>
      </div>
    </div>
  );
}
