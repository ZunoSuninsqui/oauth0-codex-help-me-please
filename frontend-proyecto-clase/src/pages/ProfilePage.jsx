import { useAuth0 } from "@auth0/auth0-react";

import LoadingScreen from "../components/ui/LoadingScreen.jsx";

const ProfilePage = () => {
  const { user, isLoading } = useAuth0();

  if (isLoading) {
    return <LoadingScreen message="Cargando perfil" />;
  }

  if (!user) {
    return null;
  }

  return (
    <section className="profile-page">
      <div className="profile-card">
        {user.picture && (
          <img src={user.picture} alt="Avatar" className="profile-avatar" referrerPolicy="no-referrer" />
        )}
        <h1>{user.name}</h1>
        <p className="profile-email">{user.email}</p>
        <dl className="profile-details">
          {Object.entries(user).map(([key, value]) => (
            <div key={key} className="profile-row">
              <dt>{key}</dt>
              <dd>{typeof value === "object" ? JSON.stringify(value) : String(value)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
};

export default ProfilePage;
