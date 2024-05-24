import dotenv from "dotenv";
import connectDB from "./DB/dbConnection.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    const port = process.env.PORT || 8000;
    const localIP = "0.0.0.0"; // Replace with your local IP address

    app.listen(port, () => {
      console.log(`Server is running at http://${localIP}:${port}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB Connection failed :- ", err);
  });
