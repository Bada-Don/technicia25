import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import LeaderboardNavbar from "../components/LeaderboardNavbar";

// ProfilePhoto component for circular profile images
const ProfilePhoto = ({ name, size = "w-8 h-8" }) => {
  // Generate consistent colors based on name
  const getInitials = (fullName) => {
    return fullName
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase();
  };

  const getBackgroundColor = (name) => {
    const colors = [
      "bg-purple-600",
      "bg-blue-600",
      "bg-green-600",
      "bg-yellow-600",
      "bg-pink-600",
      "bg-indigo-600",
      "bg-red-600",
      "bg-teal-600",
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <div
      className={`${size} rounded-full ${getBackgroundColor(
        name
      )} flex items-center justify-center text-white text-xs font-semibold shadow-sm ring-2 ring-gray-800`}
    >
      {getInitials(name)}
    </div>
  );
};

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Fetch leaderboard data from API
const fetchLeaderboardData = async (role = "Student") => {
  try {
    const response = await axios.get(`${API_BASE_URL}/leaderboard/all`, {
      params: { role, limit: 200 }
    });
    return response.data || [];
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    return [];
  }
};

// Fetch available technologies
const fetchTechnologies = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/leaderboard/technologies`);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching technologies:", error);
    return [];
  }
};

const Loader = () => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
  </div>
);

const NoData = ({ message = "No leaderboard data available." }) => (
  <div className="p-6 text-center text-sm text-gray-400 opacity-80">
    {message}
  </div>
);

const RankHighlight = ({ rank }) => {
  let bgColor = "bg-purple-600/10 text-purple-400 border-purple-600/20";
  
  // Highlight top 3 ranks
  if (rank === 1) {
    bgColor = "bg-yellow-600/20 text-yellow-400 border-yellow-600/40";
  } else if (rank === 2) {
    bgColor = "bg-gray-400/20 text-gray-300 border-gray-400/40";
  } else if (rank === 3) {
    bgColor = "bg-orange-600/20 text-orange-400 border-orange-600/40";
  }
  
  return (
    <div className={`px-2 py-1 rounded-md text-xs font-semibold border ${bgColor} inline-flex items-center gap-1`}>
      {rank <= 3 && <span>🏆</span>}
      <span>#{rank}</span>
    </div>
  );
};

const LeaderBoardTable = React.memo(function LeaderBoardTable({
  rows,
  currentUserId,
}) {
  if (!rows || rows.length === 0)
    return <NoData message="No users match the current filter criteria." />;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800">
      <table className="min-w-full divide-y divide-gray-800 table-auto">
        <colgroup>
          <col className="w-16" />
          <col className="w-48" />
          <col className="w-20" />
          <col className="w-24" />
          <col className="w-32" />
          <col className="w-16" />
        </colgroup>
        <thead className="sticky top-0 bg-[#0d0d0d] z-10">
          <tr className="text-left text-xs uppercase text-gray-400 tracking-wider">
            <th className="px-4 py-4 font-semibold">Rank</th>
            <th className="px-4 py-4 font-semibold">Name</th>
            <th className="px-4 py-4 font-semibold">Role</th>
            <th className="px-4 py-4 font-semibold">Technology</th>
            <th className="px-4 py-4 font-semibold">Country</th>
            <th className="px-4 py-4 font-semibold text-right">Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {rows.map((row) => (
            <tr
              key={row.user_id}
              className={`hover:bg-[#111] transition-colors duration-200 ${
                row.user_id === currentUserId
                  ? "bg-gradient-to-r from-purple-900/40 to-transparent"
                  : ""
              }`}
            >
              <td className="px-4 py-3 align-middle">
                <RankHighlight rank={row.rank} />
              </td>
              <td className="px-4 py-3 align-middle">
                <div className="flex items-center gap-3">
                  <ProfilePhoto name={row.name} />
                  <div>
                    <div className="font-medium text-white">{row.name}</div>
                    <div className="text-xs text-gray-400">{row.email || `ID: ${row.user_id.slice(0, 8)}...`}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 align-middle text-gray-300">
                {row.role}
              </td>
              <td className="px-4 py-3 align-middle">
                <span className="px-2 py-1 bg-blue-900/30 border border-blue-600/30 rounded-md text-xs font-medium text-blue-300">
                  {row.technology}
                </span>
              </td>
              <td className="px-4 py-3 align-middle text-gray-300">
                {row.country}
              </td>
              <td className="px-4 py-3 align-middle">
                <div className="flex flex-col items-end">
                  <span className="font-semibold text-purple-400">{row.percentage}%</span>
                  <span className="text-xs text-gray-400">({row.score} pts)</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

const LeaderBoardCard = React.memo(function LeaderBoardCard({
  rows,
  currentUserId,
}) {
  if (!rows || rows.length === 0)
    return <NoData message="No users match the current filter criteria." />;

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div
          key={row.user_id}
          className={`p-4 rounded-2xl border border-gray-800 shadow-sm hover:bg-gray-900/50 transition-colors duration-200 ${
            row.user_id === currentUserId
              ? "bg-purple-950/40 border-purple-600"
              : "bg-[#070707]"
          }`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <RankHighlight rank={row.rank} />
              <ProfilePhoto name={row.name} size="w-10 h-10" />
              <div>
                <div className="font-semibold text-white">{row.name}</div>
                <div className="text-xs text-gray-400 mb-1">
                  {row.role} • {row.country}
                </div>
                <span className="px-2 py-0.5 bg-blue-900/30 border border-blue-600/30 rounded-md text-xs font-medium text-blue-300">
                  {row.technology}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-xl font-bold text-purple-400">{row.percentage}%</div>
              <div className="text-xs text-gray-400">{row.score} pts</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

// New Tab Switcher Component
const RoleTabs = ({ activeRole, onRoleChange }) => {
  const getTabClass = (role) =>
    `px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
      activeRole === role
        ? "border-purple-600 text-purple-400"
        : "border-transparent text-gray-400 hover:text-gray-200"
    }`;

  return (
    <div className="flex border-b border-gray-700 mb-6">
      <button
        onClick={() => onRoleChange("Student")}
        className={getTabClass("Student")}
      >
        Students
      </button>
      <button
        onClick={() => onRoleChange("Teacher")}
        className={getTabClass("Teacher")}
      >
        Teachers
      </button>
    </div>
  );
};

export default function LeaderBoardPage({
  currentUserId = null,
}) {
  const [availableTechnologies, setAvailableTechnologies] = useState([]);
  const [selectedTechnology, setSelectedTechnology] = useState("All"); // Show all by default
  const [activeRole, setActiveRole] = useState("Student"); // New state for role filter
  const [searchQuery, setSearchQuery] = useState(""); // New search state
  const [loading, setLoading] = useState(false);
  const [rawRows, setRawRows] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 30;

  // Fetch available technologies on mount
  useEffect(() => {
    const loadTechnologies = async () => {
      const techs = await fetchTechnologies();
      setAvailableTechnologies(techs);
    };
    loadTechnologies();
  }, []);

  // Fetch leaderboard data based on role
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);

      try {
        const data = await fetchLeaderboardData(activeRole);
        if (!cancelled) {
          setRawRows(data);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setRawRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => (cancelled = true);
  }, [activeRole]);

  // Filter and sort the raw data
  const filteredAndAggregatedRows = useMemo(() => {
    if (!rawRows || rawRows.length === 0) return [];

    let filteredData = [...rawRows];

    // 1. Technology Filter
    if (selectedTechnology !== "All") {
      filteredData = filteredData.filter(
        (row) => row.technology?.toLowerCase().includes(selectedTechnology.toLowerCase())
      );
    }

    // 2. Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredData = filteredData.filter(
        (row) =>
          (row.name && row.name.toLowerCase().includes(query)) ||
          (row.country && row.country.toLowerCase().includes(query)) ||
          (row.technology && row.technology.toLowerCase().includes(query)) ||
          (row.user_id && row.user_id.toLowerCase().includes(query)) ||
          (row.email && row.email.toLowerCase().includes(query))
      );
    }

    // 3. Sort by percentage
    const sortedArr = [...filteredData].sort((a, b) => b.percentage - a.percentage);

    // 4. Re-apply ranks after filtering and sorting
    sortedArr.forEach((r, i) => (r.rank = i + 1));

    return sortedArr;
  }, [rawRows, selectedTechnology, searchQuery]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAndAggregatedRows.slice(start, start + pageSize);
  }, [filteredAndAggregatedRows, page]);

  // Handle responsiveness
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <>
      <LeaderboardNavbar
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchQuery(query);
          setPage(1); // Reset page on search
        }}
      />
      <div className="pt-8 p-4 sm:p-6 lg:p-12 min-h-screen bg-[#000]">
        {/* Leaderboard Section */}
        <section className="mb-8 sm:mb-10">
          {/* Centered Leaderboard Heading */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              🏆 Leaderboard
            </h1>
            <p className="text-gray-400 text-base max-w-2xl mx-auto">
              Compete with peers and track your progress across different technologies.
              Rankings are based on test performance.
            </p>
          </div>

          {/* Filters Section */}
          <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-4 sm:p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Technology Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  💻 Technology
                </label>
                <select
                  value={selectedTechnology}
                  onChange={(e) => {
                    setSelectedTechnology(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                >
                  <option value="All">All Technologies</option>
                  {availableTechnologies.map((tech) => (
                    <option key={tech.skill_id} value={tech.skill_name}>
                      {tech.skill_name} ({tech.total_attempts} tests)
                    </option>
                  ))}
                </select>
              </div>

              {/* Stats Summary */}
              <div className="flex items-end">
                <div className="w-full bg-purple-900/20 border border-purple-600/30 rounded-lg px-4 py-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Total Participants</p>
                      <p className="text-lg font-bold text-purple-400">
                        {filteredAndAggregatedRows.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Technologies</p>
                      <p className="text-lg font-bold text-purple-400">
                        {availableTechnologies.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-4 sm:mb-6 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold">
                {searchQuery
                  ? `Search Results - ${activeRole}s`
                  : selectedTechnology !== "All"
                  ? `${selectedTechnology} - ${activeRole}s`
                  : `Top ${activeRole}s`}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {searchQuery ? (
                  <span>
                    Found {filteredAndAggregatedRows.length} result(s)
                  </span>
                ) : (
                  <span>Showing {paginatedRows.length} of {filteredAndAggregatedRows.length} participants</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Ranked by best score</span>
            </div>
          </div>

          {/* Search Results Indicator */}
          {searchQuery && (
            <div className="mb-4 px-4 py-3 bg-purple-900/20 border border-purple-600/30 rounded-lg flex items-center justify-between">
              <span className="text-sm text-purple-300">
                Searching for:{" "}
                <span className="font-semibold text-purple-100">
                  "{searchQuery}"
                </span>
              </span>
              <button
                onClick={() => setSearchQuery("")}
                className="px-3 py-1 text-purple-400 hover:text-purple-200 hover:bg-purple-900/30 text-xs rounded transition-colors"
              >
                Clear
              </button>
            </div>
          )}

          {/* Role Tab Switcher */}
          <RoleTabs
            activeRole={activeRole}
            onRoleChange={(role) => {
              setActiveRole(role);
              setPage(1); // Reset page on role change
            }}
          />

          <div className="mb-4">
            {loading ? (
              <Loader />
            ) : paginatedRows.length === 0 ? (
              <NoData
                message={
                  searchQuery
                    ? `No ${activeRole.toLowerCase()}s found matching "${searchQuery}".`
                    : `No ${activeRole.toLowerCase()}s found.`
                }
              />
            ) : isMobile ? (
              <LeaderBoardCard
                rows={paginatedRows}
                currentUserId={currentUserId}
              />
            ) : (
              <LeaderBoardTable
                rows={paginatedRows}
                currentUserId={currentUserId}
              />
            )}
          </div>

          {/* Pagination Controls */}
          {filteredAndAggregatedRows.length > pageSize && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-3 p-4 bg-gray-900/40 border border-gray-800 rounded-lg">
              <div className="text-sm text-gray-400">
                Page <span className="font-semibold text-purple-400">{page}</span> of{" "}
                <span className="font-semibold text-purple-400">
                  {Math.ceil(filteredAndAggregatedRows.length / pageSize)}
                </span>
                {" "}• Total: {filteredAndAggregatedRows.length} participants
              </div>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 rounded-lg border border-gray-700 bg-[#121212] hover:bg-purple-900 hover:border-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ← Previous
                </button>
                <button
                  className="px-4 py-2 rounded-lg border border-gray-700 bg-[#121212] hover:bg-purple-900 hover:border-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  onClick={() =>
                    setPage((p) =>
                      Math.min(
                        Math.ceil(filteredAndAggregatedRows.length / pageSize),
                        p + 1
                      )
                    )
                  }
                  disabled={page * pageSize >= filteredAndAggregatedRows.length}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
