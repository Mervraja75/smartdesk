// context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../config/firebase";

const AuthContext = createContext(null);

const GUEST_KEY = "SMARTDESK_GUEST_MODE";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load guest mode from storage (persists after app restarts)
  useEffect(() => {
    (async () => {
      try {
        const guest = await AsyncStorage.getItem(GUEST_KEY);
        setIsGuest(guest === "true");
      } catch (e) {
        console.log("Failed to load guest mode", e);
      }
    })();
  }, []);

  // Firebase auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u || null);

      // If user logs in, exit guest mode automatically
      if (u) {
        setIsGuest(false);
        try {
          await AsyncStorage.setItem(GUEST_KEY, "false");
        } catch {}
      }

      setLoading(false);
    });

    return unsub;
  }, []);

  const continueAsGuest = async () => {
    setIsGuest(true);
    try {
      await AsyncStorage.setItem(GUEST_KEY, "true");
    } catch (e) {
      console.log("Failed to save guest mode", e);
    }
  };

  const exitGuest = async () => {
    setIsGuest(false);
    try {
      await AsyncStorage.setItem(GUEST_KEY, "false");
    } catch {}
  };

  const logout = async () => {
    // if guest, just exit guest
    if (isGuest) {
      await exitGuest();
      return;
    }
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, isGuest, loading, continueAsGuest, exitGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}