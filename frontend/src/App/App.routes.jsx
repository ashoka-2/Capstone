import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "./DashboardLayout.jsx";
import DashboardPage from "../Features/Dashboard/Pages/DashboardPage.jsx";
import ConnectorsPage from "../Features/Dashboard/Pages/ConnectorsPage.jsx";
import TemplatesPage from "../Features/Dashboard/Pages/TemplatesPage.jsx";
import WorkspacePage from "../Features/Workspace/Pages/WorkspacePage.jsx";
import NotFoundPage from "../Shared/NotFoundPage.jsx";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "connectors",
        element: <ConnectorsPage />,
      },
      {
        path: "templates",
        element: <TemplatesPage />,
      },
      {
        path: "search",
        element: <DashboardPage />,
      },
    ],
  },
  {
    path: "/workspace/:id",
    element: <WorkspacePage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default routes;
