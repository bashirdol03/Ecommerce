import axios from "axios";

const newRequest = axios.create({
  baseURL: "https://api.mybackendserver.pro/api",
  withCredentials: true,
});

export default newRequest;
