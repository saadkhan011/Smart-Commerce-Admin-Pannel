"use client";
import Image from "next/image";
import logo from "../assets/images/logo.png";
import dp from "../assets/images/dp.png";
import { useEffect, useRef, useState } from "react";
import {
  FaAngleDown,
  FaBell,
  FaBars,
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
import { IoCloseSharp, IoPerson } from "react-icons/io5";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [drawerOpen, setDrawerOpen] = useState(false); // State for drawer
  const [active, setActive] = useState("Dashboard");
  const [admin, setAdmin] = useState();
  const [token, settoken] = useState();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    settoken(localStorage.getItem("meatmetokenAdmin"));
    const storedUser = localStorage.getItem("meatmeAdmin");
    if (storedUser) {
      setAdmin(JSON.parse(storedUser));
    }
  }, []);
  const pathname = usePathname();

  const hiddenPaths = [
    "/login",
    "/register",
    "/resetpassword",
    "/forgotpassword",
    "/supplier-resetpassword",
    "/user-resetpassword",
  ]; // Add paths here

  // Check if the current path is in the hiddenPaths array
  const shouldShowHeader = !hiddenPaths.includes(pathname);

  const menuItems = [
    { name: "Dashboard", icon: FaHome, route: "/dashboard" },
    { name: "Buyers", icon: FaUtensils, route: "/buyers" },
    { name: "Suppliers", icon: FaTruck, route: "/suppliers" },
    { name: "Products", icon: FaBox, route: "/products" },
    { name: "Categories", icon: FaTruck, route: "/category" },
    { name: "Orders", icon: FaShoppingCart, route: "/order" },
    { name: "Settings", icon: FaCog, route: "/settings" },
    { name: "Listings", icon: FaLine, route: "/listings" },
    // { name: "Fees", icon: FaPercent, route: "/fees" },
  ];

  if (!shouldShowHeader) {
    return null;
  }

  const router = useRouter();
  const logoutButton = () => {
    localStorage.removeItem("meatmeAdmin");
    localStorage.removeItem("meatmetokenAdmin");
    router.push("/login");
  };
  const currentItem = menuItems.find((item) => item.route === pathname);
  console.log(currentItem);
  return (
    <>
      {token && (
        <div className="bg-white shadow-lg w-full">
          <div className="px-4 sm:px-6 lg:px-20">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <button
                  className="text-gray-500 lg:hidden cursor-pointer"
                  onClick={() => setDrawerOpen(!drawerOpen)}
                >
                  <FaBars className="h-6 w-6" />
                </button>
                <div className="flex-shrink-0 flex items-center ml-2 mx-8 md:mx-0 lg:ml-0">
                  <Image src={logo} width={120} height={120} alt="logo" />
                  <span className="ml-16 text-xl font-semibold text-black">
                    {currentItem ? currentItem?.name : ""}
                  </span>
                </div>
              </div>

              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                {/* <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                  <FaBell className="h-6 w-6 text-red-500" />
                </button> */}
                <div className="ml-3 relative">
                  <div className="flex items-center">
                    <Image
                      className="h-8 w-8 rounded-full"
                      src={dp}
                      alt="User profile"
                      width={40}
                      height={40}
                    />
                    <div className="text-black px-3">
                      <p className="font-bold">John Doe</p>
                      <p className="text-sm">Admin</p>
                    </div>
                    <button
                      type="button"
                      className="bg-white flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5a46cf]"
                      id="user-menu-button"
                      aria-expanded="false"
                      aria-haspopup="true"
                      onClick={() => setMenuOpen(!menuOpen)}
                    >
                      <FaAngleDown className="h-6 w-6 text-[#5a46cf]" size={25} />
                    </button>
                  </div>
                  {/* Dropdown Menu */}
                  {menuOpen && (
                    <div
                      ref={menuRef} // Assign ref to the menu container
                      className="z-10 origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu-button"
                    >
                      <a
                        href="/settings"
                        className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                        role="menuitem"
                      >
                        Your Profile
                      </a>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-[#5a46cf] hover:bg-gray-100"
                        role="menuitem"
                        onClick={logoutButton}
                      >
                        Sign out
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Drawer */}
          <div
            className={`fixed inset-0 z-40 bg-slate-600 bg-opacity-75 transition-transform  transform ${
              drawerOpen ? "translate-x-0" : "-translate-x-full"
            } lg:hidden`}
            onClick={() => setDrawerOpen(false)}
          >
            <div className="w-64 bg-slate-800 h-full text-white">
              <div className="flex justify-end p-4 ">
                <IoCloseSharp
                  className="cursor-pointer"
                  size={25}
                  onClick={() => setDrawerOpen(false)}
                />
              </div>
              <ul className="space-y-6 px-4 mt-5 ">
                {menuItems.map((item) => (
                  <li
                    key={item.name}
                    className={`flex items-center py-2 px-3 rounded-md cursor-pointer ${
                      active === item.name
                        ? "bg-[#6C53FD]"
                        : "hover:bg-[#6C53FD] hover:text-white"
                    }`}
                    onClick={() => setActive(item.name)}
                  >
                    <Link
                      href={item.route}
                      className="flex items-center space-x-2 w-full"
                    >
                      <item.icon className="h-6 w-6" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
                <li
                  className="flex items-center py-2 px-3 rounded-md cursor-pointer hover:bg-[#6C53FD] hover:text-white"
                  onClick={logoutButton}
                >
                  <Link href="" className="flex items-center space-x-2 w-full">
                    <IoPerson className="h-6 w-6" />
                    <span>Logout</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
