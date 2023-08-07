export function removeComments(text) {
  // Remove Single-Line Comments
  text = text.replace(/\/\/.*$/gm, "");

  // Remove Multi-Line Comments
  text = text.replace(/\/\*[\s\S]*?\*\//g, "");

  return text;
}
