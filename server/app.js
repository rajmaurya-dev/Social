import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import helmet from "helmet";
import path from "path";
import dbConnection from "./database/dbconfig.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import router from "./routes/index.js";

const __dirname = path.resolve(path.dirname(""));
dotenv.config();
const app = express();
app.use(express.static(path.join(__dirname, "views/build")));
const PORT = process.env.PORT || 8800;
dbConnection();
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// error middleware
app.use(errorMiddleware);

app.use(router);
app.listen(PORT, () => {
  console.log(`server is listening on ${PORT}`);
});
