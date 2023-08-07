// execute using "node --experimental-modules _Compilers_/tester.mjs"

import { ProjectCompiler } from "./projectCompiler.mjs";

// Get the absolute path of the project file
const projectFilePath = "D:/Github/CLua/DummyExamples/ExampleProj.cluaprojx";

// Create a new instance of CLuaProjectCompiler
const compiler = new ProjectCompiler(projectFilePath);

// test
compiler.parse();
compiler.build();

// Build the project into Lua
//compiler.buildProject();
