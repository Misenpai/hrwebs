// src/components/Header.tsx
"use client";
import { useAuth } from "../hooks/useAuth";

export default function Header() {
  const { logout } = useAuth();
  return (
    <header className="dashboard-header">
      <h1>HR Attendance Portal</h1>
      <button onClick={logout} className="logout-btn">
        Logout
      </button>
    </header>
  );
}
