"use client";

import { useState, useEffect } from "react";
import { IconButton, Tooltip } from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";


export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Only access localStorage after component mounts to prevent hydration mismatch
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem("theme");
      setIsDark(savedTheme === "dark");
    }
  }, []);

  const handleToggle = () => {
    const newTheme = isDark ? "light" : "dark";
    setIsDark(!isDark);
    if (typeof window !== 'undefined') {
      localStorage.setItem("theme", newTheme);
    }
    // You can implement theme switching logic here
    // For now, we'll just toggle the state
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) return null;

  return (
    <Tooltip title={`Switch to ${isDark ? "light" : "dark"} mode`}>
      <IconButton
        onClick={handleToggle}
        sx={{
          position: "fixed",
          top: { xs: 8, md: 16 },
          right: { xs: 8, md: 16 },
          zIndex: 1000,
          width: { xs: 40, md: 48 },
          height: { xs: 40, md: 48 },
          bgcolor: 'background.paper',
          boxShadow: 2,
          '&:hover': {
            bgcolor: 'action.hover',
          }
        }}
      >
        {isDark ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
    </Tooltip>
  );
} 