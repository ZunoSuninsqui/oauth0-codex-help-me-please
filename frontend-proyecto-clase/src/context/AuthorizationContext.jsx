import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const AuthorizationContext = createContext({
  status: "idle",
  roles: [],
  error: null,
});

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const AuthorizationProvider = ({ children }) => {
  const { isAuthenticated, isLoading, getAccessTokenSilently, logout } = useAuth0();
  const [state, setState] = useState({ status: "idle", roles: [], error: null });
  const controllerRef = useRef(null);

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }

    if (!isAuthenticated || isLoading) {
      setState({ status: "idle", roles: [], error: null });
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (!isAuthenticated || isLoading) {
      return;
    }

    if (state.status === "authorized" || state.status === "checking") {
      return;
    }

    const abortController = new AbortController();
    controllerRef.current = abortController;

    const verifyAuthorization = async () => {
      if (!apiBaseUrl) {
        setState({
          status: "error",
          roles: [],
          error: "Configura VITE_API_BASE_URL para conectar con el API Gateway.",
        });
        await logout({ logoutParams: { returnTo: window.location.origin } });
        return;
      }

      try {
        setState({ status: "checking", roles: [], error: null });
        const token = await getAccessTokenSilently();
        const response = await fetch(`${apiBaseUrl}/auth/authorize`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: abortController.signal,
        });

        if (response.status === 403) {
          const payload = await response.json().catch(() => null);
          const message = payload?.message ?? "No tienes permisos para continuar.";
          setState({ status: "denied", roles: [], error: message });
          await logout({
            logoutParams: {
              returnTo: window.location.origin,
            },
          });
          return;
        }

        if (!response.ok) {
          throw new Error(`Error al validar permisos (${response.status}).`);
        }

        const data = await response.json();
        if (!data?.authorized) {
          const message = data?.message ?? "El gateway rechazó la solicitud de acceso.";
          setState({ status: "denied", roles: [], error: message });
          await logout({
            logoutParams: {
              returnTo: window.location.origin,
            },
          });
          return;
        }

        setState({
          status: "authorized",
          roles: Array.isArray(data.roles) ? data.roles : [],
          error: null,
        });
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }
        setState({
          status: "error",
          roles: [],
          error: error.message,
        });
        await logout({
          logoutParams: {
            returnTo: window.location.origin,
          },
        });
      }
    };

    verifyAuthorization();

    return () => {
      abortController.abort();
    };
  }, [getAccessTokenSilently, isAuthenticated, isLoading, logout, state.status]);

  const value = useMemo(
    () => ({
      status: state.status,
      roles: state.roles,
      error: state.error,
    }),
    [state.error, state.roles, state.status]
  );

  return <AuthorizationContext.Provider value={value}>{children}</AuthorizationContext.Provider>;
};

export const useAuthorization = () => useContext(AuthorizationContext);
