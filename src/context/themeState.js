import { createContext } from "react";

export const ThemeContext = createContext(null);
export const STORAGE_KEY = "talentforge_theme";

export function getPreferredTheme() {
    if (typeof window === "undefined") return "light";

    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
