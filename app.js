import express from "express";
import cors from "cors";
import envconfig from "./config/enviormentconfig.js";
import { sequelize } from "./config/database.config.js";
import Admin from "./models/adminModel.js";
import Service from "./models/serviceModel.js";
import Inquiry from "./models/inquiryModel.js";
import Event from "./models/eventModel.js";
import adminRoutes from "./routes/adminRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import workDiaryRoutes from "./routes/workDiaryRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import inquiryRoutes from "./routes/inquiryRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorMiddleware.js";
import { seedDefaultServices } from "./services/serviceService.js";
import { seedDefaultEvents } from "./services/eventService.js";

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
app.use("/api/services", serviceRoutes);
app.use("/api/inquiry", inquiryRoutes);
app.use("/api/events", eventRoutes);

notFoundHandler(app);
app.use(errorHandler);

const PORT = envconfig.port || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");
    await Admin.sync();
    console.log("Admin table is ready");
    await Service.sync();
    await Inquiry.sync();
    await Event.sync();
    await seedDefaultServices();
    await seedDefaultEvents();
    console.log("Service, inquiry, and event tables are ready");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to database:", error.message);
  }
}

startServer();

export default app;
