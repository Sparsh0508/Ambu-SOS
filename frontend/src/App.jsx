import { useEffect } from "react";
import { Navigate, useRoutes } from "react-router-dom";
import { appRoutes } from "./app/routes";
import { useAuthStore } from "./store/useAuthStore";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const element = useRoutes([
    ...appRoutes,
    { path: "*", element: <Navigate to="/" replace /> },
  ]);

  return <ErrorBoundary>{element}</ErrorBoundary>;
}
