require('dotenv').config();

const express = require("express");

const app = express();
const port = 8081;

app.use(express.json());

app.listen(port, () => console.log(`Node server is running on port ${port}...`));

// ========= ROUTE HANDLERS =========
const mainRoutes = require("./routes/mainRoutes");
app.use("/", mainRoutes);

const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);