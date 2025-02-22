import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { db } from "../db/db";
import { useTheme } from "@mui/material/styles";

function WorkoutList({ onSelectWorkout }) {
  const [workouts, setWorkouts] = useState([]);
  const [newWorkoutName, setNewWorkoutName] = useState("");
  const [workoutType, setWorkoutType] = useState("amrap"); // amrap, fortime, emom
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const theme = useTheme();

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      const savedWorkouts = await db.workouts.toArray();
      setWorkouts(savedWorkouts);
    } catch (error) {
      console.error("Error loading workouts:", error);
    }
  };

  const addWorkout = async () => {
    if (!newWorkoutName.trim()) return;
    try {
      // First create the workout
      const workoutId = await db.workouts.add({
        name: newWorkoutName,
        type: workoutType,
        createdAt: new Date().toISOString(),
      });

      // Then create the initial round
      await db.rounds.add({
        workoutId,
        roundNumber: 1,
      });

      setNewWorkoutName("");
      await loadWorkouts();
      onSelectWorkout(workoutId); // Navigate to new workout
    } catch (error) {
      console.error("Error adding workout:", error);
    }
  };

  const deleteWorkout = async (id, e) => {
    e.stopPropagation(); // Prevent navigation when deleting
    try {
      await db.workouts.delete(id);
      // Also delete associated rounds and activities
      const roundsToDelete = await db.rounds
        .where("workoutId")
        .equals(id)
        .toArray();
      await db.rounds.bulkDelete(roundsToDelete.map((r) => r.id));
      await db.activities.bulkDelete(
        roundsToDelete.flatMap((r) => r.activities)
      );
      await loadWorkouts();
    } catch (error) {
      console.error("Error deleting workout:", error);
    }
  };

  const getFilteredWorkouts = () => {
    return workouts
      .filter((workout) =>
        workout.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 600 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Workouts
        </Typography>

        <Stack spacing={2} sx={{ mb: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="Workout Name"
            value={newWorkoutName}
            onChange={(e) => setNewWorkoutName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addWorkout()}
          />
          <FormControl fullWidth size="small">
            <InputLabel>Workout Type</InputLabel>
            <Select
              value={workoutType}
              label="Workout Type"
              onChange={(e) => setWorkoutType(e.target.value)}
            >
              <MenuItem value="amrap">AMRAP</MenuItem>
              <MenuItem value="fortime">For Time</MenuItem>
              <MenuItem value="emom">EMOM</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            onClick={addWorkout}
            startIcon={<AddIcon />}
          >
            Add Workout
          </Button>
        </Stack>

        <TextField
          fullWidth
          size="small"
          label="Search Workouts"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
        />

        <List>
          {getFilteredWorkouts().map((workout) => (
            <Paper
              key={workout.id}
              elevation={1}
              sx={{
                mb: 1,
                "&:hover": { bgcolor: "action.hover", cursor: "pointer" },
              }}
            >
              <ListItem
                onClick={() => {
                  console.log("Clicking workout:", workout.id);
                  onSelectWorkout(workout.id);
                }}
              >
                <ListItemText
                  primary={workout.name}
                  secondary={`${workout.type.toUpperCase()} - Created: ${new Date(
                    workout.createdAt
                  ).toLocaleDateString()}`}
                />
                <IconButton
                  edge="end"
                  color="error"
                  onClick={(e) => deleteWorkout(workout.id, e)}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </ListItem>
            </Paper>
          ))}
        </List>
      </Paper>
    </Box>
  );
}

export default WorkoutList;
