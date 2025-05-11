import React, { useEffect, useRef, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiHome,
  FiSettings,
  FiUser,
  FiChevronDown,
  FiCalendar,
  FiBell,
} from "react-icons/fi";
import { MdOutlineAddLocationAlt, MdOutlineEditCalendar } from "react-icons/md";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationsContext";
import { BsListTask } from "react-icons/bs";
import { HiOutlineUserAdd } from "react-icons/hi";
import MobileMenu from "./MobileMenu";
import { FaHistory } from "react-icons/fa";
import { IoPersonOutline } from "react-icons/io5";

export default function Sidebar() {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dropdownRef = useRef(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

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

  const role = user?.role;
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    switch (role) {
      case "GM":
        setRoutes(GMRoutes);
        break;
      case "R":
        setRoutes(RepresentativeRoutes);
        break;
      case "HR":
        setRoutes(HRRoutes);
        break;
      case "LM":
        setRoutes(LMRoutes);
        break;
      default:
        break;
    }
  }, [role]);

  const RepresentativeRoutes = [
    {
      path: "/",
      name: "Dashboard",
      icon: <FiHome />,
    },
    {
      path: "/create-plans",
      name: "Create Plan",
      icon: <MdOutlineEditCalendar />,
    },
    {
      path: "/my-plans",
      name: "My Plans",
      icon: <FiCalendar />,
    },
    {
      path: "/history",
      name: "History",
      icon: <FaHistory />,
    },
    {
      path: "/notifications",
      name: "Notifications",
      icon: <FiBell />,
      badge: true,
    },
    {
      path: "/profile",
      name: "Profile",
      icon: <FiUser />,
    },
  ];

  const GMRoutes = [
    {
      path: "/",
      name: "Dashboard",
      icon: <FiHome />,
    },
    {
      path: "/users-plans",
      name: "Users Plans",
      icon: <BsListTask />,
    },
    {
      path: "/add-user",
      name: "Add User",
      icon: <HiOutlineUserAdd />,
    },
    {
      path: "/add-location",
      name: "Location",
      icon: <MdOutlineAddLocationAlt />,
    },
    {
      path: "/settings",
      name: "Settings",
      icon: <FiSettings />,
    },
    {
      path: "/profile",
      name: "Profile",
      icon: <FiUser />,
    },
    {
      path: "/notifications",
      name: "Notifications",
      icon: <FiBell />,
      badge: true,
    },
  ];

  const HRRoutes = [
    {
      path: "/",
      name: "Dashboard",
      icon: <FiHome />,
    },
    {
      path: "/add-location",
      name: "Location",
      icon: <MdOutlineAddLocationAlt />,
    },
    {
      path: "/users-plans",
      name: "Users Plans",
      icon: <BsListTask />,
    },
    {
      path: "/add-user",
      name: "Add User",
      icon: <HiOutlineUserAdd />,
    },
    {
      path: "/users",
      name: "Users List",
      icon: <IoPersonOutline />,
    },
    {
      path: "/profile",
      name: "Profile",
      icon: <FiUser />,
    },
    {
      path: "/notifications",
      name: "Notifications",
      icon: <FiBell />,
      badge: true,
    },
  ];

  const LMRoutes = [
    {
      path: "/",
      name: "Dashboard",
      icon: <FiHome />,
    },
    {
      path: "/users",
      name: "Users Plan",
      icon: <IoPersonOutline />,
    },
    {
      path: "/add-task",
      name: "Add Task",
      icon: <HiOutlineUserAdd />,
    },
    {
      path: "/reports",
      name: "Reports",
      icon: <FaHistory />,
    },
    {
      path: "/profile",
      name: "Profile",
      icon: <FiUser />,
    },
    {
      path: "/notifications",
      name: "Notifications",
      icon: <FiBell />,
      badge: true,
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`bg-gray-100 h-full shadow-lg flex-col border-r border-gray-200 justify-between text-black transition-[width] duration-300 overflow-hidden hidden md:flex ${
          isSidebarOpen ? "w-64" : "w-16"
        }`}
      >
        <div className="pt-4" ref={dropdownRef}>
          {/* App logo and user dropdown */}
          <button
            onClick={toggleUserDropdown}
            className={`flex justify-between w-full items-center hover:bg-gray-200 rounded duration-200 transition-all`}
          >
            <div className="m-auto p-4 flex justify-between items-center w-full">
              <div
                className={`h-8 w-8 ${
                  isSidebarOpen && "mr-4"
                } rounded-full flex items-center justify-center text-white font-bold`}
                style={{ backgroundColor: "#000000" }}
              >
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              {isSidebarOpen && (
                <>
                  <div className="flex flex-col items-start">
                    {isSidebarOpen && (
                      <div className="ml-2 text-sm font-semibold">
                        Med-Health CRM
                      </div>
                    )}
                    <div className="flex flex-col items-start">
                      <span className="ml-2 text-xs text-gray-600 font-medium">
                        {user?.name || "User"}
                      </span>
                      <span className="ml-2 text-xs text-gray-600 font-medium">
                        {user?.role || "Guest"}
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
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Profile
                </Link>
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
              {routes.map((route, index) => (
                <li key={index} className="mb-2">
                  <Link
                    to={route.path}
                    className={`flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors ${
                      window.location.pathname === route.path
                        ? "bg-gray-200"
                        : ""
                    }`}
                  >
                    <span className="text-xl">{route.icon}</span>
                    {isSidebarOpen && (
                      <span className="ml-3">{route.name}</span>
                    )}
                    {route.badge && unreadCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-auto">
          <button
            onClick={toggleSidebar}
            className={`w-full flex ${
              isSidebarOpen ? "justify-start" : "justify-center"
            } items-center p-4 text-base text-gray-800 hover:text-gray-900 font-semibold hover:bg-gray-200 rounded`}
          >
            {isSidebarOpen ? <FiChevronLeft /> : <FiChevronRight />}
            {isSidebarOpen && <span className="ml-1 text-sm">Collapse</span>}
          </button>
        </div>
      </div>

      {/* Mobile Menu Component */}
      <MobileMenu
        user={user}
        routes={routes}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
    </>
  );
}
