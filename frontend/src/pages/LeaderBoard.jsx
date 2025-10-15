import React, { useEffect, useMemo, useState } from "react";
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

// Mock data generator for the updated structure
const generateMockData = (selectedSkills) => {
  const names = [
    "Alex Johnson",
    "Sarah Chen",
    "Michael Brown",
    "Emily Davis",
    "James Wilson",
    "Maria Garcia",
    "David Lee",
    "Jessica Taylor",
    "Robert Martinez",
    "Lisa Anderson",
    "John Thompson",
    "Amy White",
    "Chris Martin",
    "Rachel Green",
    "Tom Harris",
  ];
  const countries = [
    "United States",
    "China",
    "United Kingdom",
    "Canada",
    "Australia",
    "Spain",
    "South Korea",
    "United States",
    "Mexico",
    "United States",
    "Canada",
    "United States",
    "United Kingdom",
    "United States",
    "United States",
  ];
  const technologies = [
    "React",
    "Node.js",
    "Python",
    "Express",
    "React",
    "Python",
    "Node.js",
    "Express",
    "React",
    "Python",
    "Node.js",
    "Express",
    "React",
    "Python",
    "Express",
  ];
  const roles = ["Student", "Teacher"];

  // Combine data for all selected skills
  let combinedData = [];

  for (let i = 0; i < names.length; i++) {
    const isStudent = Math.random() > 0.4; // More students for variety
    const role = isStudent ? "Student" : "Teacher";
    const primarySkill =
      selectedSkills[Math.floor(Math.random() * selectedSkills.length)];

    combinedData.push({
      id: `u${i + 1}`,
      name: names[i],
      role: role,
      country: countries[i],
      technology: technologies[i],
      skill: primarySkill, // Use single skill for display, even if multiple are selected for context
      score: Math.floor(Math.random() * 100) + (isStudent ? 0 : 20), // Teachers often have higher scores in this mock
      skills: selectedSkills, // Pass all selected skills for context
    });
  }

  // Deduplicate and sort
  const uniqueData = Array.from(new Set(combinedData.map((a) => a.id)))
    .map((id) => combinedData.find((a) => a.id === id))
    .sort((a, b) => b.score - a.score);

  // Apply ranks
  uniqueData.forEach((r, i) => (r.rank = i + 1));

  return uniqueData;
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

const RankHighlight = ({ rank }) => (
  <div className="px-2 py-0.5 rounded-md text-xs font-medium bg-purple-600/10 text-purple-400 border border-purple-600/20">
    #{rank}
  </div>
);

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
        <thead className="sticky top-0 bg-[#0d0d0d]">
          <tr className="text-left text-sm uppercase text-gray-300">
            <th className="px-4 py-3">Rank</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Technology</th>
            <th className="px-4 py-3">Country</th>
            <th className="px-4 py-3">Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {rows.map((row) => (
            <tr
              key={row.id}
              className={`hover:bg-[#111] transition-colors duration-200 ${
                row.id === currentUserId
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
                    <div className="text-xs text-gray-400">ID: {row.id}</div>
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
              <td className="px-4 py-3 align-middle font-semibold text-purple-400">
                {row.score}
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
          key={row.id}
          className={`p-4 rounded-2xl border border-gray-800 shadow-sm hover:bg-gray-900/50 transition-colors duration-200 ${
            row.id === currentUserId
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
            <div className="text-xl font-bold text-purple-400">{row.score}</div>
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
  initialSkills = ["React.js", "Express.js", "Node.js", "Python"],
  currentUserId = "u3",
}) {
  const [availableSkills] = useState(initialSkills);
  const [selectedSkills, setSelectedSkills] = useState(initialSkills); // Show all skills by default
  const [activeRole, setActiveRole] = useState("Student"); // New state for role filter
  const [searchQuery, setSearchQuery] = useState(""); // New search state
  const [loading, setLoading] = useState(false);
  const [rawRows, setRawRows] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 30;

  // Simulate API fetch based on selected skills
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      if (selectedSkills.length === 0) return;

      setLoading(true);
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      try {
        // Use the combined mock data generator
        const data = generateMockData(selectedSkills);
        if (!cancelled) setRawRows(data);
      } catch (err) {
        console.error(err);
        if (!cancelled) setRawRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => (cancelled = true);
  }, [selectedSkills]);

  // Filter and sort the raw data
  const filteredAndAggregatedRows = useMemo(() => {
    if (!rawRows || rawRows.length === 0) return [];

    // 1. Role Filter
    let filteredData = rawRows.filter((row) => row.role === activeRole);

    // 2. Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredData = filteredData.filter(
        (row) =>
          row.name.toLowerCase().includes(query) ||
          row.country.toLowerCase().includes(query) ||
          row.technology.toLowerCase().includes(query) ||
          row.id.toLowerCase().includes(query)
      );
    }

    // 3. Sort by score
    const sortedArr = [...filteredData].sort((a, b) => b.score - a.score);

    // 4. Re-apply ranks after filtering and sorting
    sortedArr.forEach((r, i) => (r.rank = i + 1));

    return sortedArr;
  }, [rawRows, activeRole, searchQuery]);

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
              Leaderboard
            </h1>
          </div>

          {/* Badge and Description */}
          <div className="flex items-center gap-3 mb-6">
            <div className="px-4 py-2 bg-purple-600/25 border border-purple-500/40 rounded-lg backdrop-blur-sm shadow-sm">
              <span className="text-purple-300 text-lg font-semibold">
                🏆 Rankings
              </span>
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-6">
            Compete with peers and track your progress across different skills.
            Rankings are updated in real-time based on performance and
            achievements.
          </p>
        </section>

        <section className="mb-4 sm:mb-6 text-white">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-xl sm:text-2xl font-bold">
              {searchQuery
                ? `Search Results - ${activeRole}s`
                : `Top ${activeRole}s`}
            </h3>
            <div className="text-xs sm:text-sm text-gray-400">
              {searchQuery ? (
                <span>
                  Found {filteredAndAggregatedRows.length}{" "}
                  {activeRole.toLowerCase()}(s)
                </span>
              ) : (
                <span>Showing {filteredAndAggregatedRows.length} users</span>
              )}
            </div>
          </div>

          {/* Search Results Indicator */}
          {searchQuery && (
            <div className="mb-4 px-3 py-2 bg-purple-900/20 border border-purple-600/30 rounded-lg">
              <span className="text-sm text-purple-300">
                Searching for:{" "}
                <span className="font-medium text-purple-200">
                  "{searchQuery}"
                </span>
                <button
                  onClick={() => setSearchQuery("")}
                  className="ml-3 text-purple-400 hover:text-purple-200 text-xs underline"
                >
                  Clear search
                </button>
              </span>
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
            <div className="flex justify-between items-center mt-4 text-gray-300">
              <div className="text-sm text-gray-400">
                Page {page} /{" "}
                {Math.ceil(filteredAndAggregatedRows.length / pageSize)}
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 rounded border border-gray-700 bg-[#121212] hover:bg-purple-900 transition disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Prev
                </button>
                <button
                  className="px-3 py-1 rounded border border-gray-700 bg-[#121212] hover:bg-purple-900 transition disabled:opacity-50"
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
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
