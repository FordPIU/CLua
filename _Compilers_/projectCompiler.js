const fs = require("fs");
const path = require("path");
const fileCompiler = require("./fileCompiler");
const projectFilePath = "D:/Github/CLua/ExampleProject/ExampleProj.cluaprojx";

function writeToFile(code, filePath) {
  fs.writeFileSync(filePath, code);
}

function addCluaExtension(filename) {
  if (!path.extname(filename)) {
    return filename + ".clua";
  }
  return filename;
}

function readProjectFile(projectFilePath) {
  try {
    return fs.readFileSync(projectFilePath, "utf8");
  } catch (error) {
    console.error("Error reading project file:", error.message);
    return null;
  }
}

function getBuildIntoFromProjectFile(projectFileContent) {
  const lines = projectFileContent.split("\n");
  let buildIntoValue = null;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith("build_into")) {
      const parts = trimmedLine.split(" ");
      if (parts.length === 2) {
        buildIntoValue = parts[1].trim().replace(/"/g, "");
        break;
      }
    }
  }

  return buildIntoValue;
}

function processProjectFile(projectFileContent, projectDir) {
  let clientCode = "";
  let serverCode = "";
  let sharedCode = "";

  let inClient = false;
  let inServer = false;
  let inShared = false;

  const lines = projectFileContent.split("\n");

  for (const line of lines) {
    // Remove leading/trailing whitespace
    const trimmedLine = line.trim();

    // Check for section headers
    if (trimmedLine === "client") {
      inClient = true;
      inServer = false;
      inShared = false;
      continue;
    } else if (trimmedLine === "server") {
      inClient = false;
      inServer = true;
      inShared = false;
      continue;
    } else if (trimmedLine === "shared") {
      inClient = false;
      inServer = false;
      inShared = true;
      continue;
    }

    // Append the content of the file to the appropriate code string based on the current section
    if (inClient || inServer || inShared) {
      let filePath = addCluaExtension(trimmedLine);
      if (!path.isAbsolute(filePath)) {
        filePath = path.join(projectDir, filePath);
      }

      if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        continue;
      }

      const fileContent = fs.readFileSync(filePath, "utf8");
      if (inClient) {
        clientCode += fileContent + "\n";
      } else if (inServer) {
        serverCode += fileContent + "\n";
      } else if (inShared) {
        sharedCode += fileContent + "\n";
      }
    }
  }

  return { clientCode, serverCode, sharedCode };
}

function buildProject(buildFolder, clientCode, serverCode, sharedCode) {
  const projectPath = path.dirname(projectFilePath);
  const buildFilePath = path.join(projectPath, buildFolder);

  if (!fs.existsSync(buildFilePath)) {
    fs.mkdirSync(buildFilePath);
  }

  const luaClient = fileCompiler.convertCLuaToLua(clientCode);
  const luaServer = fileCompiler.convertCLuaToLua(serverCode);
  const luaShared = fileCompiler.convertCLuaToLua(sharedCode);

  writeToFile(luaClient, path.join(buildFilePath, "client.lua"));
  writeToFile(luaServer, path.join(buildFilePath, "server.lua"));
  writeToFile(luaShared, path.join(buildFilePath, "shared.lua"));
}

// Read the project file
const projectFileContent = readProjectFile(projectFilePath);
if (!projectFileContent) {
  process.exit(1);
}

// Get the project directory
const projectDir = path.dirname(projectFilePath);

// Call the function with the sample CLua Project File
const { clientCode, serverCode, sharedCode } = processProjectFile(
  projectFileContent,
  projectDir
);

// Get the build_into value
const buildIntoFolder = getBuildIntoFromProjectFile(projectFileContent);
buildProject(buildIntoFolder, clientCode, serverCode, sharedCode);
