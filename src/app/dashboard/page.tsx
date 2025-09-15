"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../utils/api";
import Header from "../../components/Header";
import PIList from "../../components/PIList";

export interface PIStatus {
  [key: string]: "complete" | "pending" | "none" | "requested";
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [pis, setPis] = useState<string[]>([]);
  const [selectedPIs, setSelectedPIs] = useState<Set<string>>(new Set());
  const [piStatuses, setPiStatuses] = useState<PIStatus>({});
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchPIs = async () => {
      try {
        const response = await api.get("/hr/pis");
        if (response.success) {
          setPis(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch PIs", error);
      }
    };
    if (user) fetchPIs();
  }, [user]);

  useEffect(() => {
    if (!user || pis.length === 0) return;

    const fetchStatuses = async () => {
      try {
        const response = await api.get(
          `/hr/submission-status?month=${filters.month}&year=${filters.year}`,
        );
        if (response.success) {
          setPiStatuses(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch statuses", error);
      }
    };

    fetchStatuses();
    const interval = setInterval(fetchStatuses, 5000);

    return () => clearInterval(interval);
  }, [user, pis, filters.month, filters.year]);

  const handleRequestData = async () => {
    if (selectedPIs.size === 0) return;
    setStatusMessage("Sending requests...");
    try {
      const response = await api.post("/hr/request-data", {
        piUsernames: Array.from(selectedPIs),
        month: filters.month,
        year: filters.year,
      });
      if (response.success) {
        setStatusMessage("Requests sent successfully!");
        const newStatuses = { ...piStatuses };
        selectedPIs.forEach((pi) => {
          newStatuses[pi] = "requested";
        });
        setPiStatuses(newStatuses);
      }
    } catch (error) {
      setStatusMessage("Failed to send requests.");
    } finally {
      setTimeout(() => setStatusMessage(""), 3000);
    }
  };

  const handleDownloadReport = async () => {
    if (selectedPIs.size === 0) return;
    setStatusMessage("Preparing download...");
    try {
      const piParams = Array.from(selectedPIs).join(",");
      const url = `${process.env.NEXT_PUBLIC_API_BASE}/hr/download-report?month=${filters.month}&year=${filters.year}&piUsernames=${piParams}`;

      const response = await fetch(url, { headers: api.getHeaders() });

      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      const firstPiName = Array.from(selectedPIs)[0];
      const fileName =
        selectedPIs.size > 1
          ? `Combined_Report_${filters.month}_${filters.year}.csv`
          : `${firstPiName}_Report_${filters.month}_${filters.year}.csv`;

      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      setStatusMessage("Download started!");
    } catch (error) {
      console.error("Download error", error);
      setStatusMessage("Failed to download report.");
    } finally {
      setTimeout(() => setStatusMessage(""), 3000);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lime-200">
        <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
          <p className="text-2xl font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  const canDownload = Array.from(selectedPIs).every(
    (pi) => piStatuses[pi] === "complete",
  );

  return (
    <div className="min-h-screen bg-lime-200">
      <Header />
      <main className="container mx-auto p-6">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label
                htmlFor="month-select"
                className="block text-sm font-bold mb-2"
              >
                Month
              </label>
              <select
                id="month-select"
                value={filters.month}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, month: +e.target.value }))
                }
                className="border-2 border-black p-2 bg-white hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString("en-US", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="year-select"
                className="block text-sm font-bold mb-2"
              >
                Year
              </label>
              <select
                id="year-select"
                value={filters.year}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, year: +e.target.value }))
                }
                className="border-2 border-black p-2 bg-white hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              >
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleRequestData}
                disabled={selectedPIs.size === 0}
                className="h-12 px-5 border-black border-2 bg-orange-200 hover:bg-orange-300 active:bg-orange-400 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] disabled:border-gray-400 disabled:bg-gray-200 disabled:text-gray-500 disabled:hover:shadow-none font-bold"
              >
                Request Data
              </button>
              <button
                onClick={handleDownloadReport}
                disabled={!canDownload || selectedPIs.size === 0}
                className="h-12 px-5 border-black border-2 bg-lime-200 hover:bg-lime-300 active:bg-lime-400 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] disabled:border-gray-400 disabled:bg-gray-200 disabled:text-gray-500 disabled:hover:shadow-none font-bold"
              >
                Download Report
              </button>
            </div>
          </div>
        </div>

        {statusMessage && (
          <div className="bg-cyan-200 border-2 border-black p-4 mb-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <p className="font-bold text-center">{statusMessage}</p>
          </div>
        )}

        <PIList
          pis={pis}
          selectedPIs={selectedPIs}
          setSelectedPIs={setSelectedPIs}
          piStatuses={piStatuses}
        />
      </main>
    </div>
  );
}
