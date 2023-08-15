import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const quirkyMessages = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data/quirkyTimes.json"), "utf8")
);

export function removeComments(text) {
  // Remove Single-Line Comments
  text = text.replace(/\/\/.*$/gm, "");

  // Remove Multi-Line Comments
  text = text.replace(/\/\*[\s\S]*?\*\//g, "");

  return text;
}

export function getRandomBuildPrint(msTime) {
  let messageGroup;
  if (msTime < 1000) messageGroup = "less than 1 second";
  else if (msTime < 2000) messageGroup = "1-2 seconds";
  else if (msTime < 5000) messageGroup = "2-5 seconds";
  else if (msTime < 10000) messageGroup = "5-10 seconds";
  else if (msTime < 20000) messageGroup = "10-20 seconds";
  else if (msTime < 30000) messageGroup = "20-30 seconds";
  else if (msTime < 60000) messageGroup = "30-60 seconds";
  else if (msTime < 120000) messageGroup = "1-2 minutes";
  else if (msTime < 300000) messageGroup = "2-5 minutes";
  else messageGroup = "more than 5 minutes";

  const randomIndex = Math.floor(
    Math.random() * quirkyMessages[messageGroup].length
  );
  return quirkyMessages[messageGroup][randomIndex];
}

export function formatMemorySize(memorySizeInBytes) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = memorySizeInBytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return `${value.toFixed(2)} ${units[unitIndex]}`;
}
