// src/components/PIList.tsx
import React from "react";
import Link from "next/link"; // Import Link
import type { PIStatus } from "../app/dashboard/page";

// --- RE-ADDED FULL PROPS INTERFACE ---
interface PIListProps {
  pis: string[];
  selectedPIs: Set<string>;
  setSelectedPIs: React.Dispatch<React.SetStateAction<Set<string>>>;
  piStatuses: PIStatus;
}
// --- END RE-ADDED PROPS ---

const statusMap = {
  complete: { icon: "✅", text: "Data Submitted", color: "#28a745" },
  pending: { icon: "⚠️", text: "Submission Pending", color: "#ffc107" },
  requested: { icon: "➡️", text: "Request Sent", color: "#17a2b8" },
  none: { icon: "⚫", text: "No Request Sent", color: "#6c757d" },
};

const styles: { [key: string]: React.CSSProperties } = {
  piListContainer: {
    background: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    overflow: "hidden",
  },
  piListHeader: {
    display: "flex",
    alignItems: "center",
    padding: "1rem 1.5rem",
    background: "#f8f9fa",
    borderBottom: "1px solid #dee2e6",
  },
  // --- STYLE FOR CHECKBOX (RE-ADDED) ---
  headerCheckbox: {
    marginRight: "1rem",
    transform: "scale(1.2)",
  },
  headerTitle: {
    flex: 1,
    fontWeight: 600,
  },
  headerStatus: {
    width: "200px",
    fontWeight: 600,
    textAlign: "left",
  },
  piItem: {
    display: "flex",
    alignItems: "center",
    padding: "1rem 1.5rem",
    borderBottom: "1px solid #dee2e6",
  },
  // --- STYLE FOR CHECKBOX (RE-ADDED) ---
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
  // --- STYLE FOR CLICKABLE LINK ---
  linkStyle: {
    textDecoration: "none",
    color: "#007bff",
    fontWeight: 500,
  },
};

export default function PIList({
  pis,
  selectedPIs,
  setSelectedPIs,
  piStatuses,
}: PIListProps) {
  // --- RE-ADDED SELECTION HANDLERS ---
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
  // --- END RE-ADDED SELECTION HANDLERS ---

  return (
    <div style={styles.piListContainer}>
      <div style={styles.piListHeader}>
        {/* RE-ADDED SELECT ALL CHECKBOX */}
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
          <div key={pi} style={styles.piItem}>
            {/* RE-ADDED INDIVIDUAL CHECKBOX */}
            <input
              type="checkbox"
              style={styles.piItemCheckbox}
              checked={selectedPIs.has(pi)}
              onChange={() => handleSelectPI(pi)}
            />
            {/* PI NAME IS NOW A LINK TO THE DETAIL PAGE */}
            <div style={styles.piName}>
              <Link href={`/dashboard/pi/${pi}`} passHref>
                <a style={styles.linkStyle}>{pi}</a>
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
