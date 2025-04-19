import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as z from 'zod'

export const settingsSchema = z.object({
  baseUrl: z.string().default("https://spliit.app/"),
})

export type Settings = z.infer<typeof settingsSchema>

export const DefaultSettings = settingsSchema.parse({
  baseUrl: "https://spliit.app/"
})

export async function getSettings(): Promise<Settings> {
    try {
      const raw = await AsyncStorage.getItem('spliit-settings')
      return settingsSchema.parse(raw ? JSON.parse(raw) : {})
    } catch {
      return DefaultSettings
    }
}
  
export async function saveSettings(settings: Settings) {
    try {
      await AsyncStorage.setItem('spliit-settings', JSON.stringify(settings))
    } catch (err) {
      console.error(err)
    }
}

const SettingsContext = createContext<{
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
}>({
  settings: DefaultSettings,
  updateSettings: async () => {},
});

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(DefaultSettings);

  useEffect(() => {
    const loadSettings = async () => {
      setSettings(await getSettings());
    };

    loadSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings); // Update state
      await saveSettings(updatedSettings);
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);