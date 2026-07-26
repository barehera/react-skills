import axios from "axios";

import { serverStateDefaults } from "./constants";
import { normalizeApiError } from "./utils";

export const api = axios.create({
  baseURL: "/api",
  timeout: serverStateDefaults.requestTimeoutMs,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(normalizeApiError(error)),
);
