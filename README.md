## How to Setup Quick Build

- Press Win + R, type regedit, and press Enter to open the Windows Registry Editor.
- Navigate to HKEY_CLASSES_ROOT\.cluaprojx.
- If the .cluaprojx key doesn't exist, create it by right-clicking on the parent folder and selecting New > Key. Name it .cluaprojx.
- Create a subkey named Shell under .cluaprojx.
- Create a subkey named Build under Shell.
- Create a subkey named command under Build.
- Double-click the (Default) value in the command subkey and set its value data to:

```batch
path\to\build_dispatcher.bat "%1"
```

- Replace path\to\build_dispatcher.bat with the actual path to your batch script.
- Inside of build_dispatcher.bat, change

```js
D:/Github/CLua/_Compilers_/exposedLayer.mjs
```

- to where you have exposedLayer.mjs
