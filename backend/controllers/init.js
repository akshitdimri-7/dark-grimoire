import fs from "fs/promises";
import path from "path";

async function initRepo() {
  const repoPath = path.resolve(process.cwd(), ".grimoire");
  const commitsPath = path.join(repoPath, "commits");

  try {
    await fs.mkdir(repoPath, { recursive: true });
    await fs.mkdir(commitsPath, { recursive: true });
    await fs.writeFile(
      path.join(repoPath, "config.json"),
      JSON.stringify({ bucket: "s3 bucket" })
    );
    console.log("Repository initialized.");
  } catch (error) {
    console.error("Error occurred while initializing the repository: ", error);
  }
}

export { initRepo };
