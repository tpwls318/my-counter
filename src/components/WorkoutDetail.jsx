import React, { useState, useEffect, memo } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  IconButton,
  TextField,
  List,
  ButtonGroup,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { db } from "../db/db";
import ActivityDetail from "./ActivityDetail";

export const REP_INCREMENTS = [-10, -5, -1, 1, 5, 10];

const Activity = memo(({ activity, onDelete, onUpdateReps, onClick }) => {
  const theme = useTheme();

  return (
    <div
      onClick={onClick}
      style={{
        marginBottom: "12px",
        padding: "16px",
        backgroundColor: theme.palette.background.paper,
        border: `2px solid ${theme.palette.divider}`,
        borderRadius: "8px",
        transition: "border-color 0.2s ease",
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 500,
              color: "text.primary",
            }}
          >
            {activity.name}
          </Typography>
          <IconButton
            className="clickable-controls"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(activity.id);
            }}
            color="error"
            size="small"
            sx={{
              border: "2px solid",
              borderColor: "error.main",
              "&:hover": {
                bgcolor: "error.main",
                color: "white",
              },
            }}
          >
            <DeleteOutlineIcon />
          </IconButton>
        </Stack>

        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="center"
          className="clickable-controls"
        >
          <ButtonGroup
            size="medium"
            variant="outlined"
            sx={{
              "& .MuiButton-root": {
                borderWidth: 2,
                "&:hover": {
                  borderWidth: 2,
                  bgcolor: "action.hover",
                },
              },
            }}
          >
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onUpdateReps(activity, -1);
              }}
            >
              <RemoveIcon />
            </Button>
            <Button
              sx={{
                minWidth: "80px",
                fontWeight: "bold",
                fontSize: "1.2rem",
                color: "primary.main",
              }}
            >
              {activity.reps}
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onUpdateReps(activity, 1);
              }}
            >
              <AddIcon />
            </Button>
          </ButtonGroup>
        </Stack>
      </Stack>
    </div>
  );
});

