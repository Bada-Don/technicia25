import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
const Logo = () => (
  <div className="flex items-center">
    <h3 className="cursor-pointer max-sm:text-[1rem]">Nayi Disha</h3>
  </div>
);

const menuItems = [
  { name: "Features", href: "#features" },
  { name: "Solution", href: "#solution" },
  { name: "Pricing", href: "#pricing" },
  { name: "About", href: "#about" },
];

export default function Navbar() {
  const [menuState, setMenuState] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="mb-24 top-0">
      <nav className="fixed top-0 left-0 right-0 z-20 w-full ">
        <div
          className={`mx-auto mt-4 px-6 transition-all duration-500 ease-in-out lg:px-12 ${
            isScrolled
              ? "bg-white/50 dark:bg-gray-900/50 max-w-4xl rounded-2xl border-gray-800 backdrop-blur-md lg:px-5 shadow-lg"
              : "max-w-6xl"
          }`}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <a
                href="/"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                <Logo />
              </a>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu
                  className={`m-auto size-6 duration-200 transition-all ${
                    menuState ? "rotate-180 scale-0 opacity-0" : ""
                  }`}
                />
                <X
                  className={`absolute inset-0 m-auto size-6 duration-200 transition-all ${
                    menuState
                      ? "rotate-0 scale-100 opacity-100"
                      : "-rotate-180 scale-0 opacity-0"
                  }`}
                />
              </button>
            </div>

            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <a
                      href={item.href}
                      className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 block duration-150"
                    >
                      <span>{item.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className={`bg-white dark:bg-gray-900 mb-6 w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-2xl shadow-gray-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent ${
                menuState ? "flex" : "hidden"
              }`}
            >
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <a
                        href={item.href}
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 block duration-150"
                      >
                        <span>{item.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <Link
                  to="/login"
                  className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors border-2 border-gray-300 bg-transparent hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ${
                    isScrolled ? "lg:hidden" : ""
                  }`}
                >
                  <span>Login</span>
                </Link>
                <Link
                  to="/signup"
                  className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors bg-[#7c35c7] hover:bg-[#4d217b] text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isScrolled ? "lg:hidden" : ""
                  }`}
                >
                  <span>Sign Up</span>
                </Link>
                <Link
                  to="/get-started"
                  className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors bg-[#7c35c7] hover:bg-[#4d217b] text-white  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isScrolled ? "lg:inline-flex" : "hidden"
                  }`}
                >
                  <span>Get Started</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
