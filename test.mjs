import { ProjectCompiler } from "./Compilers/projectCompiler.mjs";

// Set the project file path
const projectFilePath = "D:/Github/CLua/Tests/Test/ExampleProj.cluaprojx";

// Create a new instance of CLuaProjectCompiler
const compiler = new ProjectCompiler(projectFilePath);

// Parse & Build
compiler.parse();
compiler.build();
