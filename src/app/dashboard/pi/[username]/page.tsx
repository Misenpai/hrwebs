"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../hooks/useAuth";
import Header from "../../../../components/Header";
import Link from "next/link";

interface AttendanceRecord {
  date: string;
  checkinTime: string | null;
  checkoutTime: string | null;
  attendanceType: string;
  isFullDay: boolean;
  isHalfDay: boolean;
  isCheckedOut: boolean;
}

interface UserAttendance {
  username: string;
  workingDays: number;
  presentDays: number;
  absentDays: number;
  attendances: AttendanceRecord[];
}

interface PIDetailData {
  piUsername: string;
  month: number;
  year: number;
  totalWorkingDays: number;
  users: UserAttendance[];
}

export default function PIDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const piUsername = params.username as string;

  const [data, setData] = useState<PIDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !piUsername) return;

      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/hr/pi/${piUsername}/attendance?month=${filters.month}&year=${filters.year}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("hr_token")}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || "Failed to load data");
        }
      } catch (err) {
        console.error("Error fetching PI data:", err);
        setError("Failed to load attendance data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, piUsername, filters.month, filters.year]);

  const handleDownload = async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_BASE}/hr/pi/${piUsername}/download?month=${filters.month}&year=${filters.year}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("hr_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `PI_${piUsername}_Report_${filters.month}_${filters.year}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download report");
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return "N/A";
    const time = new Date(timeStr);
    return time.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading || !user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <>
      <Header />
      <main className="main-content p-6">
        {/* Back button and title */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mt-4">
            Attendance Details: {piUsername}
          </h1>
        </div>

        {/* Controls */}
        <div className="dashboard-controls mb-6">
          <div className="control-group">
            <label htmlFor="month-select">Month</label>
            <select
              id="month-select"
              value={filters.month}
              onChange={(e) =>
                setFilters((f) => ({ ...f, month: +e.target.value }))
              }
              className="border-2 border-black p-2"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("en-US", { month: "long" })}
                </option>
              ))}
            </select>
          </div>
          <div className="control-group">
            <label htmlFor="year-select">Year</label>
            <select
              id="year-select"
              value={filters.year}
              onChange={(e) =>
                setFilters((f) => ({ ...f, year: +e.target.value }))
              }
              className="border-2 border-black p-2"
            >
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>
          <button
            onClick={handleDownload}
            className="download-btn bg-green-500 text-white px-4 py-2 border-2 border-black hover:bg-green-600"
          >
            Download Report
          </button>
        </div>

        {/* Loading/Error states */}
        {loading && (
          <div className="text-center py-8">Loading attendance data...</div>
        )}
        {error && (
          <div className="bg-red-100 border-2 border-red-500 p-4 mb-4">
            {error}
          </div>
        )}

        {/* Main content */}
        {data && !loading && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-blue-100 border-2 border-black p-4">
              <p className="text-lg">
                <strong>
                  Total Working Days in{" "}
                  {new Date(0, filters.month - 1).toLocaleString("en-US", {
                    month: "long",
                  })}{" "}
                  {filters.year}:
                </strong>{" "}
                {data.totalWorkingDays}
              </p>
              <p className="text-sm text-gray-600">
                (Excluding weekends and holidays)
              </p>
            </div>

            {/* Users table */}
            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <div className="bg-yellow-200 border-b-2 border-black p-4">
                <h2 className="text-xl font-bold">Project Staff Attendance</h2>
              </div>

              <div className="p-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="text-left p-3">Username</th>
                      <th className="text-center p-3">Working Days</th>
                      <th className="text-center p-3">Present Days</th>
                      <th className="text-center p-3">Absent Days</th>
                      <th className="text-center p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.users.map((user) => (
                      <tr
                        key={user.username}
                        className="border-b border-gray-300 hover:bg-gray-50"
                      >
                        <td className="p-3 font-medium">{user.username}</td>
                        <td className="text-center p-3">{user.workingDays}</td>
                        <td className="text-center p-3">
                          <span className="bg-green-200 px-2 py-1 rounded">
                            {user.presentDays}
                          </span>
                        </td>
                        <td className="text-center p-3">
                          <span className="bg-red-200 px-2 py-1 rounded">
                            {user.absentDays}
                          </span>
                        </td>
                        <td className="text-center p-3">
                          <button
                            onClick={() =>
                              setSelectedUser(
                                selectedUser === user.username
                                  ? null
                                  : user.username,
                              )
                            }
                            className="bg-blue-500 text-white px-3 py-1 border-2 border-black hover:bg-blue-600"
                          >
                            {selectedUser === user.username ? "Hide" : "View"}{" "}
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Selected user attendance details */}
            {selectedUser && (
              <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <div className="bg-cyan-200 border-b-2 border-black p-4">
                  <h3 className="text-lg font-bold">
                    Daily Attendance: {selectedUser}
                  </h3>
                </div>

                <div className="p-4">
                  <div className="overflow-x-auto">
                    <div
                      className="flex gap-3 pb-4"
                      style={{ minWidth: "fit-content" }}
                    >
                      {data.users
                        .find((u) => u.username === selectedUser)
                        ?.attendances.filter(
                          (att) => att.checkinTime || att.checkoutTime,
                        )
                        .map((att, idx) => (
                          <div
                            key={idx}
                            className="flex-shrink-0 border-2 border-black p-3 bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                            style={{ minWidth: "200px" }}
                          >
                            <div className="font-bold text-sm mb-2 border-b border-gray-300 pb-1">
                              {formatDate(att.date)}
                            </div>
                            <div className="space-y-1 text-sm">
                              <div>
                                <span className="font-medium">Check-in:</span>{" "}
                                <span className="text-green-600">
                                  {formatTime(att.checkinTime)}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">Check-out:</span>{" "}
                                <span className="text-red-600">
                                  {formatTime(att.checkoutTime)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Show message if no attendance records */}
                  {data.users
                    .find((u) => u.username === selectedUser)
                    ?.attendances.filter(
                      (att) => att.checkinTime || att.checkoutTime,
                    ).length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      No attendance records found for this month
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
