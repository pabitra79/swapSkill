

import { Router } from "express";

import { adminRouter } from "./admin.router";
import { Authrouter } from "./auth.router";
import { Homerouter } from "./home.router";
import { ProfileRouter } from "./profile.router";
import { BrowseRouter } from "./browse.router";
import { Swaprouter } from "./request.router";
import { chatRouter } from "./chat.router";
import { sessionRouter } from "./session.router";


import { adminSwaggerRouter } from "./swagger/admin.swagger";
import { authSwaggerRouter } from "./swagger/auth.swagger";
import { profileSwaggerRouter } from "./swagger/profile.swagger";
import { browseSwaggerRouter } from "./swagger/browse.swagger";
import { requestSwaggerRouter } from "./swagger/request.swagger";
import { chatSwaggerRouter } from "./swagger/chat.swagger";
import { sessionSwaggerRouter } from "./swagger/session.swagger";

const router = Router();


router.use('/admin', adminRouter);
router.use('/api', Authrouter);
router.use('/', Homerouter);
router.use('/', ProfileRouter);
router.use('/', BrowseRouter);
router.use('/requests', Swaprouter);
router.use('/chat', chatRouter);
router.use('/sessions', sessionRouter);

router.use('/api/v1/admin', adminSwaggerRouter);
router.use('/api/v1/auth', authSwaggerRouter);
router.use('/api/v1/profile', profileSwaggerRouter);
router.use('/api/v1/browse', browseSwaggerRouter);
router.use('/api/v1/request', requestSwaggerRouter);
router.use('/api/v1/chat', chatSwaggerRouter);
router.use('/api/v1/session', sessionSwaggerRouter);

export default router;
