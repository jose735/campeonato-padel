import { createBrowserRouter, RouterProvider } from "react-router-dom";

import MainLayout  from "@/layouts/MainLayout";

import HomePage from "../pages/HomePage";
import PlayersPage from "@/pages/PlayersPage";
import JourneysPage from '@/pages/JourneysPage';
import TournamentsPage from '@/pages/TournamentsPage';
import JourneyDetailPage from '@/pages/JourneyDetailPage';
import RankingPage from '@/pages/RankingPage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,

    children: [
      {
        index: true,
        element: <HomePage />,
      },
      { path: 'jugadores', element: <PlayersPage /> },
      { path: 'jornadas', element: <JourneysPage /> },
      { path: 'torneos', element: <TournamentsPage /> },
      { path: 'jornadas/:id', element: <JourneyDetailPage /> },
      { path: 'ranking', element: <RankingPage /> },
    ],
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
