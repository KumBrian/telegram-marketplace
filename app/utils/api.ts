import axios from "axios";

const api = axios.create({
  baseURL: "/", // Proxied by Nuxt
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Return a consistent error format
    const message =
      error.response?.data?.message || error.message || "Unknown error";
    // We can throw or return a rejected promise
    return Promise.reject(new Error(message));
  }
);

export default api;
