/// ADD THE PARENTHESES TO PRINTS ///
function addParenthesesToPrint(cluaCode) {
  const lines = cluaCode.split("\n");
  let insideString = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    let updatedLine = "";
    let insidePrint = false;
    let numOfParentese = 0;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];

      if (!insideString && line.slice(j, j + 5) === "print") {
        updatedLine += "print(";
        insidePrint = true;
        j += 4;
      } else {
        updatedLine += char;
      }

      if (!insideString && char === "(" && insidePrint) {
        numOfParentese++;
      }

      if (!insideString && char === ")" && insidePrint) {
        if (numOfParentese > 0) {
          numOfParentese--;
        } else {
          insidePrint = false;
        }
      }
    }

    if (insidePrint) {
      updatedLine = updatedLine.trimRight() + ")";
    }

    lines[i] = updatedLine;
  }

  return lines.join("\n");
}

/// MAIN FUNCTION ///
function convertCLuaToLua(cluaCode) {
  // Replace "lfunct" with "local function"
  cluaCode = cluaCode.replace(/\blfunct\b/g, "local function");

  // Replace "funct" with "function"
  cluaCode = cluaCode.replace(/\bfunct\b/g, "function");

  // Convert "gvar x 5" to "x = 5" for global variable declaration
  cluaCode = cluaCode.replace(/\bgvar\s+(\w+)\s+([^=\n\s]+)/g, "$1 = $2");

  // Convert "var x 5" to "local x = 5" for local variable declaration
  cluaCode = cluaCode.replace(/\bvar\s+(\w+)\s+([^=\n\s]+)/g, "local $1 = $2");

  // Convert custom concats (":+" and "+") to Lua concatenation
  cluaCode = cluaCode.replace(/:\.\./g, '.. ": " ..'); // Replace ":+" with ".. ": " .."

  // Remove single-line comments (//)
  cluaCode = cluaCode.replace(/\/\/.*$/gm, "");

  // Remove multi-line comments (/* */)
  cluaCode = cluaCode.replace(/\/\*[\s\S]*?\*\//g, "");

  // Convert "for to 5" to "for i = 1, 5 do"
  cluaCode = cluaCode.replace(/for to (\d+)/g, "for i = 1, $1 do");

  // Convert "for k to 5" to "for k = 1, 5 do"
  cluaCode = cluaCode.replace(/for (\w+) to (\d+)/g, "for $1 = 1, $2 do");

  // Convert "for pairs someTable" to "for k, v in pairs(someTable) do"
  cluaCode = cluaCode.replace(/for pairs (\w+)/g, "for i, v in pairs($1) do");

  // Convert "for k, v pairs someTable" to "for k, v in pairs(someTable) do"
  cluaCode = cluaCode.replace(
    /for (\w+), (\w+) pairs (\w+)/g,
    "for $1, $2 in pairs($3) do"
  );

  // Convert modern math operators (+=, -=, *=, /=) to their Lua equivalent expressions
  cluaCode = cluaCode.replace(/(\w+)\s*\+=\s*(\w+)/g, "$1 = $1 + $2");
  cluaCode = cluaCode.replace(/(\w+)\s*\-=\s*(\w+)/g, "$1 = $1 - $2");
  cluaCode = cluaCode.replace(/(\w+)\s*\*=\s*(\w+)/g, "$1 = $1 * $2");
  cluaCode = cluaCode.replace(/(\w+)\s*\/=\s*(\w+)/g, "$1 = $1 / $2");

  // Convert "++" to Lua equivalent expressions
  cluaCode = cluaCode.replace(/(\w+)\s*\+\+/g, "$1 = $1 + 1");

  // Convert "--" to Lua equivalent expressions
  cluaCode = cluaCode.replace(/(\w+)\s*--/g, "$1 = $1 - 1");

  // Remove unneeded line breaks
  cluaCode = cluaCode.replace(/\n\s*\n/g, "\n");

  // Add parentheses to print statements with standard Lua concatenation (..)
  cluaCode = addParenthesesToPrint(cluaCode);

  return cluaCode;
}

// test
const fs = require("fs");
fs.readFile("./example.clua", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading CLua file:", err);
  } else {
    // Convert CLua to Lua
    const luaCode = convertCLuaToLua(data);

    // Write Lua file
    fs.writeFile("./example.lua", luaCode, (err) => {
      if (err) {
        console.error("Error writing Lua file:", err);
      } else {
        console.log("Conversion successful!");
      }
    });
  }
});
