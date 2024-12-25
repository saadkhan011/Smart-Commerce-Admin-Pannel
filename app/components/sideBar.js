"use client";
import {
  FaHome,
  FaUtensils,
  FaTruck,
  FaBox,
  FaShoppingCart,
  FaCog,
  FaLine,
  FaPercent,
} from "react-icons/fa";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const [admin, setAdmin] = useState();
  const [token, settoken] = useState();
  const pathname = usePathname();
  const hiddenPaths = [
    "/login",
    "/register",
    "/resetpassword",
    "/forgotpassword",
    "/supplier-resetpassword",
    "/user-resetpassword",
  ]; // Paths where the sidebar should be hidden
  useEffect(() => {
    settoken(localStorage.getItem("meatmetokenAdmin"));
    const storedUser = localStorage.getItem("meatmeAdmin");
    if (storedUser) {
      setAdmin(JSON.parse(storedUser));
    }
  }, []);
  // Check if the current path is in the hiddenPaths array
  const shouldShowHeader = !hiddenPaths.includes(pathname);

  const menuItems = [
    { name: "Dashboard", icon: FaHome, route: "/dashboard" },
    { name: "Buyers", icon: FaUtensils, route: "/buyers" },
    { name: "Suppliers", icon: FaTruck, route: "/suppliers" },
    { name: "Category", icon: FaBox, route: "/category" },
    { name: "Products", icon: FaBox, route: "/products" },
    { name: "Orders", icon: FaShoppingCart, route: "/order" },
    { name: "Settings", icon: FaCog, route: "/settings" },
    // { name: "Listings", icon: FaLine, route: "/listings" },
    // { name: "Fees", icon: FaPercent, route: "/fees" },
  ];

  const [active, setActive] = useState("");

  useEffect(() => {
    // Check the current pathname and set the active menu item accordingly
    const currentItem = menuItems.find((item) => item.route === pathname);
    if (currentItem) {
      setActive(currentItem.name);
    }
  }, [pathname]);

  if (!shouldShowHeader) {
    return null;
  }

  return (
    <>
      {token && (
        <div className="lg:flex flex-col bg-white text-black w-64  shadow-lg hidden sidebar">
          <ul className="space-y-2 mx-auto mt-5">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.route}
                className={`flex items-center w-36 py-2 rounded-md px-2 space-x-2 cursor-pointer ${
                  active === item.name
                    ? "bg-[#5a46cf] text-white"
                    : "hover:bg-[#6C53FD] hover:text-white"
                }`}
                onClick={() => setActive(item.name)}
              >
                <div>
                  <p className="flex items-center space-x-2 m-0">
                    <item.icon />
                    <span>{item.name}</span>
                  </p>
                </div>
              </Link>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default Sidebar;
