import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

import Button from "../components/ui/Button.jsx";
import { userHasRole } from "../utils/auth0.js";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const HomePage = () => {
  const {
    isAuthenticated,
    loginWithRedirect,
    getAccessTokenSilently,
    isLoading,
    error,
    user,
  } = useAuth0();
  const navigate = useNavigate();
  const [apiState, setApiState] = useState("idle");
  const [apiResponse, setApiResponse] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [authMessage, setAuthMessage] = useState("");

  const isAdmin = userHasRole(user, "admin");

  const handleLogin = () => {
    loginWithRedirect({ appState: { returnTo: "/" } });
  };

  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      setAuthMessage("No puedes continuar porque no tienes el rol adecuado");
    } else {
      setAuthMessage("");
    }
  }, [isAuthenticated, isAdmin]);

  const handleOpenDashboard = () => {
    navigate("/dashboard");
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
          <h1>Autenticación con Auth0 lista para usar</h1>
          <p>
            Este frontend está configurado para redirigirte al Universal Login de Auth0. Ya no
            es necesario un formulario propio de usuario y contraseña; simplemente inicia sesión
            y comienza a consumir el API Gateway.
          </p>
          {authMessage && <p className="alert alert-warning">{authMessage}</p>}
          {!isAuthenticated && (
            <Button onClick={handleLogin} disabled={isLoading}>
              {isLoading ? "Preparando Auth0..." : "Conectar con Auth0"}
            </Button>
          )}
          {isAuthenticated && isAdmin && (
            <Button onClick={handleOpenDashboard}>Ir al dashboard</Button>
          )}
          {error && <p className="form-error">{error.message}</p>}
        </div>
        <div className="hero-support">
          <article>
            <h2>Cómo funciona</h2>
            <ol>
              <li>Haz clic en “Conectar con Auth0”.</li>
              <li>Completa el flujo Universal Login.</li>
              <li>Al volver, podrás consultar tu perfil y llamar al gateway.</li>
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
          <h3>Sesión persistente</h3>
          <p>
            Se habilitó el almacenamiento en LocalStorage con refresh tokens rotativos para
            conservar la sesión incluso si recargas el navegador.
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
