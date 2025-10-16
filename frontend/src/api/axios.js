import axios from "axios";
import config from "../../config";

const baseURL =
  window.location.hostname === "localhost"
    ? config.LOCAL_API
    : config.MOBILE_API;

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

export default api;
