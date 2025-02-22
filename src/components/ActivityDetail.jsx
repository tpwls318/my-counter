import { useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  IconButton,
  Grid,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { REP_INCREMENTS } from "./WorkoutDetail";

function ActivityDetail({ activity, onBack, onUpdateReps, onReset }) {
  const handleButtonClick = (increment, e) => {
    e.stopPropagation();
    onUpdateReps(increment);
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: "background.paper",
        zIndex: 1200,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onBack();
          }}
          size="large"
          sx={{ color: "text.secondary" }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 500,
            color: "text.primary",
          }}
        >
          {activity.name}
        </Typography>
      </Stack>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Typography
          variant="h1"
          align="center"
          sx={{
            fontSize: { xs: "120px", sm: "160px" },
            fontWeight: "700",
            color: "primary.main",
            mb: 6,
            textShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 0 20px rgba(255,255,255,0.2)"
                : "0 0 20px rgba(0,0,0,0.1)",
          }}
        >
          {activity.reps}
        </Typography>

        <Grid
          container
          spacing={2}
          sx={{
            width: "100%",
            maxWidth: "400px",
            mx: "auto",
            pl: 0,
            mb: 4,
          }}
        >
          {[
            [-1, 1],
            [-5, 5],
            [-10, 10],
          ].map(([left, right]) => (
            <Grid item xs={12} key={left} sx={{ pl: "0 !important" }}>
              <Stack direction="row" spacing={2}>
                <Button
                  fullWidth
                  size="large"
                  variant="outlined"
                  onClick={(e) => handleButtonClick(left, e)}
                  sx={{
                    py: 2.5,
                    fontSize: "1.5rem",
                    fontWeight: 500,
                    borderWidth: 2,
                    "&:hover": {
                      borderWidth: 2,
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  {left}
                </Button>
                <Button
                  fullWidth
                  size="large"
                  variant="outlined"
                  onClick={(e) => handleButtonClick(right, e)}
                  sx={{
                    py: 2.5,
                    fontSize: "1.5rem",
                    fontWeight: 500,
                    borderWidth: 2,
                    "&:hover": {
                      borderWidth: 2,
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  +{right}
                </Button>
              </Stack>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ maxWidth: "400px", width: "100%", mx: "auto" }}>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            startIcon={<RestartAltIcon />}
            size="large"
            sx={{
              py: 2,
              borderWidth: 2,
              "&:hover": {
                borderWidth: 2,
                bgcolor: "error.main",
                color: "white",
              },
            }}
          >
            Reset
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default ActivityDetail;
