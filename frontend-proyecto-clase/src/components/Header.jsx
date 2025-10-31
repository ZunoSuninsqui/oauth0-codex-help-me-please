import { Link, NavLink } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

import Button from "./ui/Button.jsx";
import { useAuthorization } from "../context/AuthorizationContext.jsx";
import { loadReturnTo, rememberReturnTo } from "../utils/authStorage.js";

const Header = () => {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();
  const { status: authorizationStatus, roles } = useAuthorization();
  const canAccessDashboard =
    authorizationStatus === "authorized" && Array.isArray(roles) && roles.includes("admin");

  const handleLogin = () => {
    const returnTo = loadReturnTo();
    rememberReturnTo(returnTo);
    loginWithRedirect({
      appState: { returnTo },
      authorizationParams: { prompt: "login" },
    });
  };

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <header className="app-header">
      <div className="container">
        <Link to="/" className="brand">
          <span className="brand-accent">UCO</span> Challenge
        </Link>
        <nav className="nav">
          <NavLink to="/" end>
            Inicio
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/profile">
              Perfil
            </NavLink>
          )}
          {isAuthenticated && canAccessDashboard && (
            <NavLink to="/dashboard">
              Dashboard
            </NavLink>
          )}
        </nav>
        <div className="header-actions">
          {isAuthenticated && user ? (
            <>
              <div className="user-chip">
                <span className="user-avatar" aria-hidden="true">
                  {user.name?.charAt(0)?.toUpperCase() ?? "U"}
                </span>
                <span className="user-name">{user.name}</span>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <Button onClick={handleLogin}>Iniciar sesión</Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
