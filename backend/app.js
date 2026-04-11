const cors = require("cors");
const express = require("express");

const dashboardRoutes = require("./routes/dashboardRoutes");
const fineRoutes = require("./routes/fineRoutes");
const officerRoutes = require("./routes/officerRoutes");
const ownerRoutes = require("./routes/ownerRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const violationRoutes = require("./routes/violationRoutes");
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ message: "Traffic Fine Management API is running" });
});

app.use("/api/owners", ownerRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/officers", officerRoutes);
app.use("/api/violations", violationRoutes);
app.use("/api/fines", fineRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);` `

module.exports = app;
