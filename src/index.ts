import { Octokit } from "@octokit/rest";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const owner = "nodejs";
const repo = "node";
const path = "doc/api";
const ref = "v24.x";

const outputDir = "skills/native-nodejs-programming/api";
const apisMd = "skills/native-nodejs-programming/apis.md";

const response = await octokit.rest.repos.getContent({
  owner,
  repo,
  path,
  ref,
  headers: {
    "X-GitHub-Api-Version": "2026-03-10",
  },
});

if (!response.data || !Array.isArray(response.data)) {
  console.error("Failed to fetch directory content.");
  process.exit(1);
}

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

writeFileSync(
  apisMd,
  [
    "# Node.js API Documentation",
    "",
    response.data
      .map((file) => `- [${file.name}]('./api/${file.name}')`)
      .join("\n"),
  ].join("\n"),
);

await Promise.all(
  response.data.map(async (file) => {
    const contentResponse = await octokit.rest.repos.getContent({
      owner,
      repo,
      ref,
      path: file.path,
      headers: {
        "X-GitHub-Api-Version": "2026-03-10",
      },
    });

    if (!contentResponse.data || Array.isArray(contentResponse.data)) {
      throw new Error(`Failed to fetch content for ${file.path}`);
    }

    if (contentResponse.data.type !== "file") {
      throw new Error(
        `Expected a file but got ${contentResponse.data.type} for ${file.path}`,
      );
    }

    const content = Buffer.from(
      contentResponse.data.content,
      "base64",
    ).toString("utf-8");
    writeFileSync(`${outputDir}/${file.name}`, content);
  }),
);
