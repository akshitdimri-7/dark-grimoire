import { Router } from "express";

import { userRouter } from "./user.router.js";
import { repoRouter } from "./repo.router.js";
import { issueRouter } from "./issue.router.js";

const mainRouter = Router();

mainRouter.use(userRouter);
mainRouter.use(repoRouter);
mainRouter.use(issueRouter);

mainRouter.get("/", (req, res) => {
  res.send("Hello ji!");
});

export default mainRouter;
