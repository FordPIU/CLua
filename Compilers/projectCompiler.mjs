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

import assert from "assert";
import { readFile, removeComments, splitWordsNotInString } from "./utils.mjs";

const SectionMappings = {
  "metadata:": "metadata",
  "features:": "features",
  "extensions:": "extensions",
  "environment:": "environment",
  "assets:": "assets",
  "clientFiles:": "clientFiles",
  "serverFiles:": "serverFiles",
  "sharedFiles:": "sharedFiles",
};

/* 
  Next Generation of Project Compiler is going to use a Line by Line & Regex processor.
  Note to self: good idea to add custom error handler. Assert kinda sucks.
*/

/**
 * Reads and retrieves the contents of a project file located at the specified file path.
 * Returns the project file content in the UTF-8 encoding, as a string.
 *
 * @author Caleb B.
 * @private
 * @since 0.5.0
 *
 * @param {string} filePath The absolute or relative path to the project file, including the file extension.
 * @returns {string} The UTF-8 encoded text content of the project file, which can be further processed or analyzed.
 * @throws {Error} If the project file cannot be read, or does not exist.
 */
function getProjectFileText(filePath) {
  let fileText = readFile(filePath);

  if (fileText == null) {
    assert.fail(
      `Project File at ${filePath} does not exist, or is not readable.`
    );
  }

  return fileText;
}

/**
 * Process' the raw project file text.
 * This currently only removes the comments from the project file text, so the comments don't get processed.
 *
 * @author Caleb B.
 * @private
 * @since 0.5.0
 *
 * @see {@link getProjectFileText}
 *
 * @param {string} rawProjectFileText The Raw Project File Text, fetched from projectFileText().
 * @returns {string} The processed project file text.
 * @throws {Error} If an error is encountered while processing the file.
 */
function processProjectFileText(rawProjectFileText) {
  let commentsRemoved = removeComments(rawProjectFileText);

  if (commentsRemoved == null) {
    assert.fail(
      `Project File encountered an error while the removing comments.`
    );
  }

  return commentsRemoved;
}

/**
 * Tokenize's the project file, returning a array of token's.
 *
 * @author Caleb B.
 * @private
 * @since 0.5.0
 *
 * @deprecated
 * @see {@link processProjectFileText}
 *
 * @param {string} projectFileText The processed project file text to tokenize.
 * @returns {array} The array of tokens of the project file.
 * @throws {Error} If a error is encountered while tokenizing the project file.
 */
function getProjectFileWords(projectFileText) {
  let words = splitWordsNotInString(projectFileText);

  if (words == null) {
    assert.fail(`Project File encountered an error while tokenizing.`);
  }

  return words;
}

/**
 * Parses the projects tokens.
 *
 * @author Caleb B.
 * @private
 * @since 0.5.2
 *
 * @deprecated
 * @see {@link getProjectFileWords}
 *
 * @param {array} projectTokens The tokens of the project file in a array.
 * @returns {array} The Project Data in a array.
 */
function parseProjectTokens(projectTokens) {
  let projectData = {
    name: "",
    version: "",
    desc: "",
    buildFolder: "",
    plugins: [],
    features: {
      disabled: [],
    },
  };
  let currentSection = null;

  for (let i = 0; i < projectTokens.length; i++) {
    const currentToken = projectTokens[i];
    const nextToken = i < projectTokens.length - 1 ? projectTokens[i + 1] : "";

    // Plugin Definition
    if (currentToken[0] == "!") {
      let token = currentToken.slice(1);
      projectData.plugins.push(token);
      continue;
    }

    // Project Name
    if (currentToken == "name:") {
      let tokenMatch = nextToken.match(/"([^"]+)"/);

      if (tokenMatch) {
        projectData.name = tokenMatch[1];
      } else {
        assert.fail("None or Invalid Project Name.");
      }

      i++;
      continue;
    }

    // Project Version
    if (currentToken == "version:") {
      let definedTokenMatch = nextToken.match(/"([^"]+)"/);
      let pluginTokenMatch = nextToken.match(/@(\w+)/);

      if (definedTokenMatch || pluginTokenMatch) {
        // Defined Version
        if (definedTokenMatch) {
          projectData.version = definedTokenMatch[1];
        } else {
          // Plugin Version
          projectData.version = "PLUGIN_RETURN_" + pluginTokenMatch[1];
        }
      } else {
        assert.fail("None or Invalid Project Name.");
      }

      i++;
      continue;
    }

    // Project Description
    if (currentToken == "description:") {
      let tokenMatch = nextToken.match(/"([^"]+)"/);

      if (tokenMatch) {
        projectData.desc = tokenMatch[1];
      } else {
        assert.fail(
          "None or Invalid Project Description, but Description is defined."
        );
      }

      i++;
      continue;
    }

    // Project Build Folder
    if (currentToken == "buildInto:") {
      let tokenMatch = nextToken.match(/"([^"]+)"/);

      if (tokenMatch) {
        projectData.buildFolder = tokenMatch[1];
      } else {
        assert.fail("None or Invalid Build Folder.");
      }

      i++;
      continue;
    }

    // Disabled CLua Features
    if (currentToken == "disable:") {
    }
  }

  return projectData;
}

