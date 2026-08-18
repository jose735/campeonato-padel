import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";

import MainLayout from "@/layouts/MainLayout";
import LoginPage from "@/pages/LoginPage";
import HomePage from "../pages/HomePage";
import PlayersPage from "@/pages/PlayersPage";
import JourneysPage from "@/pages/JourneysPage";
import TournamentsPage from "@/pages/TournamentsPage";
import JourneyDetailPage from "@/pages/JourneyDetailPage";
import RankingPage from "@/pages/RankingPage";
import { RequireAuth } from "@/routes/ProtectedRoute";
import { useAuthStore } from "@/store/auth-store";
import { startRealtimeSync, stopRealtimeSync } from "@/lib/realtimeSync";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "jornadas", element: <JourneysPage /> },
          { path: "jornadas/:id", element: <JourneyDetailPage /> },
          { path: "ranking", element: <RankingPage /> },
          { path: "jugadores", element: <PlayersPage /> },
          { path: "torneos", element: <TournamentsPage /> },
          { path: "*", element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
]);

export const AppRouter = () => {
  const hydrate = useAuthStore((s) => s.hydrate);
  const role = useAuthStore((s) => s.role);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!role) {
      stopRealtimeSync();
      return;
    }
    startRealtimeSync();
    return () => stopRealtimeSync();
  }, [role]);

  return <RouterProvider router={router} />;
};