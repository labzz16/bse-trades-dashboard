import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getTrades = async (page = 1, limit = 10) => {
  const response = await api.get(`/trades?page=${page}&limit=${limit}`);
  return response.data;
};

export const getTradeStats = async () => {
  const response = await api.get("/trades/stats");
  return response.data;
};

export const startPull = async () => {
  const response = await api.post("/pull/start");
  return response.data;
};

export const getPullStatus = async (jobId) => {
  const response = await api.get(`/pull/status/${jobId}`);
  return response.data;
};

export const getLatestPull = async () => {
  const response = await api.get("/pull/latest");
  return response.data;
};

export default api;