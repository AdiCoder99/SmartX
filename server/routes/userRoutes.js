import express from 'express';
import { createUser, getAllUsers } from "../controllers/userController.js";
import { Router } from "express";

const userRouter = Router();

userRouter.get('/', getAllUsers);
userRouter.post('/create', createUser);

export default userRouter;