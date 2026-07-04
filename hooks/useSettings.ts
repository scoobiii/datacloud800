import { useState, useEffect } from 'react';

// Storage key for user settings
const SETTINGS_STORAGE_KEY = 'app-user-settings';

interface UserSettings {
  language: string;
}

const defaultSettings: UserSettings = {
  language: 'PT',
};

// Loader function for user settings
const loadSettings = (): UserSettings => {
  try {
    const savedSettingsString = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (savedSettingsString) {
      // Merge saved settings with defaults to ensure all keys are present
      return { ...defaultSettings, ...JSON.parse(savedSettingsString) };
    }
  } catch (error) {
    console.error("Failed to load or parse settings from localStorage", error);
  }
  return defaultSettings;
};

// Saver function for user settings
const saveSettings = (settings: UserSettings) => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save settings to localStorage", error);
  }
};

/**
 * Custom hook to manage and persist user settings like language.
 */
export const useSettings = () => {
  const [settings, setSettings] = useState<UserSettings>(loadSettings);

  // Effect to save settings whenever they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const setLanguage = (language: string) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      language,
    }));
  };

  return {
    language: settings.language,
    setLanguage,
  };
};
