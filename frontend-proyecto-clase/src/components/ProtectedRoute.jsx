import { Navigate, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

import LoadingScreen from "./ui/LoadingScreen.jsx";
import { useAuthorization } from "../context/AuthorizationContext.jsx";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth0();
  const { status: authorizationStatus, error: authorizationError } = useAuthorization();
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

  if (authorizationStatus === "idle" || authorizationStatus === "checking") {
    return <LoadingScreen message="Confirmando permisos con el gateway" />;
  }

  if (authorizationStatus === "denied" || authorizationStatus === "error") {
    return (
      <Navigate
        to="/"
        replace
        state={{
          authMessage: authorizationError ?? "No fue posible validar tus permisos.",
          returnTo: location.pathname,
        }}
      />
    );
  }

  return children;
};

export default ProtectedRoute;
