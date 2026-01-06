import fs from "fs/promises";
import path from "path";

async function addRepo(filePath) {
  const repoPath = path.resolve(process.cwd(), ".grimoire");
  const stagingPath = path.join(repoPath, "staging");

  try {
    await fs.mkdir(stagingPath, { recursive: true });
    const fileName = path.basename(filePath);
    await fs.copyFile(filePath, path.join(stagingPath, fileName));
    console.log(`File ${fileName} is added to the staging area.`);
  } catch (error) {
    console.error("Error occurred while adding the files: ", error);
  }
}

export { addRepo };
