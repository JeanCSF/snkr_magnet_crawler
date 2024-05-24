require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());

app.use(express.json());

const conn = require("./db/conn");
conn();

const routes = require("./routes/router");

app.use("/", routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});

