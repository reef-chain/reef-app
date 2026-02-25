import axios from "axios";

const DEFAULT_BASE_URL = "https://points.reef.host/";

const API_BASE_URL = (
  (window as any).__POINTS_API_BASE_URL__ ||
  localStorage.getItem("points-api-base-url") ||
  process.env.POINTS_API_BASE_URL ||
  DEFAULT_BASE_URL
)
  .trim()
  .replace(/\/+$/, "");

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("points_access_token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
