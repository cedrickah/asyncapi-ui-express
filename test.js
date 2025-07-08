import express from "express";
import { serve } from "./dist/index.esm.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/event-docs", serve(path.join(__dirname, "output")));

app.listen(8000, () => console.log("Server listening on port 8000"));
