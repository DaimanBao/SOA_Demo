const express = require("express");
const cors = require("cors");

const studentRoutes = require("./routes/sinhvien.route");
const detaiRoutes = require("./routes/detai.route");
const dangkyRoutes = require("./routes/dangky.route");

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/sinhvien", studentRoutes);
app.use("/api/detai", detaiRoutes);
app.use("/api/dangky", dangkyRoutes);

module.exports = app;