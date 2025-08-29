import axios from "axios";

const api = axios.create({
  baseURL: "https://hcmniabot.org/api/",
});

export default api;
