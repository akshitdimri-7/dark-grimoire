import fs from "fs/promises";
import path from "path";
import { ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";

import { s3, S3_BUCKET } from "../config/aws-config.js";

async function pullRepo() {
  const repoPath = path.resolve(process.cwd(), ".grimoire");

  try {
    const data = await s3.send(
      new ListObjectsV2Command({
        Bucket: S3_BUCKET,
        Prefix: "commits/",
      })
    );

    const objects = data.Contents || [];

    for (const object of objects) {
      const key = object.Key;

      if (key.endsWith("/")) continue;

      const localPath = path.join(repoPath, key);
      await fs.mkdir(path.dirname(localPath), { recursive: true });

      const response = await s3.send(
        new GetObjectCommand({
          Bucket: S3_BUCKET,
          Key: key,
        })
      );

      const chunks = [];
      for await (const chunk of response.Body) chunks.push(chunk);
      const fileContent = Buffer.concat(chunks);

      await fs.writeFile(localPath, fileContent);

      console.log(`Pulled: ${key}`);
    }

    console.log("All commits pulled from s3.");
  } catch (error) {
    console.error("Unable to pull: ", error);
  }
}

export { pullRepo };
