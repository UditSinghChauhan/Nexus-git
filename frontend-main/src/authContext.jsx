import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

function readStoredAuth() {
  const token = localStorage.getItem("token");
  const rawUser = localStorage.getItem("authUser");
  const userId = localStorage.getItem("userId");

  let user = null;

  if (rawUser) {
    try {
      user = JSON.parse(rawUser);
    } catch {
      user = null;
    }
  } else if (userId) {
    user = { id: userId };
  }

  return { token, user };
}

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => readStoredAuth());

  useEffect(() => {
    setAuthState(readStoredAuth());
  }, []);

  const setAuth = ({ token, user }) => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }

    if (user) {
      localStorage.setItem("authUser", JSON.stringify(user));
      localStorage.setItem("userId", user.id);
    } else {
      localStorage.removeItem("authUser");
      localStorage.removeItem("userId");
    }

    setAuthState({ token: token || null, user: user || null });
  };

  const logout = () => {
    setAuth({ token: null, user: null });
  };

  const setCurrentUser = (user) => {
    const normalizedUser =
      typeof user === "string" ? { id: user } : user || null;

    if (normalizedUser?.id) {
      localStorage.setItem("userId", normalizedUser.id);
    } else {
      localStorage.removeItem("userId");
      localStorage.removeItem("authUser");
    }

    if (normalizedUser && normalizedUser.username) {
      localStorage.setItem("authUser", JSON.stringify(normalizedUser));
    }

    setAuthState((prev) => ({
      token: prev.token,
      user: normalizedUser,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        token: authState.token,
        currentUser: authState.user,
        isAuthenticated: Boolean(authState.token && authState.user?.id),
        setAuth,
        setCurrentUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
