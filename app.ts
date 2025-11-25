import express from "express";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); 

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 


import {connectionDb} from "./app/config/dbConfig"
connectionDb()
import  {connectRedis} from "./app/config/redisConfig"
connectRedis()
import { sessionConfig } from "./app/config/sessionConfig";
app.use(sessionConfig);



import { Authrouter } from "./app/router/auth.router";
app.use("/api",Authrouter);
import { Homerouter } from "./app/router/home.router";
app.use(Homerouter);
import { ProfileRouter } from "./app/router/profile.router";
app.use(ProfileRouter);
import { BrowseRouter } from "./app/router/browse.router";
app.use(BrowseRouter);

app.listen(5000,()=>{
    console.log("Server port is 5000")
})