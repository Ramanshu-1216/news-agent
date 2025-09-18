import express from "express";
import cors from "cors";
import { requestLogger } from "./middlewares/logger.middleware";

const app = express();

app.use(express.json());
app.use(cors());
app.use(requestLogger);

app.get("/", (req, res) => {
  res.send("Hello World");
});

export default app;
