import React, { useEffect, useMemo, useState } from "react";
import NavBar from "../components/home page/navbar";
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
  <div className="px-3 py-1 rounded-full text-xs font-semibold bg-opacity-20 bg-purple-700 text-purple-300">
    #{rank}
  </div>
);

// New component for Dropdown Selector
const SkillDropdown = ({ skills, selected, onChange }) => {
  // Always select all if no skill is selected initially for simplicity
  const handleChange = (e) => {
    const value = e.target.value;
    if (value === "all") {
      onChange(skills);
    } else {
      onChange([value]);
    }
  };

  const currentValue =
    selected.length === skills.length
      ? "all"
      : selected.length === 1
      ? selected[0]
      : "default";

  return (
    <>
      <NavBar />

      <select
        value={currentValue}
        onChange={handleChange}
        className="px-4 py-2 rounded-lg border border-gray-700 bg-[#121212] text-white text-sm font-medium focus:ring-purple-500 focus:border-purple-500 transition-colors"
      >
        <option value="default" disabled hidden>
          Select Skill...
        </option>
        {skills.map((skill) => (
          <option key={skill} value={skill}>
            {skill}
          </option>
        ))}
        <option value="all">All Skills (Combined)</option>
      </select>
    </>
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
        <thead className="sticky top-0 bg-[#0d0d0d]">
          <tr className="text-left text-sm uppercase text-gray-300">
            <th className="px-4 py-3">Rank</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {rows.map((row) => (
            <tr
              key={row.id}
              className={`hover:bg-[#111] transition ${
                row.id === currentUserId
                  ? "bg-gradient-to-r from-purple-900/40 to-transparent"
                  : ""
              }`}
            >
              <td className="px-4 py-3 align-middle">
                <RankHighlight rank={row.rank} />
              </td>
              <td className="px-4 py-3 align-middle">
                <div className="font-medium text-white">{row.name}</div>
                <div className="text-xs text-gray-400">ID: {row.id}</div>
              </td>
              <td className="px-4 py-3 align-middle text-gray-300">
                {row.role}
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
          className={`p-4 rounded-2xl border border-gray-800 shadow-sm ${
            row.id === currentUserId
              ? "bg-purple-950/40 border-purple-600"
              : "bg-[#070707]"
          }`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <RankHighlight rank={row.rank} />
              <div>
                <div className="font-semibold text-white">{row.name}</div>
                <div className="text-xs text-gray-400">{row.role}</div>
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
  const [selectedSkills, setSelectedSkills] = useState([initialSkills[0]]);
  const [activeRole, setActiveRole] = useState("Student"); // New state for role filter
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
    const filteredByRole = rawRows.filter((row) => row.role === activeRole);

    // 2. Sort by score
    const sortedArr = [...filteredByRole].sort((a, b) => b.score - a.score);

    // 3. Re-apply ranks after filtering and sorting
    sortedArr.forEach((r, i) => (r.rank = i + 1));

    return sortedArr;
  }, [rawRows, activeRole]);

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
    <div className="p-6 lg:p-12 min-h-screen bg-[#000]">
      <header className="mb-6 text-white">
        <h1 className="text-3xl font-extrabold text-purple-400">
          Leaderboards
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {selectedSkills.length === 1 && selectedSkills[0] !== "all"
            ? `Rankings for ${selectedSkills[0]}`
            : `Rankings for ${selectedSkills.length} skills (Combined)`}
        </p>
      </header>

      <section className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Skill Dropdown */}
        <div className="w-full md:w-auto">
          <SkillDropdown
            skills={availableSkills}
            selected={selectedSkills}
            onChange={(s) => {
              setSelectedSkills(s);
              setPage(1);
            }}
          />
        </div>
      </section>

      <section className="mb-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold">Top {activeRole}s</h3>
          <div className="text-sm text-gray-400">
            Showing {filteredAndAggregatedRows.length} users
          </div>
        </div>

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
              message={`No ${activeRole.toLowerCase()}s found for the selected skill(s).`}
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
  );
}
