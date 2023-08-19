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

import { readFile, removeComments, splitWords } from "./utils.mjs";

/* 
  Next Generation of Project Compiler is going to use a Line by Line & Regex processor.
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
    throw new Error(
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
    throw new Error(
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
 * @see {@link processProjectFileText}
 *
 * @param {string} projectFileText The processed project file text to tokenize.
 * @returns {array} The array of tokens of the project file.
 * @throws {Error} If a error is encountered while tokenizing the project file.
 */
function getProjectFileWords(projectFileText) {
  let words = splitWords(projectFileText);

  if (words == null) {
    throw new Error(`Project File encountered an error while tokenizing.`);
  }

  return words;
}

export function CompileProjectFile(filePath) {
  let rawProjectFileText = getProjectFileText(filePath);
  let projectFileText = processProjectFileText(rawProjectFileText);
  let projectFileWords = getProjectFileWords(projectFileText);

  projectFileWords.forEach((word) => {
    console.log(word);
  });
}
