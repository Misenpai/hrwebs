const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000/api";

class ApiClient {
  getHeaders() {
    const token = localStorage.getItem("hr_token");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  async get(endpoint: string) {
    try {
      const url = `${API_BASE}${endpoint}`;
      console.log(`GET request to: ${url}`);

      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API GET Error: ${response.status} - ${errorText}`);
        return { success: false, error: `HTTP ${response.status}` };
      }

      return await response.json();
    } catch (error) {
      console.error("API GET request failed:", error);
      return { success: false, error: error.message };
    }
  }

  async post(endpoint: string, data: any) {
    try {
      const url = `${API_BASE}${endpoint}`;
      console.log(`POST request to: ${url}`, data);

      const response = await fetch(url, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API POST Error: ${response.status} - ${errorText}`);
        return { success: false, error: `HTTP ${response.status}` };
      }

      return await response.json();
    } catch (error) {
      console.error("API POST request failed:", error);
      return { success: false, error: error.message };
    }
  }
}

export const api = new ApiClient();
