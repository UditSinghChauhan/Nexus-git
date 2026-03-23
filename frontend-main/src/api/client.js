import axios from "axios";
import { API_BASE } from "../config";

const apiClient = axios.create({
  baseURL: API_BASE,
});

export default apiClient;