/**
 * Parses the project file.
 *
 * @author Caleb B.
 * @private
 * @since 0.5.2
 *
 * @see {@link processProjectFileText}
 *
 * @param {string} projectTokens The string of the text file.
 * @returns {array} The Project Data in a array.
 */
function parseProjectFile(projectText) {
  const projectLines = projectText.split("\n");
  let projectData = {
    metadata: {
      name: "",
      version: "",
      desc: "",
      buildFolder: "",
    },
    plugins: [],
    features: {
      disabled: [],
    },
  };
  let currentSection = null;

  for (let i = 0; i < projectLines.length; i++) {
    const currentLine = projectLines[i];
    const currentSpaceCount = currentLine.match(/^\s*/)[0].length;
    const currentFirstWord = (currentLine.split(/^([^:]+)/)[1] || "").trim();

    if (currentSpaceCount == 0) {
      const sectionKey = SectionMappings[currentLine.trim()];

      if (sectionKey) {
        currentSection = sectionKey;
      } else {
        currentSection = null;

        // Plugin Definition
        if (currentLine[0] == "!") {
          let token = currentLine.slice(1).trim();
          projectData.plugins.push(token);
        }
      }

      continue;
    }

    if (currentSection == "metadata") {
      // Project Name
      if (currentFirstWord == "name") {
        let tokenMatch = currentLine.match(/"([^"]+)"/);

        if (tokenMatch) {
          projectData.metadata.name = tokenMatch[1];
        } else {
          assert.fail("None or Invalid Project Name.");
        }

        continue;
      }

      // Project Version
      if (currentFirstWord == "version") {
        let definedTokenMatch = currentLine.match(/"([^"]+)"/);
        let pluginTokenMatch = currentLine.match(/@(\w+)/);

        if (definedTokenMatch || pluginTokenMatch) {
          // Defined Version
          if (definedTokenMatch) {
            projectData.metadata.version = definedTokenMatch[1];
          } else {
            // Plugin Version
            projectData.metadata.version =
              "PLUGIN_RETURN_" + pluginTokenMatch[1];
          }
        } else {
          assert.fail("None or Invalid Project Name.");
        }

        continue;
      }

      // Project Description
      if (currentFirstWord == "description") {
        let tokenMatch = currentLine.match(/"([^"]+)"/);

        if (tokenMatch) {
          projectData.metadata.desc = tokenMatch[1];
        } else {
          assert.fail(
            "None or Invalid Project Description, but Description is defined."
          );
        }

        continue;
      }

      // Project Build Folder
      if (currentFirstWord == "buildInto") {
        let tokenMatch = currentLine.match(/"([^"]+)"/);

        if (tokenMatch) {
          projectData.metadata.buildFolder = tokenMatch[1];
        } else {
          assert.fail("None or Invalid Build Folder.");
        }

        continue;
      }
    }

    if (currentSection == "features") {
      // Disabled CLua Features
      if (currentFirstWord == "disable") {
      }
    }
  }

  return projectData;
}

export function CompileProjectFile(filePath) {
  let rawProjectFileText = getProjectFileText(filePath);
  let projectFileText = processProjectFileText(rawProjectFileText);
  let projectData = parseProjectFile(projectFileText);
  // let projectFileWords = getProjectFileWords(projectFileText);
  // let projectData = parseProjectTokens(projectFileWords);

  console.log(projectData);
}
