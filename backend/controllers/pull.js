// import fs from "fs/promises";
// import path from "path";

// import { s3, S3_BUCKET } from "../config/aws-config.js";

// async function pullRepo() {
//   const repoPath = path.resolve(process.cwd(), ".grimoire");
//   const commitsPath = path.join(repoPath, "commits");

//   try {
//     const data = await s3
//       .listObjectsV3({
//         Bucket: S3_BUCKET,
//         Prefix: "commits/",
//       })
//       .promise();

//     const objects = data.Contents;

//     for (const object of objects) {
//       const key = object.Key;
//       const commitDir = path.join(
//         commitsPath,
//         path.dirname(key).split("/").pop()
//       );

//       await fs.mkdir(commitDir, { recursive: true });

//       const params = {
//         Bucket: S3_BUCKET,
//         Key: key,
//       };

//       const fileContent = await s3.getObject(params).promise;
//       await fs.writeFile(path.join(repoPath, key), fileContent.Body);

//       console.log("All commits pulled from s3.");
//     }
//   } catch (error) {
//     console.error("Unable to pull: ", error);
//   }
// }

// export { pullRepo };

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
