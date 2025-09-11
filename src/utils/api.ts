// src/utils/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

class ApiClient {
  getHeaders() {
    const token = localStorage.getItem("hr_token");
    const headers: any = { "Content-Type": "application/json" };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  async get(endpoint: string) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  }
}

export const api = new ApiClient();