function WorkoutDetail({ workoutId, onBack }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workout, setWorkout] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [activities, setActivities] = useState({});
  const [newActivityName, setNewActivityName] = useState("");
  const [selectedActivity, setSelectedActivity] = useState(null);

  useEffect(() => {
    loadWorkoutData();
  }, [workoutId]);

  const loadWorkoutData = async () => {
    try {
      setLoading(true);
      setError(null);

      const workoutData = await db.workouts.get(workoutId);
      if (!workoutData) {
        throw new Error("Workout not found");
      }
      setWorkout(workoutData);

      const roundsData = await db.rounds
        .where("workoutId")
        .equals(workoutId)
        .toArray();

      // If no rounds exist, create initial round
      if (roundsData.length === 0) {
        const roundId = await db.rounds.add({
          workoutId,
          roundNumber: 1,
        });
        roundsData.push(await db.rounds.get(roundId));
      }

      setRounds(roundsData);

      const activitiesData = {};
      for (const round of roundsData) {
        const roundActivities = await db.activities
          .where("roundId")
          .equals(round.id)
          .toArray();
        activitiesData[round.id] = roundActivities;
      }
      setActivities(activitiesData);
    } catch (error) {
      console.error("Error loading workout data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addRound = async () => {
    try {
      const roundNumber = rounds.length + 1;

      // Get activities from round 1
      const firstRoundActivities = activities[rounds[0].id] || [];

      // Create new round
      const newRoundId = await db.rounds.add({
        workoutId,
        roundNumber,
      });

      // Copy activities from round 1 with reset reps
      for (const activity of firstRoundActivities) {
        await db.activities.add({
          roundId: newRoundId,
          name: activity.name,
          reps: 0, // Start with 0 reps
        });
      }

      await loadWorkoutData();
      // Navigate to the new round
      setCurrentRoundIndex(roundNumber - 1);
    } catch (error) {
      console.error("Error adding round:", error);
    }
  };

  const addActivity = async (roundId) => {
    if (!newActivityName.trim()) return;
    try {
      await db.activities.add({
        roundId,
        name: newActivityName,
        reps: 0,
      });
      setNewActivityName("");
      await loadWorkoutData();
    } catch (error) {
      console.error("Error adding activity:", error);
    }
  };

  const handleUpdateReps = async (activity, increment) => {
    try {
      const newReps = activity.reps + increment;

      // Only update the specific activity in the state
      setActivities((prev) => ({
        ...prev,
        [activity.roundId]: prev[activity.roundId].map((act) =>
          act.id === activity.id ? { ...act, reps: newReps } : act
        ),
      }));

      if (selectedActivity?.id === activity.id) {
        setSelectedActivity((prev) => ({
          ...prev,
          reps: newReps,
        }));
      }

      // Update database without awaiting
      db.activities.update(activity.id, { reps: newReps });
    } catch (error) {
      console.error("Error updating reps:", error);
    }
  };

  const resetReps = async (activity) => {
    try {
      // Update selected activity state if we're in detail view
      if (selectedActivity && selectedActivity.id === activity.id) {
        setSelectedActivity({
          ...activity,
          reps: 0,
        });
      }

      // Update activities state
      setActivities((prev) => ({
        ...prev,
        [activity.roundId]: prev[activity.roundId].map((act) =>
          act.id === activity.id ? { ...act, reps: 0 } : act
        ),
      }));

      // Update the database
      await db.activities.update(activity.id, { reps: 0 });
    } catch (error) {
      console.error("Error resetting reps:", error);
      await loadWorkoutData();
    }
  };

  const deleteActivity = async (activityId) => {
    try {
      await db.activities.delete(activityId);
      await loadWorkoutData();
    } catch (error) {
      console.error("Error deleting activity:", error);
    }
  };

  const currentRound = rounds[currentRoundIndex];

  const handleCardClick = (activity, e) => {
    // Prevent opening detail view when clicking counter buttons or delete
    if (e.target.closest(".clickable-controls")) {
      return;
    }
    setSelectedActivity(activity);
  };

  if (!workout || !currentRound) return null;

  if (selectedActivity) {
    return (
      <Box sx={{ width: "100%", maxWidth: 800 }}>
        <ActivityDetail
          activity={selectedActivity}
          onBack={() => setSelectedActivity(null)}
          onUpdateReps={(increment) =>
            handleUpdateReps(selectedActivity, increment)
          }
          onReset={() => resetReps(selectedActivity)}
        />
      </Box>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ textAlign: "center", p: 4 }}>
        <Typography color="error" gutterBottom>
          Error: {error}
        </Typography>
        <Button variant="contained" onClick={onBack}>
          Go Back
        </Button>
      </Box>
    );
  }

  if (!workout || !rounds.length) {
    return (
      <Box sx={{ textAlign: "center", p: 4 }}>
        <Typography gutterBottom>No workout data found</Typography>
        <Button variant="contained" onClick={onBack}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", maxWidth: 800, mx: "auto" }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Stack spacing={3}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{
              pb: 2,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <IconButton onClick={onBack} sx={{ color: "text.secondary" }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography
              variant="h5"
              sx={{
                flex: 1,
                fontWeight: 500,
              }}
            >
              {workout?.name}
            </Typography>
            <Button
              variant="outlined"
              onClick={addRound}
              startIcon={<AddIcon />}
              sx={{
                borderWidth: 2,
                "&:hover": {
                  borderWidth: 2,
                },
              }}
            >
              Add Round
            </Button>
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: 1 }}
          >
            <IconButton
              onClick={() =>
                setCurrentRoundIndex((prev) => Math.max(0, prev - 1))
              }
              disabled={currentRoundIndex === 0}
              sx={{
                "&.Mui-disabled": {
                  opacity: 0,
                },
              }}
            >
              <NavigateBeforeIcon />
            </IconButton>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 500,
                color: "text.secondary",
              }}
            >
              Round {currentRound?.roundNumber} of {rounds.length}
            </Typography>
            <IconButton
              onClick={() =>
                setCurrentRoundIndex((prev) =>
                  Math.min(rounds.length - 1, prev + 1)
                )
              }
              disabled={currentRoundIndex === rounds.length - 1}
              sx={{
                "&.Mui-disabled": {
                  opacity: 0,
                },
              }}
            >
              <NavigateNextIcon />
            </IconButton>
          </Stack>

          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              size="medium"
              label="Activity Name"
              value={newActivityName}
              onChange={(e) => setNewActivityName(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && addActivity(currentRound.id)
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderWidth: 2,
                  },
                  "&:hover fieldset": {
                    borderWidth: 2,
                  },
                  "&.Mui-focused fieldset": {
                    borderWidth: 2,
                  },
                },
              }}
            />
            <Button
              variant="outlined"
              onClick={() => addActivity(currentRound.id)}
              startIcon={<AddIcon />}
              sx={{
                borderWidth: 2,
                "&:hover": {
                  borderWidth: 2,
                },
              }}
            >
              Add
            </Button>
          </Stack>

          <List sx={{ mt: 2 }}>
            {activities[currentRound?.id]?.map((activity) => (
              <Activity
                key={activity.id}
                activity={activity}
                onDelete={deleteActivity}
                onUpdateReps={handleUpdateReps}
                onClick={(e) => handleCardClick(activity, e)}
              />
            ))}
          </List>
        </Stack>
      </Paper>
    </Box>
  );
}

export default WorkoutDetail;
