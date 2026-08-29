import { createBrowserRouter } from "react-router";

import { AppLayout } from "../components/layout/AppLayout";
import { GlobalLayout } from "../components/layout/GlobalLayout";
import { AnalysisDetailsPage } from "../pages/AnalysisDetailsPage";
import { AnalysisHistoryPage } from "../pages/AnalysisHistoryPage";
import { AnalyticsPage } from "../pages/AnalyticsPage";
import { DashboardPage } from "../pages/DashboardPage";
import { JobDescriptionsPage } from "../pages/JobDescriptionsPage";
import { LandingPage } from "../pages/LandingPage";
import { LoginPage } from "../pages/LoginPage";
import { MatchDetailsPage } from "../pages/MatchDetailsPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { ProfilePage } from "../pages/ProfilePage";
import { RegisterPage } from "../pages/RegisterPage";
import { ResumeDetailsPage } from "../pages/ResumeDetailsPage";
import { ResumesPage } from "../pages/ResumesPage";
import { UploadResumePage } from "../pages/UploadResumePage";
import { GuestRoute } from "./GuestRoute";
import { ProtectedRoute } from "./ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
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
                path: "upload",
                element: <UploadResumePage />,
              },
              {
                path: "resumes",
                element: <ResumesPage />,
              },
              {
                path: "resumes/:resumeId",
                element: <ResumeDetailsPage />,
              },
              {
                path: "analysis",
                element: <AnalysisHistoryPage />,
              },
              {
                path: "analysis/:analysisId",
                element: <AnalysisDetailsPage />,
              },
              {
                path: "job-descriptions",
                element: <JobDescriptionsPage />,
              },
              {
                path: "matches/:matchId",
                element: <MatchDetailsPage />,
              },
              {
                path: "analytics",
                element: <AnalyticsPage />,
              },
              {
                path: "profile",
                element: <ProfilePage />,
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
