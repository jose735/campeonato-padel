import { createBrowserRouter, RouterProvider } from "react-router-dom";

import MainLayout  from "@/layouts/MainLayout";

import HomePage from "../pages/HomePage";
import PlayersPage from "@/pages/PlayersPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,

    children: [
      {
        index: true,
        element: <HomePage />,
      },
      { path: "jugadores", element: <PlayersPage /> },
    ],
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
