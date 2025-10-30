import { Navigate, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

import LoadingScreen from "./ui/LoadingScreen.jsx";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen message="Validando sesión" />;
  }

  if (!isAuthenticated) {
    loginWithRedirect({ appState: { returnTo: location.pathname } });
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
