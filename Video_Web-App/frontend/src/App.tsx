// src/App.tsx
import React from "react";
import { useTheme, ThemeProvider } from "./contexts/ThemeContext";
import VideoList from "./pages/VideoList";
import Admin from "./pages/Admin";
import styled, { createGlobalStyle } from "styled-components";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

// Define the GlobalStyle with the theme
const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${(props) => props.theme.background};
    color: ${(props) => props.theme.color};
    transition: background-color 0.3s ease, color 0.3s ease;
  }
`;

// Styled-component for the toggle button
const ToggleButton = styled.button`
  position: fixed;
  top: 10px;
  right: 10px;
  background-color: ${(props) => props.theme.color};
  color: ${(props) => props.theme.background};
  border: none;
  padding: 10px;
  cursor: pointer;
  border-radius: 5px;
  font-size: 1em;
`;

// Main App component
const App: React.FC = () => {
  const { toggleTheme } = useTheme();

  const Nav = styled.nav`
    display: flex;
    gap: 1em;
    padding: 1em;
  `;

  const NavLink = styled(Link)`
    text-decoration: none;
    color: inherit;
    font-size: 1em;
  `;

  return (
    <Router>
      <GlobalStyle /> {/* Apply global styles */}
      <ToggleButton onClick={toggleTheme}>Light/Dark</ToggleButton>
      <Nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/admin">Admin</NavLink>
      </Nav>
      <Routes>
        <Route path="/" element={<VideoList />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
};

// Wrapper component to provide ThemeContext to the App component
const WrappedApp: React.FC = () => (
  <ThemeProvider>
    <App />
  </ThemeProvider>
);

export default WrappedApp;
