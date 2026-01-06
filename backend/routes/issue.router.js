import { Router } from "express";
import {
  createIssue,
  deleteIssueById,
  getAllIssues,
  getIssueById,
  updateIssueById,
} from "../controllers/issueController.js";

const issueRouter = Router();

issueRouter.post("/issue/create", createIssue);
issueRouter.get("/issue/all", getAllIssues);
issueRouter.post("/issue/:id", getIssueById);
issueRouter.put("/issue/update/:id", updateIssueById);
issueRouter.delete("/issue/delete/:id", deleteIssueById);

export { issueRouter };
