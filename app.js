const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chatRoutes');
require('dotenv').config();
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(cors({
  origin: process.env.FRONTEND_URL, 
}));
app.use(express.json());

app.use('/api/chat', chatRoutes); 

module.exports = app;
