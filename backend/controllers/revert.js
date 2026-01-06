import { readdir, copyFile } from "fs/promises";
import path from "path";

async function revertRepo(commitID) {
  const repoPath = path.resolve(process.cwd(), ".grimoire");
  const commitsPath = path.join(repoPath, "commits");

  try {
    const commitDir = path.join(commitsPath, commitID);
    const files = await readdir(commitDir);
    const parentDir = path.resolve(repoPath, "..");

    for (const file of files) {
      await copyFile(path.join(commitDir, file), path.join(parentDir, file));
    }

    console.log(`Commits with id: ${commitID} are reverted successfully.`);
  } catch (error) {
    console.error("Unable to revert:", error);
  }
}

export { revertRepo };
