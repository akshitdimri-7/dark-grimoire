import mongoose from "mongoose";

import Repository from "../models/repoModel.js";
import Issue from "../models/issueModel.js";
import User from "../models/userModel.js";

const createIssue = async (req, res) => {
  const { title, description } = req.body;
  const repoId = req.params.id;

  try {
    const issue = new Issue({
      title,
      description,
      repository: repoId,
    });

    await issue.save();

    return res.status(201).json(issue);
  } catch (error) {
    console.error("Error during creating issue:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateIssueById = async (req, res) => {
  const issueId = req.params.id;
  const { title, description, status } = req.body;

  try {
    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({ message: "Issue not found!" });
    }

    issue.title = title;
    issue.status = status;
    issue.description = description;

    await issue.save();

    return res.json({ message: "Issue updated.", issue });
  } catch (error) {
    console.error("Error during updating issue:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

const deleteIssueById = async (req, res) => {
  const issueId = req.params.id;

  try {
    const issue = Issue.findByIdAndDelete(issueId);

    if (!issue) {
      return res.status(404).json({ error: "Issue not found!" });
    }
    res.json({ message: "Issue deleted" });
  } catch (err) {
    console.error("Error during issue deletion : ", err.message);
    res.status(500).send("Server error");
  }
};

const getAllIssues = async (req, res) => {
  const repoId = req.params.id;

  try {
    const issues = Issue.find({ repository: repoId });

    if (!issues) {
      return res.status(404).json({ error: "Issues not found!" });
    }
    res.status(200).json(issues);
  } catch (err) {
    console.error("Error during issue fetching : ", err.message);
    res.status(500).send("Server error");
  }
};

const getIssueById = async (req, res) => {
  const issueId = req.params.id;
  try {
    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({ error: "Issue not found!" });
    }

    res.json(issue);
  } catch (err) {
    console.error("Error during issue updation : ", err.message);
    res.status(500).send("Server error");
  }
};

export {
  createIssue,
  updateIssueById,
  deleteIssueById,
  getAllIssues,
  getIssueById,
};
