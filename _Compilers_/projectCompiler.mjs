/*
  ╔════════════════════════════════════╗
  ║   CONFIDENTIAL & COPYRIGHTED CODE  ║
  ╟────────────────────────────────────╢
  ║ This code is confidential and      ║
  ║ protected by copyright. Viewing    ║
  ║ or accessing this code without a   ║
  ║ proper Non-Disclosure Agreement    ║
  ║ (NDA) is strictly prohibited.      ║
  ╚════════════════════════════════════╝
*/

import { error } from "console";
import fs from "fs";
import path from "path";
import { convertCLuaToLua } from "./fileCompiler.mjs";
import { removeComments } from "./utils.mjs";

export class ProjectCompiler {
  projectFileText;
  projectFileLines;
  parsedProjectFile;
  projectFilePath;

  constructor(filePath) {
    // Check that the file path exists
    if (!fs.existsSync(filePath)) {
      console.error("Invalid File Path!");
    }

    // Read file from path
    this.projectFileText = fs.readFileSync(filePath, "utf-8") + "\n\n__EOFL__";

    // Remove Comments
    this.projectFileText = removeComments(this.projectFileText);

    // Set Lines
    this.projectFileLines = this.projectFileText.split("\n");

    // Set Path
    this.projectFilePath = filePath;
  }

