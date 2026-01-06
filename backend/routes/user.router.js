import { Router } from "express";
import {
  deleteUserProfile,
  getAllusers,
  getUserProfile,
  login,
  signup,
  updateUserProfile,
  updateStarredRepositories,
} from "../controllers/userController.js";

const userRouter = Router();

userRouter.get("/allUsers", getAllusers);
userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.get("/userProfile/:id", getUserProfile);
userRouter.put("/userProfile/:id/starred", updateStarredRepositories);
userRouter.put("/updateProfile/:id", updateUserProfile);
userRouter.delete("/deleteProfile/:id", deleteUserProfile);

export { userRouter };
