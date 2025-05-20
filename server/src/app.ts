import express from "express";
import gradesRouter from "./grades";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use("/api", gradesRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
