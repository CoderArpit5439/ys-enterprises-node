import express from "express";
import cors from "cors";
import envconfig from "./config/enviormentconfig.js";
import { sequelize } from "./config/database.config.js";
import Admin from "./models/adminModel.js";
import adminRoutes from "./routes/adminRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import workDiaryRoutes from "./routes/workDiaryRoutes.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorMiddleware.js";

const app = express();

app.use(
  cors({
    origin: envconfig.corsOrigins,
    credentials: envconfig.corsOrigins !== "*",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is live",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
});

app.use("/api/admin", adminRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/work-diary", workDiaryRoutes);

notFoundHandler(app);
app.use(errorHandler);

const PORT = envconfig.port || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");
    await Admin.sync();
    console.log("Admin table is ready");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to database:", error.message);
  }
}

startServer();

export default app;
