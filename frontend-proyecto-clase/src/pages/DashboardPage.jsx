import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

import LoadingScreen from "../components/ui/LoadingScreen.jsx";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const UNAUTHORIZED_MESSAGE = "No puedes continuar porque no tienes el rol adecuado";

const DashboardPage = () => {
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const fetchDashboard = async () => {
      if (!apiBaseUrl) {
        setStatus("error");
        setError("Configura VITE_API_BASE_URL para conectar con el gateway.");
        return;
      }

      try {
        setStatus("loading");
        const token = await getAccessTokenSilently();
        const response = await fetch(`${apiBaseUrl}/api/admin/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 403) {
          if (active) {
            navigate("/", {
              replace: true,
              state: { authMessage: UNAUTHORIZED_MESSAGE },
            });
          }
          return;
        }

        if (!response.ok) {
          throw new Error(`Respuesta inesperada: ${response.status}`);
        }

        const data = await response.json();

        if (active) {
          setPayload(data);
          setStatus("success");
        }
      } catch (fetchError) {
        if (!active) {
          return;
        }
        setError(fetchError.message);
        setStatus("error");
      }
    };

    fetchDashboard();

    return () => {
      active = false;
    };
  }, [getAccessTokenSilently, navigate]);

  if (status === "loading") {
    return <LoadingScreen message="Verificando acceso" />;
  }

  if (status === "error") {
    return (
      <section className="dashboard-page">
        <div className="dashboard-card">
          <h1>Dashboard no disponible</h1>
          <p className="alert alert-error">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-page">
      <div className="dashboard-card">
        <h1>Panel administrativo</h1>
        <p className="dashboard-lead">
          ¡Bienvenido! El gateway validó tu token JWT y confirmó que tienes rol <strong>admin</strong>.
        </p>
        {payload && (
          <pre className="dashboard-payload">{JSON.stringify(payload, null, 2)}</pre>
        )}
      </div>
    </section>
  );
};

export default DashboardPage;
