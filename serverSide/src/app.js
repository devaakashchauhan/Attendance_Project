import express from "express";
import bodyParser from "body-parser";

const app = express();

app.use(bodyParser.json());

// routes
import userRouter from "./Routes/user.routes.js";
import adminRouter from "./Routes/admin.routes.js";

// routes declaration

// user
app.use("/api/v1/users", userRouter);

// admin
app.use("/api/v1/admin", adminRouter);

export { app };
