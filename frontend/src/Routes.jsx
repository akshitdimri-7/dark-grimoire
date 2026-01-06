import { useNavigate, useRoutes } from "react-router-dom";

// Pages list

import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/user/Profile";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";

import { useAuth } from "./authContext";
import { useEffect } from "react";
import CreateRepository from "./components/repo/CreateRepository.jsx";

const ProjectRoutes = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const userIdfromStorage = localStorage.getItem("userId");

    if (userIdfromStorage && !currentUser) {
      setCurrentUser(userIdfromStorage);
    }

    if (
      !userIdfromStorage &&
      !["/auth", "/signup"].includes(window.location.pathname)
    ) {
      navigate("/auth");
    }

    if (userIdfromStorage && window.location.pathname == "/auth") {
      navigate("/");
    }
  }, [currentUser, navigate, setCurrentUser]);

  let element = useRoutes([
    {
      path: "/",
      element: <Dashboard />,
    },
    {
      path: "/auth",
      element: <Login />,
    },
    {
      path: "/signup",
      element: <Signup />,
    },
    {
      path: "/profile",
      element: <Profile />,
    },
    {
      path: "/create",
      element: <CreateRepository />,
    },
  ]);

  return element;
};

export default ProjectRoutes;
