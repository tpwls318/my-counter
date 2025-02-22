import Dexie from "dexie";

export const db = new Dexie("FitnessDB");

db.version(1).stores({
  workouts: "++id, name, type, totalTime, totalWeight, createdAt",
  rounds: "++id, workoutId, roundNumber",
  activities: "++id, roundId, name, reps",
});
