import express from "express";
import path from "path";
import dotenv from "dotenv";
dotenv.config();
import { createServer } from "http";
import { initializeSocket } from "./app/config/socket.config";
// swagger
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';


const app = express();
const httpServer = createServer(app);

// Get io instance and make it available
const io = initializeSocket(httpServer);
app.set('io', io); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); 

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// swagger
const swaggerConfig = require(path.join(__dirname, 'swagger.json'));
const swaggerSpec = swaggerJsDoc(swaggerConfig);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'SkillSwap API Documentation'
}));

//  Serve Socket.io client
app.get('/socket.io/socket.io.js', (req, res) => {
  res.sendFile(require.resolve('socket.io-client/dist/socket.io.js'));
});

import {connectionDb} from "./app/config/dbConfig"
connectionDb()
import  {connectRedis} from "./app/config/redisConfig"
connectRedis()
import { sessionConfig } from "./app/config/sessionConfig";
app.use(sessionConfig);

// swagger router
// import { adminSwaggerRouter } from "./app/router/swagger/admin.swagger";
// app.use("/api/v1/admin",adminSwaggerRouter);
// import { authSwaggerRouter } from "./app/router/swagger/auth.swagger";
// app.use("/api/v1/auth",authSwaggerRouter);
// import { profileSwaggerRouter } from "./app/router/swagger/profile.swagger";
// app.use("/api/v1/profile",profileSwaggerRouter);
// import { browseSwaggerRouter } from "./app/router/swagger/browse.swagger";
// app.use("/api/v1/browse",browseSwaggerRouter);
// import { requestSwaggerRouter } from "./app/router/swagger/request.swagger";
// app.use("/api/v1/request",requestSwaggerRouter);
// import { chatSwaggerRouter } from "./app/router/swagger/chat.swagger";
// app.use("/api/v1/chat",chatSwaggerRouter)
// import { sessionSwaggerRouter } from "./app/router/swagger/session.swagger"; 
// app.use("/api/v1/session",sessionSwaggerRouter);

// Your routes...
// import { adminRouter } from './app/router/admin.router';
// app.use('/admin', adminRouter);
// import { Authrouter } from "./app/router/auth.router";
// app.use("/api",Authrouter);
// import { Homerouter } from "./app/router/home.router";
// app.use(Homerouter);
// import { ProfileRouter } from "./app/router/profile.router";
// app.use(ProfileRouter);
// import { BrowseRouter } from "./app/router/browse.router";
// app.use(BrowseRouter);
// import { Swaprouter } from "./app/router/request.router";
// app.use("/requests",Swaprouter);
// import {chatRouter} from "./app/router/chat.router";
// app.use("/chat",chatRouter)
// import { sessionRouter } from "./app/router/session.router";
// app.use('/sessions', sessionRouter);

import mainRouter from "./app/router/index.router";
app.use(mainRouter);



// Serve raw Swagger JSON
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

httpServer.listen(5000,()=>{
    console.log("Server port is 5000")
})