const fs = require("fs");
const path = require("path");
const { convertCLuaToLua } = require("./fileCompiler");

class CLuaProjectCompiler {
  constructor(projectFilePath) {
    this.projectFilePath = projectFilePath;
    this.projectDir = path.dirname(projectFilePath);
  }

  readProjectFile() {
    try {
      return fs.readFileSync(this.projectFilePath, "utf8");
    } catch (error) {
      console.error("Error reading project file:", error.message);
      return null;
    }
  }

  addCluaExtension(filename) {
    if (!path.extname(filename)) {
      return filename + ".clua";
    }
    return filename;
  }

  getBuildIntoFromProjectFile(projectFileContent) {
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

  generateFxManifest(buildFilePath, name, version, description) {
    const fxmanifestContent = `fx_version 'cerulean'
games { 'gta5' }
author 'Caleb B. (calebb.) (calebsrealism@gmail.com)'
description '${description}'
version '${version}'
lua54 'yes'

client_script 'client.lua'
server_script 'server.lua'
shared_script 'shared.lua'`;

    fs.writeFileSync(
      path.join(buildFilePath, "fxmanifest.lua"),
      fxmanifestContent
    );
  }

  processProjectFile(projectFileContent) {
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
        let filePath = this.addCluaExtension(trimmedLine);
        if (!path.isAbsolute(filePath)) {
          filePath = path.join(this.projectDir, filePath);
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

  buildProject() {
    const projectFileContent = this.readProjectFile();
    if (!projectFileContent) {
      console.error("Error: Project file not found or invalid.");
      return;
    }

    const { name, version, description } =
      this.getProjectInfo(projectFileContent);

    const { clientCode, serverCode, sharedCode } =
      this.processProjectFile(projectFileContent);

    const buildIntoFolder =
      this.getBuildIntoFromProjectFile(projectFileContent);
    const buildFilePath = path.join(this.projectDir, buildIntoFolder);

    if (!fs.existsSync(buildFilePath)) {
      fs.mkdirSync(buildFilePath);
    }

    const luaClient = convertCLuaToLua(clientCode);
    const luaServer = convertCLuaToLua(serverCode);
    const luaShared = convertCLuaToLua(sharedCode);

    this.generateFxManifest(buildFilePath, name, version, description);
    this.writeToFile(luaClient, path.join(buildFilePath, "client.lua"));
    this.writeToFile(luaServer, path.join(buildFilePath, "server.lua"));
    this.writeToFile(luaShared, path.join(buildFilePath, "shared.lua"));

    console.log("CLua project has been successfully built into Lua!");
  }

  writeToFile(code, filePath) {
    fs.writeFileSync(filePath, code);
  }

  getProjectInfo(projectFileContent) {
    const lines = projectFileContent.split("\n");
    let name = "";
    let version = "";
    let description = "";

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith("name")) {
        name = trimmedLine.split('"')[1];
      } else if (trimmedLine.startsWith("version")) {
        version = trimmedLine.split('"')[1];
      } else if (trimmedLine.startsWith("description")) {
        description = trimmedLine.split('"')[1];
      }
    }

    return { name, version, description };
  }
}

module.exports = CLuaProjectCompiler;
