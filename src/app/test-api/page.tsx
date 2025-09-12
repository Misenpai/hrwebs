"use client";
import { useState } from "react";

export default function TestAPI() {
  const [result, setResult] = useState<string>("");

  const testConnection = async () => {
    try {
      // First test if the server is reachable
      const healthCheck = await fetch(`http://192.168.29.178:3000/health`);
      if (healthCheck.ok) {
        const data = await healthCheck.json();
        setResult(`✅ Server is reachable: ${JSON.stringify(data)}`);
      } else {
        setResult(`❌ Server responded with: ${healthCheck.status}`);
      }
    } catch (error) {
      setResult(`❌ Cannot reach server: ${error}`);
    }
  };

  const testLogin = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE || "http://192.168.29.178:3000/api"}/hr/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: "HRUser", password: "123456" }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        setResult(`✅ Login endpoint works: ${JSON.stringify(data)}`);
      } else {
        setResult(`❌ Login failed with status: ${response.status}`);
      }
    } catch (error) {
      setResult(`❌ Login request failed: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">API Connection Test</h1>
        <div className="space-y-4">
          <div>
            <p className="font-semibold">API Base URL:</p>
            <p className="text-sm text-gray-600">
              {process.env.NEXT_PUBLIC_API_BASE || "Not set - using default"}
            </p>
          </div>
          <div className="space-x-4">
            <button
              onClick={testConnection}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test Server Connection
            </button>
            <button
              onClick={testLogin}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Test Login Endpoint
            </button>
          </div>
          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <pre className="whitespace-pre-wrap">{result}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