  /**
   * Build the Project!
   */
  build() {
    // FX Manifest Generation
    let luaScriptFiles = {
      client: [],
      server: [],
      shared: [],
    };
    let fxmanifestContent = `fx_version 'cerulean'
games { 'gta5' }
author 'Caleb B. (@calebb.) (calebsrealism@gmail.com)'
description '${this.parsedProjectFile.metadata.desc}'
version '${this.parsedProjectFile.metadata.version}'
lua54 'yes'

__CLIENT__
__SERVER__
__SHARED__`;

    // Build the luaScriptFiles arrays
    for (const section in this.parsedProjectFile.files) {
      for (const fileName in this.parsedProjectFile.files[section]) {
        const luaFileName =
          this.parsedProjectFile.files[section][fileName] + ".lua";

        if (!luaScriptFiles[section].includes(luaFileName)) {
          luaScriptFiles[section].push(luaFileName);
        }
      }
    }

    // Inject/replace the data into fxmanifestContent
    for (const section in luaScriptFiles) {
      const fileList = luaScriptFiles[section];
      const fileListString = fileList.join(",\n  ");
      fxmanifestContent = fxmanifestContent.replace(
        `__${section.toUpperCase()}__`,
        `${section.toLowerCase()}_scripts {
  ${fileListString}
}`
      );
    }

    // Build the Files
    let builtFiles = [];
    for (const section in this.parsedProjectFile.files) {
      for (const [cFileName, nFileName] of Object.entries(
        this.parsedProjectFile.files[section]
      )) {
        // File Path
        let filePath;
        if (!path.isAbsolute(cFileName)) {
          filePath = path.join(path.dirname(this.projectFilePath), cFileName);
        } else {
          filePath = cFileName;
        }

        // File Extension
        if (!path.extname(filePath)) {
          filePath += ".clua";
        }

        // Ensure file exists
        if (!fs.existsSync(filePath)) {
          console.error(`File not found: ${filePath}`);
        }

        // Read the File
        let cLuaFile = fs.readFileSync(filePath, "utf-8");

        // Ensure built Files [ File Name ]
        if (!builtFiles[nFileName]) {
          builtFiles[nFileName] = "";
        }

        // Write
        builtFiles[nFileName] +=
          convertCLuaToLua(cLuaFile, this.parsedProjectFile.feature_kill) +
          "\n";
      }
    }

    for (const [fileName, fileContent] of Object.entries(builtFiles)) {
      // File Path
      let filePath;
      if (!path.isAbsolute(fileName)) {
        filePath = path.join(
          path.dirname(this.projectFilePath) +
            "/" +
            (this.parsedProjectFile.metadata.build_into || "build"),
          fileName + ".lua"
        );
      } else {
        filePath = fileName;
      }

      // Ensure folder exists
      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath));
      }

      // Write File
      fs.writeFileSync(filePath, fileContent, "utf-8");
    }

    // Write Manifest
    fs.writeFileSync(
      path.join(
        path.dirname(this.projectFilePath) +
          "/" +
          (this.parsedProjectFile.metadata.build_into || "build") +
          "/fxmanifest.lua"
      ),
      fxmanifestContent,
      "utf-8"
    );
  }

  /**
   * Parse the Project Text into arrays.
   */
  parse() {
    // Build the Structure
    this.parsedProjectFile = {};
    this.parsedProjectFile["metadata"] = {};
    this.parsedProjectFile["feature_kill"] = {};
    this.parsedProjectFile["plugins"] = {};
    this.parsedProjectFile["imports"] = {};
    this.parsedProjectFile["env_vars"] = {};
    this.parsedProjectFile["files"] = {};
    this.parsedProjectFile["files"]["client"] = {};
    this.parsedProjectFile["files"]["server"] = {};
    this.parsedProjectFile["files"]["shared"] = {};

    // Project Metadata
    this.parsedProjectFile.metadata["name"] = this.getNonArrayData("name");
    this.parsedProjectFile.metadata["version"] =
      this.getNonArrayData("version");
    this.parsedProjectFile.metadata["desc"] =
      this.getNonArrayData("description");
    this.parsedProjectFile.metadata["build_folder"] =
      this.getNonArrayData("build_into");

    // Feature Kill
    this.parsedProjectFile.feature_kill =
      this.getSimpleArrayData("disable_clua_features") || [];

    // Plugins
    this.parsedProjectFile.plugins = this.getSimpleArrayData("plugins") || {};

    // Imports
    this.parsedProjectFile.imports = this.getSimpleArrayData("imports") || {};

    // Environmental Variables
    this.parsedProjectFile.env_vars =
      this.getSimpleArrayDataWithValue("env") || {};

    // Assets
    // TODO: Modify all data in assets to file paths for quick access
    this.parsedProjectFile.assets = this.getSimpleArrayData("assets") || {};

    // Files
    this.parsedProjectFile.files.client =
      this.getSimpleArrayFileData("client") || {};
    this.parsedProjectFile.files.server =
      this.getSimpleArrayFileData("server") || {};
    this.parsedProjectFile.files.shared =
      this.getSimpleArrayFileData("shared") || {};
  }

  /**
   * Get a array of simple non-array data from the project file.
   * Used for:
   * build: "buildFolder"
   * @param {string} varName
   * @returns {string} variable Data
   */
  getNonArrayData(varName) {
    for (const line of this.projectFileLines) {
      let trimmedLine = line.trim();

      if (trimmedLine.startsWith(varName)) {
        let parts = trimmedLine.split(/ (?=(?:(?:[^"]*"){2})*[^"]*$)/g);

        if (parts.length === 2) {
          return parts[1].trim().replace(/"/g, "");
        }
      }
    }

    return null;
  }

  /**
   * Get array of simple array data from the project file.
   * Used for:
   * imports
   *    importA
   *    importB
   * @param {string} headerName
   * @returns {Array} Data from the Array
   */
  getSimpleArrayData(headerName) {
    let inArray = false;
    let data = [];

    for (const line of this.projectFileLines) {
      if (!inArray) {
        // In Array Check
        if (line.trim() == headerName) {
          inArray = true;
        }
      } else {
        // Out of Array Check
        let numOfWhitespace = line.match(/^\s*/)[0].length;

        if (numOfWhitespace == 0) {
          return data;
        } else {
          let lineToPush = line.trim().replace(/"/g, "");

          if (lineToPush.length > 1) {
            data.push(lineToPush);
          }
        }
      }
    }

    return null;
  }

  /**
   * Get array of simple array data from the project file.
   * Used for:
   * env
   *    bool1 = true
   *    int5 = 250
   * @param {string} headerName
   * @returns {Array} Data from the Array
   */
  getSimpleArrayDataWithValue(headerName) {
    let inArray = false;
    let data = {};

    for (const line of this.projectFileLines) {
      if (!inArray) {
        // In Array Check
        if (line.trim() == headerName) {
          inArray = true;
        }
      } else {
        // Out of Array Check
        let numOfWhitespace = line.match(/^\s*/)[0].length;

        if (numOfWhitespace == 0) {
          return data;
        } else {
          let lineToPush = line.trim().replace(/"/g, "");

          if (lineToPush.length > 1) {
            let lineSplit = lineToPush.split("=");
            data[lineSplit[0]] = lineSplit[1] || null;
          }
        }
      }
    }

    return null;
  }

  getSimpleArrayFileData(fileTypeName) {
    let inArray = false;
    let data = {};

    for (const line of this.projectFileLines) {
      if (!inArray) {
        // In Array Check
        if (line.trim() == fileTypeName) {
          inArray = true;
        }
      } else {
        // Out of Array Check
        let numOfWhitespace = line.match(/^\s*/)[0].length;

        if (numOfWhitespace == 0) {
          return data;
        } else {
          let lineToPush = line.trim().replace(/"/g, "");

          if (lineToPush.length > 1) {
            let lineSplit = lineToPush.split("to");
            data[lineSplit[0].trim()] = (lineSplit[1] || fileTypeName).trim();
          }
        }
      }
    }

    return null;
  }
}