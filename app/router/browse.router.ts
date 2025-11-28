
import { Router } from 'express';
import { browseController } from '../controllers/browse.controller';
import { requireAuth } from '../middleware/auth.middleware';

const BrowseRouter = Router();

BrowseRouter.get("/browse",requireAuth,browseController.browseUsers);
BrowseRouter.get('/api/search-skills',requireAuth, browseController.searchSkills);

export { BrowseRouter };