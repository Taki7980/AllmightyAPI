import { signin, signout, signup } from '#controllers/auth.controller.js';
import express from 'express';

const authRouter = express.Router();

authRouter.post('/sign-up', signup);

authRouter.post('/sign-in', signin);

authRouter.post('/sign-out', signout);

export default authRouter;
