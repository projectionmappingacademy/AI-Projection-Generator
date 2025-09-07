
import { useState, useEffect } from 'react';

function getValue<T>(key: string, initialValue: T | (() => T)): T {
    const savedValue = localStorage.getItem(key);
    if (savedValue !== null) {
        try {
            return JSON.parse(savedValue);
        } catch {
            // If parsing fails, return initial value
            return initialValue instanceof Function ? initialValue() : initialValue;
        }
    }
    // If no value in storage, use initial value
    return initialValue instanceof Function ? initialValue() : initialValue;
}

export function useLocalStorage<T>(key: string, initialValue: T | (() => T)) {
    const [value, setValue] = useState<T>(() => getValue(key, initialValue));

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error("Error saving to localStorage", error);
        }
    }, [key, value]);

    return [value, setValue] as const;
}
