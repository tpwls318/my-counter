import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { db } from "../db/db";

function Counter() {
  const [counters, setCounters] = useState([]);
  const [newCounterName, setNewCounterName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // Load counters on component mount
  useEffect(() => {
    loadCounters();
  }, []);

  const loadCounters = async () => {
    try {
      const savedCounters = await db.counters.toArray();
      setCounters(savedCounters);
    } catch (error) {
      console.error("Error loading counters:", error);
    }
  };

  // Sort and filter counters
  const getSortedAndFilteredCounters = () => {
    return counters
      .filter((counter) =>
        counter.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case "name":
            comparison = a.name.localeCompare(b.name);
            break;
          case "value":
            comparison = a.value - b.value;
            break;
          case "date":
            comparison = new Date(a.createdAt) - new Date(b.createdAt);
            break;
          default:
            comparison = 0;
        }
        return sortOrder === "asc" ? comparison : -comparison;
      });
  };

  const addCounter = async () => {
    if (!newCounterName.trim()) return;

    try {
      await db.counters.add({
        name: newCounterName,
        value: 0,
        createdAt: new Date().toISOString(),
      });
      setNewCounterName("");
      await loadCounters();
    } catch (error) {
      console.error("Error adding counter:", error);
    }
  };

  const updateCounter = async (id, newValue) => {
    try {
      await db.counters.update(id, { value: newValue });
      await loadCounters();
    } catch (error) {
      console.error("Error updating counter:", error);
    }
  };

  const deleteCounter = async (id) => {
    try {
      await db.counters.delete(id);
      await loadCounters();
    } catch (error) {
      console.error("Error deleting counter:", error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Counters
          </Typography>

          {/* Add new counter form */}
          <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Counter Name"
              value={newCounterName}
              onChange={(e) => setNewCounterName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addCounter()}
            />
            <Button
              variant="contained"
              onClick={addCounter}
              startIcon={<AddIcon />}
            >
              Add Counter
            </Button>
          </Stack>

          {/* Search and Sort Controls */}
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="Search Counters"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="value">Value</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Order</InputLabel>
              <Select
                value={sortOrder}
                label="Order"
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <MenuItem value="desc">Descending</MenuItem>
                <MenuItem value="asc">Ascending</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {/* Counters List */}
          <List>
            {getSortedAndFilteredCounters().map((counter) => (
              <div key={counter.id}>
                <ListItem>
                  <ListItemText
                    primary={counter.name}
                    secondary={`Created: ${new Date(
                      counter.createdAt
                    ).toLocaleDateString()}`}
                  />
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        updateCounter(counter.id, counter.value - 1)
                      }
                    >
                      <RemoveIcon />
                    </Button>
                    <Typography variant="h6" sx={{ mx: 2 }}>
                      {counter.value}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        updateCounter(counter.id, counter.value + 1)
                      }
                    >
                      <AddIcon />
                    </Button>
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={() => deleteCounter(counter.id)}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Stack>
                </ListItem>
                <Divider />
              </div>
            ))}
          </List>
        </Paper>
      </Box>
    </Container>
  );
}

export default Counter;
