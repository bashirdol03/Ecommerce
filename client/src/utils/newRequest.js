import axios from "axios";

const newRequest = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export default newRequest;
