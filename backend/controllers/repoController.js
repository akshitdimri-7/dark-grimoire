import mongoose from "mongoose";

import Repository from "../models/repoModel.js";

const createRepository = async (req, res) => {
  const { owner, name, issues, content, description, visibility } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ error: "Repository name is required!" });
    }
    if (!mongoose.Types.ObjectId.isValid(owner)) {
      return res.status(400).json({ error: "Owner not found!" });
    }

    const newRepository = new Repository({
      name,
      description,
      visibility,
      owner,
      issues,
      content,
    });

    const result = await newRepository.save();

    return res.status(201).json({
      message: "Repository created!",
      repositoryID: result._id,
    });
  } catch (error) {
    console.error("Error during creation of repository: ", error.message);
    res.status(500).json({ message: "Server error!" });
  }
};

const getAllRepositories = async (req, res) => {
  try {
    const repositories = await Repository.find({})
      .populate("owner")
      .populate("issues");

    if (!repositories || repositories.length === 0) {
      return res.status(200).json({
        message: "No repositories exist",
        repositories: [],
      });
    }

    console.log("Repositories fetched successfully");
    return res.status(200).json({
      message: "Repositories fetched successfully",
      repositories,
    });
  } catch (error) {
    console.error("Error during fetching repositories:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

const fetchRepositoryById = async (req, res) => {
  const repoID = req.params.id;

  try {
    const repo = await Repository.findById(repoID)
      .populate("owner")
      .populate("issues");

    if (!repo) {
      return res.status(404).json({ message: "No such repository found" });
    }

    console.log("Repository fetched successfully");
    return res.status(200).json({
      message: "Repository fetched successfully",
      repository: repo,
    });
  } catch (error) {
    console.error("Error during fetching repository:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

const fetchRepositoryByName = async (req, res) => {
  const { name } = req.params;

  try {
    const repo = await Repository.findOne({ name })
      .populate("owner")
      .populate("issues");

    if (!repo) {
      return res.status(404).json({ message: "No such repository found" });
    }

    return res.status(200).json({
      message: "Repository fetched successfully",
      repository: repo,
    });
  } catch (error) {
    console.error("Error during fetching repository:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

const fetchRepositoryForCurrentUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    const repositories = await Repository.find({ owner: userId })
      .populate("owner")
      .populate("issues");

    if (!repositories || repositories.length === 0) {
      return res.status(404).json({ message: "OOPS! repositories not found." });
    }

    return res.json({ message: "Repositories found!", repositories });
  } catch (error) {
    console.error("Error during fetching repositories:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateRepositoryById = async (req, res) => {
  const repoId = req.params.id;
  const { content, description } = req.body;

  try {
    const repository = await Repository.findOneAndUpdate(
      { _id: repoId },
      {
        $set: { description },
        $push: { content },
      },
      { new: true, runValidators: true }
    )
      .populate("owner")
      .populate("issues");

    if (!repository) {
      return res
        .status(404)
        .json({ message: "Repository not found or not yours." });
    }

    return res.json({
      message: "Repository updated successfully",
      repository,
    });
  } catch (error) {
    console.error("Error during updating repository:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const toggleVisibilityById = async (req, res) => {
  const repoId = req.params.id;

  try {
    const repository = await Repository.findById(repoId)
      .populate("owner")
      .populate("issues");

    if (!repository) {
      return res
        .status(404)
        .json({ message: "Repository not found or not yours." });
    }

    repository.visibility = !repository.visibility;

    await repository.save();

    return res.json({
      message: "Visibility toggled successfully",
      repository,
    });
  } catch (error) {
    console.error("Error during toggling visibility:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// const deleteRepositoryById = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const repository = await Repository.findByIdAndDelete(id);

//     if (!repository) {
//       return res
//         .status(404)
//         .json({ message: "Repository not found or not yours." });
//     }
//   } catch (error) {
//     console.error("Error during deleting repository:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

const deleteRepositoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const repository = await Repository.findById(id);

    if (!repository) {
      return res.status(404).json({ message: "Repository not found." });
    }

    await repository.deleteOne();   // <-- guaranteed awaited

    return res.status(200).json({
      success: true,
      message: "Repository deleted",
      id
    });

  } catch (error) {
    console.error("Error deleting repository:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


export {
  createRepository,
  getAllRepositories,
  fetchRepositoryById,
  fetchRepositoryByName,
  fetchRepositoryForCurrentUser,
  updateRepositoryById,
  toggleVisibilityById,
  deleteRepositoryById,
};
