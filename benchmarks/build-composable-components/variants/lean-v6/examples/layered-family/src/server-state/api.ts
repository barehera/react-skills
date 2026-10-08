import axios from "axios"

export const api = axios.create({
  baseURL: "/api",
  timeout: 10_000,
  headers: {
    Accept: "application/json",
  },
})
