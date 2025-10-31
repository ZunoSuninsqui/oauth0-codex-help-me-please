const AUTH_MESSAGE_KEY = "auth.message";
const AUTH_RETURN_KEY = "auth.returnTo";

const getStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }
  return window.sessionStorage ?? null;
};

export const rememberAuthMessage = (message) => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  if (message) {
    storage.setItem(AUTH_MESSAGE_KEY, message);
  } else {
    storage.removeItem(AUTH_MESSAGE_KEY);
  }
};

export const loadAuthMessage = () => {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  return storage.getItem(AUTH_MESSAGE_KEY);
};

export const rememberReturnTo = (path) => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  if (path) {
    storage.setItem(AUTH_RETURN_KEY, path);
  } else {
    storage.removeItem(AUTH_RETURN_KEY);
  }
};

export const loadReturnTo = () => {
  const storage = getStorage();
  if (!storage) {
    return "/";
  }

  return storage.getItem(AUTH_RETURN_KEY) ?? "/";
};

export const clearAuthState = () => {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  storage.removeItem(AUTH_MESSAGE_KEY);
  storage.removeItem(AUTH_RETURN_KEY);
};

export const AUTH_STORAGE_KEYS = {
  MESSAGE: AUTH_MESSAGE_KEY,
  RETURN_TO: AUTH_RETURN_KEY,
};
