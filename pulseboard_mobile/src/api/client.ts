import axios from "axios";

const api = axios.create({
  baseURL: "http://172.31.10.200:3000", // NOT localhost for mobile
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;