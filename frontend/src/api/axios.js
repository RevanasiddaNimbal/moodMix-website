import axios from "axios";
import config from "../../config";

const api = axios.create({
  baseURL: config.API_URL,
  withCredentials: true,
});

//Refresh token Logic.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    let originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await api.get(`/auth/refresh-token`);
        return api(originalRequest);
      } catch (err) {
        console.log("Refresh token expired. please login again.");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
