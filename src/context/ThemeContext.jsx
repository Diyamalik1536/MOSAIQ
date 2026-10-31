import { useEffect, useMemo, useState } from "react";
import { ThemeContext, STORAGE_KEY, getPreferredTheme } from "./themeState";

export default function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => getPreferredTheme());

    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute("data-theme", theme);
        root.style.colorScheme = theme;
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    const value = useMemo(() => ({
        theme,
        setTheme,
        toggleTheme: () => setTheme((current) => current === "dark" ? "light" : "dark"),
    }), [theme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
