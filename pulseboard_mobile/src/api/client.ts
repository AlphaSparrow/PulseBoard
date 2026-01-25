import axios from "axios";

const ipAddress = '172.31.26.213';

const api = axios.create({
  baseURL: "http://${ipAddress}:3000", // NOT localhost for mobile
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;