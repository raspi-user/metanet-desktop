import React, { useContext, useEffect, useState } from "react"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { SettingsContext } from "../context/SettingsContext"
import { CssBaseline } from "@mui/material"

const UserTheme = ({ children }) => {
  const { settings } = useContext(SettingsContext)
  const [backgroundImage, setBackgroundImage] = useState(
    "https://images.pexels.com/photos/18857526/pexels-photo-18857526/free-photo-of-larch-heaven.jpeg"
  )
  const [selectedPalette, setSelectedPalette] = useState(settings.theme)

  // Define custom colors for light and dark modes
  const lightPalette = {
    primary: {
      main: "#424242",
    },
    secondary: {
      main: "#FC433F",
    },
    background: {
      default: "#FFFFFF",
      mainSection: "#FFFFFF",
      paper: "#F6F6F6",
      leftMenu: "#EEEEEE",
      leftMenuHover: "#E0E0E0",
      leftMenuSelected: "#E0E0E0",
      scrollbarThumb: "#DCDCDC",
      app: "#FFFFFF1E",
      appHover: "#FFFFFF66",
      withImage: {
        backgroundImage: `linear-gradient(to bottom, #FFFFFF, #FFFFFFce), url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      },
    },
    badgeIcon: "darkBlue",
    text: { color: "black" },
    mode: "light",
  }

  const darkPalette = {
    primary: {
      main: "#FFFFFF",
      // Notice: The 'secondary' key inside 'primary' seems to be a mistake, so it was removed to avoid confusion.
    },
    secondary: {
      main: "#FC433F",
    },
    background: {
      default: "#1D2125",
      mainSection: "transparent", // Prioritized setting from customDarkPalette
      paper: "#1D2125",
      leftMenu: "#161616",
      leftMenuHover: "#2E2E2E",
      leftMenuSelected: "#2E2E2E",
      scrollbarThumb: "#4E4E4E7A",
      scrollbarTrack: "1616160F",
      app: "#161616AF",
      appHover: "black",
      mainSection: "transparent",
      withImage: {
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background: `linear-gradient(to bottom, #1D2125, #1D212564), url(${backgroundImage})`,
          backgroundBlendMode: "luminosity",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "transparent",
          filter: "blur(8px)",
          zIndex: -1,
        },
      },
    },
    badgeIcon: "white",
    text: { color: "white" },
    mode: "dark",
  }

  // Choose the palette based on the theme mode from settings
  useEffect(() => {
    const handleSystemThemeChange = (e) => {
      const newPalette = e.matches ? darkPalette : lightPalette
      setSelectedPalette(newPalette)
    }

    const matchMedia = window.matchMedia("(prefers-color-scheme: dark)")
    if (settings.theme === "system") {
      setSelectedPalette(matchMedia.matches ? darkPalette : lightPalette)
      matchMedia.addEventListener("change", handleSystemThemeChange)
    } else {
      const themePalette =
        settings.theme === "dark" ? darkPalette : lightPalette
      setSelectedPalette(themePalette)
    }

    return () => {
      matchMedia.removeEventListener("change", handleSystemThemeChange)
    }
  }, [settings.theme])

  return (
    <ThemeProvider
      theme={(theme) => {
        return createTheme({
          ...theme,
          palette: selectedPalette,
        })
      }}
    >
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}

export default UserTheme
