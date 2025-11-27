import express from "express";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import { initializeSocket } from "./app/config/socket.config";

const app = express();
const httpServer = createServer(app);

// ✅ CORRECT: Get io instance and make it available
const io = initializeSocket(httpServer);
app.set('io', io); // This allows routes to access io

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); 

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 

// ✅ ADD: Serve Socket.io client
app.get('/socket.io/socket.io.js', (req, res) => {
  res.sendFile(require.resolve('socket.io-client/dist/socket.io.js'));
});

import {connectionDb} from "./app/config/dbConfig"
connectionDb()
import  {connectRedis} from "./app/config/redisConfig"
connectRedis()
import { sessionConfig } from "./app/config/sessionConfig";
app.use(sessionConfig);

// Your routes...
import { Authrouter } from "./app/router/auth.router";
app.use("/api",Authrouter);
import { Homerouter } from "./app/router/home.router";
app.use(Homerouter);
import { ProfileRouter } from "./app/router/profile.router";
app.use(ProfileRouter);
import { BrowseRouter } from "./app/router/browse.router";
app.use(BrowseRouter);
import { Swaprouter } from "./app/router/request.router";
app.use("/requests",Swaprouter);
import {chatRouter} from "./app/router/chat.router";
app.use("/chat",chatRouter)

httpServer.listen(5000,()=>{
    console.log("Server port is 5000")
})