const LoadingScreen = ({ message = "Cargando" }) => {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <span className="loader" aria-hidden="true" />
      <p>{message}...</p>
    </div>
  );
};

export default LoadingScreen;
