import { RouterProvider } from "react-router-dom";
import { routes } from "./App.routes.jsx";
import { ToastContainer } from "../Components/Toast.jsx";
import "./App.css";

export default function App() {
  return (
    <>
      <ToastContainer />
      <RouterProvider router={routes} />
    </>
  );
}
