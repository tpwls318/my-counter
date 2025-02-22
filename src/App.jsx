import { useState, useMemo } from "react";
import { ThemeProvider, createTheme } from "@mui/material";
import { CssBaseline, IconButton, Box, Container } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import WorkoutList from "./components/WorkoutList";
import WorkoutDetail from "./components/WorkoutDetail";

function App() {
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: {
            main: "#2196f3",
          },
          error: {
            main: "#f44336",
          },
          background: {
            default: darkMode ? "#121212" : "#f5f5f5",
            paper: darkMode ? "#1e1e1e" : "#ffffff",
          },
        },
        shape: {
          borderRadius: 8,
        },
        typography: {
          fontFamily: [
            "-apple-system",
            "BlinkMacSystemFont",
            '"Segoe UI"',
            "Roboto",
            '"Helvetica Neue"',
            "Arial",
            "sans-serif",
          ].join(","),
          h5: {
            fontWeight: 500,
          },
          h6: {
            fontWeight: 500,
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
                fontWeight: 500,
              },
            },
          },
          MuiIconButton: {
            styleOverrides: {
              root: {
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              },
            },
          },
        },
      }),
    [darkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          transition: "background-color 0.3s ease",
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            pt: { xs: 2, sm: 4 },
            pb: { xs: 4, sm: 6 },
            px: { xs: 2, sm: 3 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mb: { xs: 2, sm: 3 },
            }}
          >
            <IconButton
              onClick={() => setDarkMode(!darkMode)}
              color="inherit"
              sx={{
                bgcolor: "background.paper",
                boxShadow: 1,
                "&:hover": {
                  bgcolor: "background.paper",
                  opacity: 0.9,
                },
              }}
            >
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>

          {selectedWorkoutId ? (
            <WorkoutDetail
              workoutId={selectedWorkoutId}
              onBack={() => setSelectedWorkoutId(null)}
            />
          ) : (
            <WorkoutList onSelectWorkout={setSelectedWorkoutId} />
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
