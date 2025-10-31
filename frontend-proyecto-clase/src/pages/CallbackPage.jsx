import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import LoadingScreen from "../components/ui/LoadingScreen.jsx";
import { useAuthorization } from "../context/AuthorizationContext.jsx";
import { loadReturnTo, rememberReturnTo } from "../utils/authStorage.js";

const CallbackPage = () => {
  const { status, error } = useAuthorization();
  const location = useLocation();
  const navigate = useNavigate();

  const targetPath = useMemo(() => {
    if (location.state?.returnTo) {
      return location.state.returnTo;
    }
    return loadReturnTo();
  }, [location.state]);

  useEffect(() => {
    if (location.state?.returnTo) {
      rememberReturnTo(location.state.returnTo);
    }
  }, [location.state]);

  useEffect(() => {
    if (status === "authorized") {
      rememberReturnTo(null);
      navigate(targetPath, { replace: true });
    }
  }, [navigate, status, targetPath]);

  if (status === "denied" || status === "error") {
    return (
      <LoadingScreen
        message={
          error ?? "El gateway rechazó la autenticación. Regresa al inicio e inténtalo nuevamente."
        }
      />
    );
  }

  return <LoadingScreen message="Confirmando permisos" />;
};

export default CallbackPage;
