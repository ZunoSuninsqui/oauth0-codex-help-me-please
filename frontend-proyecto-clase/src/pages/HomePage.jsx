import { useEffect, useRef, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation, useNavigate } from "react-router-dom";

import Button from "../components/ui/Button.jsx";
import {
  clearAuthState,
  loadAuthMessage,
  loadReturnTo,
  rememberAuthMessage,
  rememberReturnTo,
} from "../utils/authStorage.js";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently, isLoading, error } =
    useAuth0();
  const [apiState, setApiState] = useState("idle");
  const [apiResponse, setApiResponse] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [authMessage, setAuthMessage] = useState(null);
  const [postLoginPath, setPostLoginPath] = useState("/");
  const autoLoginTriggeredRef = useRef(false);

  useEffect(() => {
    if (location.state?.authMessage) {
      const { authMessage: message, returnTo } = location.state;
      setAuthMessage(message);
      rememberAuthMessage(message);

      if (returnTo) {
        setPostLoginPath(returnTo);
        rememberReturnTo(returnTo);
      } else {
        rememberReturnTo(null);
      }

      navigate(location.pathname, { replace: true });
      return;
    }

    if (!isAuthenticated) {
      const storedMessage = loadAuthMessage();
      const storedReturnTo = loadReturnTo();

      if (storedMessage) {
        setAuthMessage(storedMessage);
      }

      if (storedReturnTo) {
        setPostLoginPath(storedReturnTo);
      }
    }
  }, [isAuthenticated, location, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      setAuthMessage(null);
      setPostLoginPath("/");
      clearAuthState();
      autoLoginTriggeredRef.current = false;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (authMessage || isAuthenticated || isLoading) {
      return;
    }

    if (autoLoginTriggeredRef.current) {
      return;
    }

    autoLoginTriggeredRef.current = true;
    loginWithRedirect({
      appState: { returnTo: postLoginPath },
      authorizationParams: { prompt: "login" },
    });
  }, [authMessage, isAuthenticated, isLoading, loginWithRedirect, postLoginPath]);

  const handleLogin = () => {
    rememberReturnTo(postLoginPath);
    loginWithRedirect({
      appState: { returnTo: postLoginPath },
      authorizationParams: { prompt: "login" },
    });
  };

  const handleTestApi = async () => {
    if (!apiBaseUrl) {
      setApiState("error");
      setApiError("Configura VITE_API_BASE_URL en tu .env para probar el gateway.");
      return;
    }

    try {
      setApiState("loading");
      setApiError(null);
      setApiResponse(null);
      const token = await getAccessTokenSilently();
      const response = await fetch(`${apiBaseUrl}/debug/whoami`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Respuesta inesperada: ${response.status}`);
      }

      const data = await response.json();
      setApiResponse(data);
      setApiState("success");
    } catch (apiCallError) {
      setApiState("error");
      setApiError(apiCallError.message);
    }
  };

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-card">
          <h1>Autenticación y autorización con Auth0</h1>
          <p>
            Cada visita inicia en el Universal Login de Auth0. Tras autenticarte, el frontend
            envía tu JWT al API Gateway para que valide tus roles antes de mostrar cualquier
            información protegida.
          </p>
          {authMessage && (
            <p className="home-auth-message" role="status">
              {authMessage}
            </p>
          )}
          {!isAuthenticated && (
            <Button onClick={handleLogin} disabled={isLoading}>
              {isLoading ? "Preparando Auth0..." : "Conectar con Auth0"}
            </Button>
          )}
          {error && <p className="form-error">{error.message}</p>}
        </div>
        <div className="hero-support">
          <article>
            <h2>Cómo funciona</h2>
            <ol>
              <li>Haz clic en “Conectar con Auth0”.</li>
              <li>Completa el flujo Universal Login.</li>
              <li>Espera a que el gateway confirme tu rol y continúa.</li>
            </ol>
          </article>
        </div>
      </section>

      <section className="feature-grid">
        <article className="card">
          <h3>Inicio de sesión centralizado</h3>
          <p>
            Usa Auth0 para manejar la autenticación y evitar almacenar contraseñas en el
            frontend.
          </p>
        </article>
        <article className="card">
          <h3>Autorización estricta</h3>
          <p>
            Ningún contenido protegido se muestra hasta que el gateway valide tus permisos con el
            JWT recibido directamente desde Auth0.
          </p>
        </article>
        <article className="card">
          <h3>Prueba tu gateway</h3>
          <p>
            Configura la variable <code>VITE_API_BASE_URL</code> y prueba el endpoint seguro desde
            aquí mismo.
          </p>
          <Button
            variant="outline"
            onClick={handleTestApi}
            disabled={!isAuthenticated || apiState === "loading"}
          >
            {!isAuthenticated
              ? "Inicia sesión para probar"
              : apiState === "loading"
              ? "Consultando..."
              : "Llamar al gateway"}
          </Button>
          {apiState === "success" && apiResponse && (
            <pre className="api-response">{JSON.stringify(apiResponse, null, 2)}</pre>
          )}
          {apiState === "error" && apiError && <p className="form-error">{apiError}</p>}
        </article>
      </section>
    </div>
  );
};

export default HomePage;
