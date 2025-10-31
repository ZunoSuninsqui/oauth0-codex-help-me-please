import { Auth0Provider } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

const Auth0ProviderWithNavigate = ({ children }) => {
  const navigate = useNavigate();

  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_AUTH0_REDIRECT_URI;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  if (!domain || !clientId || !redirectUri) {
    throw new Error(
      "Faltan variables de entorno para inicializar Auth0. Revisa tu archivo .env"
    );
  }

  const onRedirectCallback = (appState) => {
    const target = appState?.returnTo ?? "/";
    navigate("/callback", {
      replace: true,
      state: { returnTo: target },
    });
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience,
        prompt: "login",
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithNavigate;
