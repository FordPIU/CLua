@echo off
setlocal
set "CLuaProjectFile=%~1"
node --experimental-modules D:/Github/CLua/_Compilers_/exposedLayer.mjs "%CLuaProjectFile%"
pause
endlocal
