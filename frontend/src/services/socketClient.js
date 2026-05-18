import { io } from "socket.io-client";
import { resolveApiBaseUrl } from "./apiClient";

export const socket = io(resolveApiBaseUrl(), {
  autoConnect: false,
  withCredentials: true,
});
