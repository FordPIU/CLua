import fs from "fs";

/**
 * Reads and retrieves the contents of the file at the specified file path.
 * Returns file content as a string.
 *
 * @author Caleb B.
 * @since 0.5.0
 *
 * @param {string} filePath The absolute or relative path to the file.
 * @returns {string|null} The text content of the file, or null should an error occur in the reading of the file.
 */
export function readFile(filePath) {
  try {
    let fileString = fs.readFileSync(filePath, "utf-8");
    return fileString;
  } catch (error) {
    return;
  }
}

/**
 * Splits the string by spaces, into a array of words.
 * Will also filter out empty words.
 *
 * @author Caleb B.
 * @since 0.5.0
 * @deprecated This functionality has been deprecated and will be removed in a future version.
 * @see {@link splitWordsNotInString}
 *
 * @param {string} textString The string that will be split into words.
 * @returns {string|null} The array of words, or null should an error occur.
 */
export function splitWords(textString) {
  try {
    let textWords = textString
      .replaceAll("\n", " ")
      .split(" ")
      .filter((word) => word.trim() !== "");
    return textWords;
  } catch (error) {
    return;
  }
}

/**
 * Splits the string by spaces (That aren't within a string), into a array of words.
 * Will also filter out empty words.
 *
 * @author Caleb B.
 * @since 0.5.1
 *
 * Updated in 0.5.1 to not split words that are within strings.
 *
 * @param {string} textString The string that will be split into words.
 * @returns {string|null} The array of words, or null should an error occur.
 */
export function splitWordsNotInString(textString) {
  try {
    const wordRegex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
    const textWords = textString.match(wordRegex);

    if (textWords) {
      const filteredWords = textWords.filter(
        (word) => word && word.trim() !== ""
      );
      return filteredWords;
    }

    return;
  } catch (error) {
    return;
  }
}

/**
 * Removes both single-line and multi-line comments
 * safely from the string of text, without removing the comments from strings.
 *
 * @author Caleb B.
 * @since 0.5.0
 *
 * @param {string} text The string that will have comments removed from it.
 * @returns {string|null} The string with all comments removed, or null in the instance of an error.
 */
export function removeComments(text) {
  try {
    let noSingleLineComments = text.replace(
      /\/\/[^\n"']*(?=(?:(?:[^"]*"){2})*[^"]*$)/g,
      ""
    );
    let noMultiLineComments = noSingleLineComments.replace(
      /\/\*(?:(?!\*\/)[\s\S])*?\*\/(?=([^"]*"[^"]*")*[^"]*$)/g,
      ""
    );
    return noMultiLineComments;
  } catch (error) {
    return;
  }
}
