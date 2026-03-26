"use client";

import { useState, useEffect, useCallback } from "react";

export interface TweakConfig {
  default: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
}

export type TweaksSection = Record<string, TweakConfig>;

export const tweaksConfig = {
  tankDrumLayout: {
    modelMarginLeft: { default: -30, min: -60, max: 0, step: 1, unit: "%" },
    modelWidth: { default: 160, min: 80, max: 250, step: 5, unit: "%" },
    modelMarginTop: { default: -0.25, min: -10, max: 10, step: 0.25, unit: "rem" },
    sectionPaddingTop: { default: 5, min: 0, max: 16, step: 0.5, unit: "rem" },
    featureSpacing: { default: 2, min: 0, max: 6, step: 0.25, unit: "rem" },
    mobileModelWidth: { default: 130, min: 80, max: 200, step: 5, unit: "%" },
  },
} as const satisfies Record<string, TweaksSection>;

export type SectionName = keyof typeof tweaksConfig;

const STORAGE_KEY = "jdt-dev-tweaks";

function getDefaults(section: SectionName): Record<string, number> {
  const config = tweaksConfig[section];
  const defaults: Record<string, number> = {};
  for (const [key, val] of Object.entries(config)) {
    defaults[key] = val.default;
  }
  return defaults;
}

function loadFromStorage(): Record<string, Record<string, number>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveToStorage(data: Record<string, Record<string, number>>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

// Event bus for cross-component communication
const listeners = new Set<() => void>();
function notifyListeners() {
  listeners.forEach((fn) => fn());
}

export function useDevTweaks(section: SectionName) {
  const isDev = process.env.NODE_ENV === "development";
  const defaults = getDefaults(section);

  const [values, setValues] = useState<Record<string, number>>(() => {
    if (!isDev) return defaults;
    const stored = loadFromStorage();
    return { ...defaults, ...stored[section] };
  });

  useEffect(() => {
    if (!isDev) return;
    const onChange = () => {
      const stored = loadFromStorage();
      setValues({ ...defaults, ...stored[section] });
    };
    listeners.add(onChange);
    return () => { listeners.delete(onChange); };
  }, [isDev, section, defaults]);

  const setValue = useCallback(
    (key: string, value: number) => {
      if (!isDev) return;
      const stored = loadFromStorage();
      if (!stored[section]) stored[section] = {};
      stored[section][key] = value;
      saveToStorage(stored);
      notifyListeners();
    },
    [isDev, section]
  );

  const reset = useCallback(() => {
    if (!isDev) return;
    const stored = loadFromStorage();
    delete stored[section];
    saveToStorage(stored);
    notifyListeners();
  }, [isDev, section]);

  return { values, setValue, reset, config: tweaksConfig[section] };
}
