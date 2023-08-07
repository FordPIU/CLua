const CLuaProjectCompiler = require("./projectCompiler");

// Get the absolute path of the project file
const projectFilePath = "D:/Github/CLua/ExampleProject/ExampleProj.cluaprojx";

// Create a new instance of CLuaProjectCompiler
const compiler = new CLuaProjectCompiler(projectFilePath);

// Build the project into Lua
compiler.buildProject();
