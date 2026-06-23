import { useState, useEffect, useCallback } from "react";

export function useLocalStorage<T>(key: string, initial: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [stored, setStored] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(stored));
    } catch {}
  }, [key, stored]);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStored((prev) => (typeof value === "function" ? (value as (prev: T) => T)(prev) : value));
  }, []);

  return [stored, setValue];
}
