// src/components/PIList.tsx
import React from "react";
import Link from "next/link";
import type { PIStatus } from "../app/dashboard/page";

interface PIListProps {
  pis: string[];
  selectedPIs: Set<string>;
  setSelectedPIs: React.Dispatch<React.SetStateAction<Set<string>>>;
  piStatuses: PIStatus;
}

const statusMap = {
  complete: { icon: "✅", text: "Data Submitted", color: "#166534" }, // green-800
  pending: { icon: "⚠️", text: "Submission Pending", color: "#92400e" }, // amber-700
  requested: { icon: "➡️", text: "Request Sent", color: "#1e40af" }, // blue-800
  none: { icon: "⚫", text: "No Request Sent", color: "#64748b" }, // slate-500
};

const styles: { [key: string]: React.CSSProperties } = {
  piListContainer: {
    background: "white",
    border: "2px solid #cbd5e1", // slate-300
    borderRadius: "8px",
    boxShadow: "2px 2px 0px rgba(51, 65, 85, 0.1)",
    overflow: "hidden",
  },
  piListHeader: {
    display: "flex",
    alignItems: "center",
    padding: "1rem 1.5rem",
    background: "#f1f5f9", // slate-100
    borderBottom: "2px solid #cbd5e1", // slate-300
  },
  headerCheckbox: {
    marginRight: "1rem",
    transform: "scale(1.2)",
  },
  headerTitle: {
    flex: 1,
    fontWeight: 600,
    color: "#334155", // slate-700
  },
  headerStatus: {
    width: "200px",
    fontWeight: 600,
    textAlign: "left",
    color: "#334155", // slate-700
  },
  piItem: {
    display: "flex",
    alignItems: "center",
    padding: "1rem 1.5rem",
    borderBottom: "1px solid #e2e8f0", // slate-200
  },
  piItemHover: {
    backgroundColor: "#f8fafc", // slate-50
  },
  piItemCheckbox: {
    marginRight: "1rem",
    transform: "scale(1.2)",
  },
  piName: {
    flex: 1,
    fontSize: "1.1rem",
  },
  piStatus: {
    width: "200px",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  linkStyle: {
    textDecoration: "none",
    color: "#3b82f6", // blue-500
    fontWeight: 500,
    cursor: "pointer",
  },
  linkHover: {
    color: "#1d4ed8", // blue-700
  },
};

export default function PIList({
  pis,
  selectedPIs,
  setSelectedPIs,
  piStatuses,
}: PIListProps) {
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedPIs(new Set(pis));
    } else {
      setSelectedPIs(new Set());
    }
  };

  const handleSelectPI = (pi: string) => {
    const newSelection = new Set(selectedPIs);
    if (newSelection.has(pi)) {
      newSelection.delete(pi);
    } else {
      newSelection.add(pi);
    }
    setSelectedPIs(newSelection);
  };

  return (
    <div style={styles.piListContainer}>
      <div style={styles.piListHeader}>
        <input
          type="checkbox"
          style={styles.headerCheckbox}
          onChange={handleSelectAll}
          checked={pis.length > 0 && selectedPIs.size === pis.length}
        />
        <div style={styles.headerTitle}>Principal Investigator</div>
        <div style={styles.headerStatus}>Submission Status</div>
      </div>
      {pis.map((pi) => {
        const status = piStatuses[pi] || "none";
        const { icon, text, color } = statusMap[status];

        return (
          <div
            key={pi}
            style={styles.piItem}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f8fafc"; // slate-50
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "white";
            }}
          >
            <input
              type="checkbox"
              style={styles.piItemCheckbox}
              checked={selectedPIs.has(pi)}
              onChange={() => handleSelectPI(pi)}
            />
            <div style={styles.piName}>
              <Link
                href={`/dashboard/pi/${pi}`}
                style={styles.linkStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#1d4ed8"; // blue-700
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#3b82f6"; // blue-500
                }}
              >
                {pi}
              </Link>
            </div>
            <div style={{ ...styles.piStatus, color }}>
              <span>{icon}</span>
              <span>{text}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
