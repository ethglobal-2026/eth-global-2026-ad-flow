import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const deploymentsDir = join(__dirname, "..", "deployments");

function loadDeploymentEntries() {
  if (!existsSync(deploymentsDir)) {
    throw new Error(`Deployments directory not found: ${deploymentsDir}`);
  }

  return readdirSync(deploymentsDir)
    .filter(file => file.endsWith(".json"))
    .map(file => {
      const filePath = join(deploymentsDir, file);
      const content = JSON.parse(readFileSync(filePath, "utf8"));
      return {
        file,
        filePath,
        chainId: file.replace(/\.json$/, ""),
        networkName: content.networkName,
        content,
        modifiedAt: statSync(filePath).mtimeMs,
      };
    });
}

function resolveDeployment(entries, target) {
  if (target) {
    const normalizedTarget = String(target).toLowerCase();
    const matched = entries.find(
      entry =>
        entry.chainId === normalizedTarget ||
        String(entry.networkName || "").toLowerCase() === normalizedTarget,
    );

    if (!matched) {
      throw new Error(`No deployment found for target "${target}" in ${deploymentsDir}`);
    }

    return matched;
  }

  const [latest] = [...entries].sort((a, b) => b.modifiedAt - a.modifiedAt);
  if (!latest) {
    throw new Error(`No deployment JSON files found in ${deploymentsDir}`);
  }
  return latest;
}

function buildMarkdown(entry) {
  const contractEntries = Object.entries(entry.content).filter(([key]) => key !== "networkName");
  const summaryName = entry.networkName || entry.chainId;

  return `# Deployment Summary

- Network: \`${summaryName}\`
- Chain ID: \`${entry.chainId}\`

## Contract Addresses

${contractEntries.map(([address, name]) => `- \`${name}\`: \`${address}\``).join("\n")}

## Deployment Artifacts

- JSON: \`packages/foundry/deployments/${entry.file}\`
`;
}

function main() {
  const target = process.argv[2];
  const entries = loadDeploymentEntries();
  const deployment = resolveDeployment(entries, target);
  const summaryName = deployment.networkName || deployment.chainId;
  const markdownPath = join(deploymentsDir, `${summaryName}.md`);

  writeFileSync(markdownPath, buildMarkdown(deployment));
  console.log(`Wrote deployment summary: ${markdownPath}`);
}

main();
