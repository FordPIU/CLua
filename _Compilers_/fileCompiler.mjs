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

function addParenthesesToPrint(cluaCode) {
  const lines = cluaCode.split("\n");
  let insideString = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    let updatedLine = "";
    let insidePrint = false;
    let numOfParentheses = 0;

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
        numOfParentheses++;
      }

      if (!insideString && char === ")" && insidePrint) {
        if (numOfParentheses > 0) {
          numOfParentheses--;
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

export function convertCLuaToLua(cluaCode, disabledFeatures) {
  // Local and Global Function Definitions
  if (!disabledFeatures.includes("funct")) {
    cluaCode = cluaCode.replace(/\blfunct\b/g, "local function");
    cluaCode = cluaCode.replace(/\bfunct\b/g, "function");
  }

  // Local and Global Variable Definitions
  if (!disabledFeatures.includes("var")) {
    cluaCode = cluaCode.replace(/\bgvar\s+(\w+)\s+([^=\n\s]+)/g, "$1 = $2");
    cluaCode = cluaCode.replace(
      /\bvar\s+(\w+)\s+([^=\n\s]+)/g,
      "local $1 = $2"
    );
    cluaCode = cluaCode.replace(
      /\bvar\s+(\w+)\s+(= +)([^=\n\s]+)/g,
      "local $1 = $3"
    );
  }

  // Special String Concat Operators
  if (!disabledFeatures.includes("strconcat")) {
    cluaCode = cluaCode.replace(/:\.\./g, '.. ": " ..');
  }

  // Comments
  if (!disabledFeatures.includes("ccomments")) {
    cluaCode = cluaCode.replace(/\/\/.*$/gm, "");
    cluaCode = cluaCode.replace(/\/\*[\s\S]*?\*\//g, "");
  }

  // Automated Fors
  if (!disabledFeatures.includes("autofors")) {
    cluaCode = cluaCode.replace(/for to (\d+)/g, "for i = 1, $1 do");
    cluaCode = cluaCode.replace(/for (\w+) to (\d+)/g, "for $1 = 1, $2 do");
    cluaCode = cluaCode.replace(/for pairs (\w+)/g, "for i, v in pairs($1) do");
    cluaCode = cluaCode.replace(
      /for (\w+), (\w+) pairs (\w+)/g,
      "for $1, $2 in pairs($3) do"
    );
  }

  // MATH= C Operators (for returns)
  if (!disabledFeatures.includes("cmathops")) {
    cluaCode = cluaCode.replace(
      /return\s+(\w+)\s*\+=\s*(\w+)(?!\s*;)/g,
      "return $1 + $2"
    );
    cluaCode = cluaCode.replace(
      /return\s+(\w+)\s*\-=\s*(\w+)(?!\s*;)/g,
      "return $1 - $2"
    );
    cluaCode = cluaCode.replace(
      /return\s+(\w+)\s*\*=\s*(\w+)(?!\s*;)/g,
      "return $1 * $2"
    );
    cluaCode = cluaCode.replace(
      /return\s+(\w+)\s*\/=\s*(\w+)(?!\s*;)/g,
      "return $1 / $2"
    );

    // MATH= C Operators (for non-returns)
    cluaCode = cluaCode.replace(/(\w+)\s*\+=\s*(\w+)(?!\s*;)/g, "$1 = $1 + $2");
    cluaCode = cluaCode.replace(/(\w+)\s*\-=\s*(\w+)(?!\s*;)/g, "$1 = $1 - $2");
    cluaCode = cluaCode.replace(/(\w+)\s*\*=\s*(\w+)(?!\s*;)/g, "$1 = $1 * $2");
    cluaCode = cluaCode.replace(/(\w+)\s*\/=\s*(\w+)(?!\s*;)/g, "$1 = $1 / $2");

    // Dementors
    cluaCode = cluaCode.replace(/(\w+)\+\+(?=;|\s)/g, "$1 + 1");
    cluaCode = cluaCode.replace(/(\w+)--(?=;|\s)/g, "$1 - 1");
    cluaCode = cluaCode.replace(/(\w+)\*\*(?=;|\s)/g, "$1 * 2");
  }

  // Line Smash
  cluaCode = cluaCode.replace(/\n\s*\n/g, "\n");

  // Print Fix
  if (!disabledFeatures.includes("npprint")) {
    cluaCode = addParenthesesToPrint(cluaCode);
  }

  // Plugins!

  return cluaCode;
}
