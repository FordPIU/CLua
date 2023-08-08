// execute using "node --experimental-modules _Compilers_/tester.mjs"

import { ProjectCompiler } from "./projectCompiler.mjs";

// Get the project file path from the command-line arguments
const projectFilePath = process.argv[2];

// Create a new instance of CLuaProjectCompiler
const compiler = new ProjectCompiler(projectFilePath);

// Parse & Build
compiler.parse();
compiler.build();