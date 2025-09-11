// src/components/PIList.tsx
import React from "react";
import type { PIStatus } from "../app/dashboard/page";

interface PIListProps {
  pis: string[];
  selectedPIs: Set<string>;
  setSelectedPIs: React.Dispatch<React.SetStateAction<Set<string>>>;
  piStatuses: PIStatus;
}

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
          <div key={pi} style={styles.piItem}>
            <input
              type="checkbox"
              style={styles.piItemCheckbox}
              checked={selectedPIs.has(pi)}
              onChange={() => handleSelectPI(pi)}
            />
            <div style={styles.piName}>{pi}</div>
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
