export const CUSTOM_ROLES_CLAIM = "https://uco-challenge/roles";

export const getUserRoles = (user) => {
  if (!user) {
    return [];
  }

  const rawRoles = user[CUSTOM_ROLES_CLAIM];

  if (Array.isArray(rawRoles)) {
    return rawRoles;
  }

  if (typeof rawRoles === "string" && rawRoles.length > 0) {
    return [rawRoles];
  }

  return [];
};

export const userHasRole = (user, role) => getUserRoles(user).includes(role);
