import axios from "axios";

const api = axios.create({
  // baseURL: "http://127.0.0.1:8000/api/",
  baseURL: "https://bossbot.org:8443/api/",
});

export default api;
