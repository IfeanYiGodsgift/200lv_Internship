// src/contexts/ThemeContext.tsx
import React, { createContext, useState, ReactNode, useContext } from "react";
import {
  DefaultTheme,
  ThemeProvider as StyledThemeProvider,
} from "styled-components";

// Define the types for the themes
const lightTheme: DefaultTheme = {
  background: "#fff",
  color: "#000",
};

const darkTheme: DefaultTheme = {
  background: "#333",
  color: "#fff",
};

// Define the context type
interface ThemeContextProps {
  theme: DefaultTheme;
  toggleTheme: () => void;
}

// Create the context
const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

// Create the ThemeProvider component
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<DefaultTheme>(lightTheme);

  const toggleTheme = () => {
    setTheme((prevTheme) =>
      prevTheme === lightTheme ? darkTheme : lightTheme
    );
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
