import axios from "axios";

const api = axios.create({
  baseURL: "https://api.bossbot.org/api/",
});

export default api;
