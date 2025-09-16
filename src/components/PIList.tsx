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
  complete: {
    icon: "✅",
    text: "Data Submitted",
    className: "status-complete",
  },
  pending: {
    icon: "⚠️",
    text: "Submission Pending",
    className: "status-pending",
  },
  requested: {
    icon: "➡️",
    text: "Request Sent",
    className: "status-requested",
  },
  none: { icon: "⚫", text: "No Request Sent", className: "status-none" },
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
    <div className="pi-list-container">
      <div className="pi-list-header">
        <input
          type="checkbox"
          className="pi-list-header-checkbox"
          onChange={handleSelectAll}
          checked={pis.length > 0 && selectedPIs.size === pis.length}
        />
        <div className="pi-list-header-title">Principal Investigator</div>
        <div className="pi-list-header-status">Submission Status</div>
      </div>
      {pis.map((pi) => {
        const status = piStatuses[pi] || "none";
        const { icon, text, className } = statusMap[status];

        return (
          <div key={pi} className="pi-item">
            <input
              type="checkbox"
              className="pi-item-checkbox"
              checked={selectedPIs.has(pi)}
              onChange={() => handleSelectPI(pi)}
            />
            <div className="pi-name">
              <Link href={`/dashboard/pi/${pi}`} className="pi-link">
                {pi}
              </Link>
            </div>
            <div className={`pi-status ${className}`}>
              <span>{icon}</span>
              <span>{text}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
