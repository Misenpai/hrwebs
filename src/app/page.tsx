"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const [username, setUsername] = useState("HRUser");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const success = await login(username, password);
    if (success) {
      router.push("/dashboard");
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-200 p-4">
      <div className="w-full max-w-md bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-8">
        <h1 className="text-4xl font-bold mb-8 text-center">HR Login</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-lg font-medium mb-2"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border-black border-2 p-3 focus:outline-none focus:shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:bg-pink-100"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-lg font-medium mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-black border-2 p-3 focus:outline-none focus:shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:bg-pink-100"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full h-12 border-black border-2 bg-cyan-200 hover:bg-cyan-300 active:bg-cyan-400 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] font-bold text-lg"
          >
            Login
          </button>
          {error && (
            <div className="bg-red-200 border-2 border-black p-3 text-center">
              <p className="text-black font-medium">{error}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
