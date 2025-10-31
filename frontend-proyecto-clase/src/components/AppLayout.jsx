import Header from "./Header.jsx";

const AppLayout = ({ children }) => {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <div className="container">{children}</div>
      </main>
      <footer className="app-footer">
        <div className="container">
          <p>
            Proyecto de integración Auth0 + API Gateway. Usa tu cuenta de Auth0 para acceder a
            los recursos protegidos.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
