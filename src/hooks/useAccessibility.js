"use client";

import { useState, useEffect, createContext, useContext } from "react";

const AccessibilityContext = createContext();

const ACCESSIBILITY_STORAGE_KEY = "DRUMRE_projekt";

const defaultSettings = {
  theme: "dark",
};

export function AccessibilityProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [mounted, setMounted] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        // Ensure we have a valid theme value
        if (
          parsedSettings.theme &&
          ["light", "dark", "system"].includes(parsedSettings.theme)
        ) {
          setSettings(parsedSettings);
        }
      } else {
        // No stored settings, detect system preference and set theme
        const systemPrefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        setSettings({ theme: systemPrefersDark ? "dark" : "light" });
      }
    } catch (error) {
      console.warn("Failed to load accessibility settings:", error);
    }
    setMounted(true);
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(
          ACCESSIBILITY_STORAGE_KEY,
          JSON.stringify(settings)
        );
      } catch (error) {
        console.warn("Failed to save accessibility settings:", error);
      }
    }
  }, [settings, mounted]);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const value = {
    settings,
    updateSetting,
    resetSettings,
    mounted,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      "useAccessibility must be used within an AccessibilityProvider"
    );
  }
  return context;
}
