import { useState, useEffect } from "react";
import { Menu, X, Search } from "lucide-react";
import { Link } from "react-router-dom";

const Logo = () => (
  <div className="flex items-center">
    <h3 className="cursor-pointer text-xl font-bold text-white">Nayi Disha</h3>
  </div>
);

const SearchBarWithButton = ({ searchQuery, onSearchChange, placeholder = "Search by name, country, technology..." }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onSearchChange("");
  };

  return (
    <div className="flex items-center w-full max-w-md gap-5" >
      <div className={`relative flex-1 transition-all duration-300 ${
        isFocused ? "transform scale-105" : ""
      }`}>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm hover:bg-gray-800/50"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 hover:scale-110"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <button 
        onClick={() => {
          // Search functionality can be enhanced here if needed
          // For now, it will trigger search as user types
        }}
        className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors duration-300 flex items-center gap-2 whitespace-nowrap shadow-sm"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search</span>
      </button>
    </div>
  );
};

export default function LeaderboardNavbar({ searchQuery, onSearchChange }) {
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
      <nav className="fixed top-0 left-0 right-0 z-50 w-full">
        <div
          className={`mx-auto mt-4 px-6 transition-all duration-500 ease-in-out lg:px-8 xl:px-12 ${
            isScrolled
              ? "bg-white/50 dark:bg-gray-900/50 max-w-7xl rounded-2xl border-gray-800 backdrop-blur-md shadow-lg"
              : "max-w-7xl"
          }`}
        >
          <div className="py-4 lg:py-5">
            {/* Three-div layout */}
            <div className="flex items-center justify-between gap-8 lg:gap-12">
              {/* First div - Logo */}
              <div className="flex items-center gap-4 flex-shrink-0">
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
                  className="relative z-20 -m-2.5 block cursor-pointer p-2.5 lg:hidden"
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

              {/* Second div - Search Bar with Button */}
              <div className="hidden lg:flex flex-1 justify-center max-w-lg mx-8">
                <SearchBarWithButton 
                  searchQuery={searchQuery}
                  onSearchChange={onSearchChange}
                />
              </div>

              {/* Third div - Dashboard Button */}
              <div className="hidden lg:flex items-center flex-shrink-0">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center rounded-xl px-6 py-2.5 text-sm font-medium transition-colors bg-purple-600 hover:bg-purple-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 whitespace-nowrap shadow-sm"
                >
                  <span>Dashboard</span>
                </Link>
              </div>
            </div>

            {/* Mobile Menu */}
            <div
              className={`bg-white dark:bg-gray-900 mb-6 w-full flex-col items-center justify-end space-y-6 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-2xl shadow-gray-300/20 lg:hidden ${
                menuState ? "flex" : "hidden"
              }`}
            >
              {/* Mobile Search */}
              <div className="w-full">
                <SearchBarWithButton 
                  searchQuery={searchQuery}
                  onSearchChange={onSearchChange}
                />
              </div>
              
              {/* Mobile Dashboard Button */}
              <div className="w-full">
                <Link
                  to="/dashboard"
                  className="w-full inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition-colors bg-purple-600 hover:bg-purple-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-sm"
                >
                  <span>Dashboard</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}