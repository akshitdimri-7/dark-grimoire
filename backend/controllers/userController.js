import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;

let client;

async function connectClient() {
  if (!client) {
    client = new MongoClient(uri);

    await client.connect();
  }
}

const signup = async (req, res) => {
  const { username, password, email } = req.body;

  try {
    await connectClient();
    const db = client.db("Cluster0");
    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: `User with username "${username}" already exists!` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      username,
      password: hashedPassword,
      email,
      repositories: [],
      followedUser: [],
      starRepos: [],
    };

    const result = await usersCollection.insertOne(newUser);

    const token = jwt.sign(
      { id: result.insertedId },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ token: token, userId: result.insertedId });
  } catch (error) {
    console.error("Something bad occurred during signup: ", error);
    return res.status(500).send("Server Error");
  }
};

const login = async (req, res) => {
  const { password, email } = req.body;

  try {
    await connectClient();
    const db = client.db("Cluster0");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: `Invalid credentials!` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: `Invalid credentials!` });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });

    res.json({ token, userId: user._id });
  } catch (error) {
    console.error("Error during login: ", error.message);
    return res.status(500).send("Server Error");
  }
};

const getAllusers = async (req, res) => {
  try {
    await connectClient();
    const db = client.db("Cluster0");
    const usersCollection = db.collection("users");

    const users = await usersCollection.find({}).toArray();

    res.json(users);
  } catch (error) {
    console.error("Error during fetching: ", error.message);
    return res.status(500).send("Server Error");
  }
};

const getUserProfile = async (req, res) => {
  const userId = req.params.id;

  try {
    await connectClient();
    const db = client.db("Cluster0");
    const usersCollection = db.collection("users");

    // Validate id
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user id format." });
    }

    const user = await usersCollection.findOne({
      _id: new ObjectId(userId),
    });

    if (!user) {
      return res.status(404).json({ message: "OOPS! User not found." });
    }

    return res.json({
      message: "Profile fetched",
      data: user,
    });
  } catch (error) {
    console.error("Error during fetching:", error.message);
    return res.status(500).send("Server Error");
  }
};

const updateUserProfile = async (req, res) => {
  const currentID = req.params.id;
  const { email, password } = req.body;

  // Validate ID format
  if (!ObjectId.isValid(currentID)) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }

  try {
    await connectClient();
    const db = client.db("Cluster0");
    const usersCollection = db.collection("users");

    let updateFields = {};

    if (email) updateFields.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateFields.password = hashedPassword;
    }

    // Update user and get the updated document directly
    const updatedUser = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(currentID) },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    // Check if user was found and updated
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    console.log("User updated successfully");
    res.json(updatedUser);
  } catch (err) {
    console.error("Error during updating: ", err.message);
    res.status(500).json({ message: "Server error!" });
  }
};

const deleteUserProfile = async (req, res) => {
  const userId = req.params.id;

  try {
    await connectClient();
    const db = client.db("Cluster0");
    const usersCollection = db.collection("users");

    const result = await usersCollection.deleteOne({
      _id: new ObjectId(userId),
    });

    if (result.deleteCount == 0) {
      return res.status(404).json({ message: "OOPS! User not found." });
    }

    return res.json({ message: "User Deleted successfully!" });
  } catch (error) {
    console.error("Error during deletion:", error.message);
    return res.status(500).send("Server Error");
  }
};

const updateStarredRepositories = async (req, res) => {
  const userId = req.params.id;
  const { starredRepositories } = req.body;

  try {
    await connectClient();
    const db = client.db("Cluster0");
    const usersCollection = db.collection("users");

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user id format." });
    }

    if (!Array.isArray(starredRepositories)) {
      return res.status(400).json({
        message: "starredRepositories must be an array",
      });
    }

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { starRepos: starredRepositories } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "Starred repositories updated",
      starRepos: starredRepositories,
    });
  } catch (error) {
    console.error("Error updating starred repos:", error.message);
    return res.status(500).send("Server Error");
  }
};

export {
  getAllusers,
  getUserProfile,
  signup,
  login,
  updateUserProfile,
  deleteUserProfile,
  updateStarredRepositories,
};
