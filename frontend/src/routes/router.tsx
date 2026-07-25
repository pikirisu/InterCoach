import { createBrowserRouter } from "react-router";

import { AppLayout } from "../components/layout/AppLayout";
import { GlobalLayout } from "../components/layout/GlobalLayout";
import { AnalysisDetailsPage } from "../pages/AnalysisDetailsPage";
import { AnalysisHistoryPage } from "../pages/AnalysisHistoryPage";
import { DashboardPage } from "../pages/DashboardPage";
import { LoginPage } from "../pages/LoginPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { RegisterPage } from "../pages/RegisterPage";
import { ResumesPage } from "../pages/ResumesPage";
import { GuestRoute } from "./GuestRoute";
import { ProtectedRoute } from "./ProtectedRoute";
import { RootRedirect } from "./RootRedirect";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <RootRedirect />,
      },
      {
        element: <GuestRoute />,
        children: [
          {
            path: "login",
            element: <LoginPage />,
          },
          {
            path: "register",
            element: <RegisterPage />,
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "app",
            element: <GlobalLayout />,
            children: [
              {
                index: true,
                element: <DashboardPage />,
              },
              {
                path: "resumes",
                element: <ResumesPage />,
              },
              {
                path: "analysis",
                element: <AnalysisHistoryPage />,
              },
              {
                path: "analysis/:analysisId",
                element: <AnalysisDetailsPage />,
              },
            ],
          },
        ],
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
