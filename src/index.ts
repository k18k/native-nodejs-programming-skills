import { mkdirSync, rmSync, writeFileSync } from "node:fs";

const owner = "nodejs";
const repo = "node";
const path = "doc/api";
const ref = "v26.x";

const outputDir = "skills/native-nodejs-programming/api";
const apisMd = "skills/native-nodejs-programming/apis.md";

interface GitHubFile {
  download_url: string | null;
  name: string;
  path: string;
  type: string;
}

const response = await fetch(
  `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`,
  {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2026-03-10",
      ...(process.env.GITHUB_TOKEN
        ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
        : {}),
    },
  },
);

if (!response.ok) {
  throw new Error(`Failed to fetch API index: ${response.status}`);
}

const data: unknown = await response.json();
if (!Array.isArray(data)) throw new Error("Expected the API index to be an array.");

const files = (data as GitHubFile[]).filter(
  (file) => file.type === "file" && file.download_url,
);

const contents = await Promise.all(
  files.map(async (file) => {
    const contentResponse = await fetch(file.download_url!);
    if (!contentResponse.ok) {
      throw new Error(
        `Failed to fetch ${file.path}: ${contentResponse.status}`,
      );
    }
    return { name: file.name, content: await contentResponse.text() };
  }),
);

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

writeFileSync(
  apisMd,
  [
    "# Node.js API Documentation",
    "",
    files
      .map((file) => `- [${file.name}](./api/${file.name})`)
      .join("\n"),
  ].join("\n"),
);

for (const file of contents) {
  writeFileSync(`${outputDir}/${file.name}`, file.content);
}
