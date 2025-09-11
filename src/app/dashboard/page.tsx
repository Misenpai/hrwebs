// src/app/dashboard/page.tsx
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
    const interval = setInterval(fetchStatuses, 5000); // Poll every 5 seconds

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
        // Update status locally for immediate feedback
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

      // Use fetch to get the file as a blob
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
    return <div className="loading">Loading...</div>;
  }

  const canDownload = Array.from(selectedPIs).every(
    (pi) => piStatuses[pi] === "complete",
  );

  return (
    <>
      <Header />
      <main className="main-content">
        <div className="dashboard-controls">
          <div className="control-group">
            <label htmlFor="month-select">Month</label>
            <select
              id="month-select"
              value={filters.month}
              onChange={(e) =>
                setFilters((f) => ({ ...f, month: +e.target.value }))
              }
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
            >
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>
          <div className="action-buttons">
            <button
              className="request-btn"
              onClick={handleRequestData}
              disabled={selectedPIs.size === 0}
            >
              Request Data
            </button>
            <button
              className="download-btn"
              onClick={handleDownloadReport}
              disabled={!canDownload || selectedPIs.size === 0}
            >
              Download Report
            </button>
          </div>
        </div>

        {statusMessage && <p className="status-message">{statusMessage}</p>}

        <PIList
          pis={pis}
          selectedPIs={selectedPIs}
          setSelectedPIs={setSelectedPIs}
          piStatuses={piStatuses}
        />
      </main>
    </>
  );
}
