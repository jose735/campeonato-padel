import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { Loader2 } from "lucide-react";

import MainLayout from "@/layouts/MainLayout";
import { RequireAuth } from "@/routes/ProtectedRoute";
import { useAuthStore } from "@/store/auth-store";
import { startRealtimeSync, stopRealtimeSync } from "@/lib/realtimeSync";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const HomePage = lazy(() => import("@/pages/HomePage"));
const PlayersPage = lazy(() => import("@/pages/PlayersPage"));
const JourneysPage = lazy(() => import("@/pages/JourneysPage"));
const TournamentsPage = lazy(() => import("@/pages/TournamentsPage"));
const JourneyDetailPage = lazy(() => import("@/pages/JourneyDetailPage"));
const RankingPage = lazy(() => import("@/pages/RankingPage"));

function PageFallback() {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-neutral-500">
      <Loader2 size={18} className="animate-spin" />
      Cargando...
    </div>
  );
}

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageFallback />}>{children}</Suspense>;
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <LazyPage>
        <LoginPage />
      </LazyPage>
    ),
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: (
              <LazyPage>
                <HomePage />
              </LazyPage>
            ),
          },
          {
            path: "jornadas",
            element: (
              <LazyPage>
                <JourneysPage />
              </LazyPage>
            ),
          },
          {
            path: "jornadas/:id",
            element: (
              <LazyPage>
                <JourneyDetailPage />
              </LazyPage>
            ),
          },
          {
            path: "ranking",
            element: (
              <LazyPage>
                <RankingPage />
              </LazyPage>
            ),
          },
          {
            path: "jugadores",
            element: (
              <LazyPage>
                <PlayersPage />
              </LazyPage>
            ),
          },
          {
            path: "torneos",
            element: (
              <LazyPage>
                <TournamentsPage />
              </LazyPage>
            ),
          },
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
