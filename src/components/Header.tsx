"use client";
import { useAuth } from "../hooks/useAuth";

export default function Header() {
  const { logout } = useAuth();
  return (
    <header className="bg-yellow-200 border-b-4 border-black p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-3xl font-bold">HR Attendance Portal</h1>
        <button
          onClick={logout}
          className="h-10 px-4 border-black border-2 bg-red-200 hover:bg-red-300 active:bg-red-400 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] font-bold"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
