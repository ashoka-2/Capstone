import { createBrowserRouter, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "./DashboardLayout.jsx";
import DashboardPage from "../Features/Dashboard/Pages/DashboardPage.jsx";
import ConnectorsPage from "../Features/Dashboard/Pages/ConnectorsPage.jsx";
import TemplatesPage from "../Features/Dashboard/Pages/TemplatesPage.jsx";
import WorkspacePage from "../Features/Workspace/Pages/WorkspacePage.jsx";
import NotFoundPage from "../Shared/NotFoundPage.jsx";

function RootLayout() {
  const location = useLocation();
  // Animate between dashboard ecosystem and workspace
  const transitionKey = location.pathname.startsWith("/workspace")
    ? location.pathname
    : "dashboard-root";

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#121316]">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={transitionKey}
          initial={{ opacity: 0, scale: 0.99, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 1.01, filter: "blur(4px)" }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full flex"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
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
    ],
  },
]);

export default routes;
