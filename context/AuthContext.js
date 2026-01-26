// context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../config/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false); // ✅ guest is session-only now
  const [loading, setLoading] = useState(true);

  // Firebase auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);

      // If user logs in, exit guest automatically
      if (u) setIsGuest(false);

      setLoading(false);
    });

    return unsub;
  }, []);

  const continueAsGuest = async () => {
    setIsGuest(true); // ✅ no AsyncStorage persistence
  };

  const exitGuest = async () => {
    setIsGuest(false);
  };

  const logout = async () => {
    if (isGuest) {
      await exitGuest();
      return;
    }
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuest,
        loading,
        continueAsGuest,
        exitGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}