@echo off
setlocal
set "CLuaProjectFile=%~1"
node --experimental-modules D:/Github/CLua/exposedLayer.mjs "%CLuaProjectFile%"
pause
endlocal
