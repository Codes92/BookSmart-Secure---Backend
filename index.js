const cors = require('cors');
require('dotenv').config();
const helmet = require('helmet');

const express = require("express");

const app = express();
const port = process.env.PORT || 8081;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(helmet());
app.use(express.json());

const cookieParser = require("cookie-parser");
app.use(cookieParser());

// ========= ROUTE HANDLERS =========
/** const mainRoutes = require("./routes/mainRoutes");
app.use("/", mainRoutes); */

const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

const bookRoutes = require("./routes/bookRoutes");
app.use("/books", bookRoutes);

const libraryRoutes = require("./routes/libraryRoutes");
app.use("/library", libraryRoutes);

const profileRoutes = require("./routes/profileRoutes");
app.use("/profile", profileRoutes);

const preferenceRoutes = require("./routes/preferenceRoutes");
app.use("/preferences", preferenceRoutes);

const languageRoutes = require("./routes/languageRoutes");
app.use("/languages", languageRoutes);

const userLanguageRoutes = require("./routes/userLanguageRoutes");
app.use("/user-languages", userLanguageRoutes);

const genreRoutes = require("./routes/genreRoutes");
app.use("/genres", genreRoutes);

const userGenreRoutes = require("./routes/userGenreRoutes");
app.use("/user-genres", userGenreRoutes);

const goalRoutes = require("./routes/goalRoutes");
app.use("/goals", goalRoutes);

const recommendationRoutes = require("./routes/recommendationRoutes");
app.use("/recommendations", recommendationRoutes);

app.listen(port, () => console.log(`Node server is running on port ${port}...`));
