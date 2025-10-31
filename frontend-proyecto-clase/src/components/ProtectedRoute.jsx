import { Navigate, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

import LoadingScreen from "./ui/LoadingScreen.jsx";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth0();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen message="Validando sesión" />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
        state={{ authMessage: "Debes iniciar sesión para continuar", returnTo: location.pathname }}
      />
    );
  }

  return children;
};

export default ProtectedRoute;
