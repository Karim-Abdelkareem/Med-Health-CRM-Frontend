import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiX, FiMenu } from "react-icons/fi";

export default function MobileMenu({
  user,
  routes,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) {
  const mobileMenuRef = useRef(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest(".mobile-menu-button")
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsMobileMenuOpen]);

  return (
    <>
      {/* Mobile Burger Menu Button */}
      <div className="fixed top-4 right-4 z-[500] md:hidden">
        <button
          onClick={toggleMobileMenu}
          className="mobile-menu-button rounded-xl p-3 bg-white shadow-md text-gray-700 hover:bg-gray-100"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <FiX size={30} /> : <FiMenu size={30} />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      <div
        ref={mobileMenuRef}
        className={`fixed inset-y-0 left-0 z-[500] w-[70%] bg-white/90 backdrop-blur-sm shadow-xl transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="pt-4">
            {/* App logo and user info */}
            <div className="p-4 flex items-center border-b border-gray-200 pb-6">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold mr-4"
                style={{ backgroundColor: "#000000" }}
              >
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex flex-col">
                <div className="text-base font-semibold">Med-Health CRM</div>
                <div className="text-sm text-gray-600">
                  {user?.name || "User"}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.role || "Guest"}
                </div>
              </div>
            </div>

            {/* Mobile navigation */}
            <nav className="mt-4">
              <ul>
                {routes.map((route) => (
                  <li key={route.path}>
                    <Link
                      to={route.path}
                      className="flex items-center px-4 py-3 hover:bg-white/80 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="mr-3 text-gray-700">
                        {React.cloneElement(route.icon, { size: 20 })}
                      </span>
                      <span className="font-medium">{route.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="mt-auto border-t border-gray-200 p-4">
            <Link
              to="/login"
              className="flex items-center text-red-500 hover:text-red-700 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="mr-2">Sign out</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Overlay when mobile menu is open */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[499] md:hidden"
          onClick={toggleMobileMenu}
        />
      )}
    </>
  );
}
