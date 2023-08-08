# Project Metamorph

## Apart of Project Phoenix

### Overview

This project contains confidential and proprietary information that is protected by copyright law. It is intended for authorized personnel only. If you have not signed a Non-Disclosure Agreement (NDA) with the project owner (Caleb Brodock), you are not permitted to access or view the contents of this project.

### Project Description

**Confidential Project** is a highly sensitive software development project. It involves the development of advanced algorithms and cutting-edge technologies. The project aims to revolutionize the modding community as a whole and is expected to remain confidential indefinitely.

### Confidentiality Agreement

All individuals who have been granted access to this project are bound by a strict Non-Disclosure Agreement (NDA). By accessing this project, you agree to abide by the terms and conditions of the NDA, which prohibits the disclosure, distribution, or reproduction of any part of this project without prior written consent from the project owner (Caleb Brodock).

### Viewing Instructions

To view the code and related materials in this project, follow these steps:

1. Sign the provided Non-Disclosure Agreement (NDA) with the project owner (Caleb Brodock).
2. Obtain permission from the project owner (Caleb Brodock) to access this repository.

### Disclaimer

This project is provided "as is" without any warranty, express or implied. The project owner (Caleb Brodock) and contributors shall not be held liable for any direct, indirect, incidental, or consequential damages arising out of the use of this project.

### Contact Information

For inquiries or to request access to this project, please contact:

- Name: Caleb Brodock
- Email: calebsrealism@gmail.com
- Phone: Provided via Email on a per request basis.

---

By accessing this project, you acknowledge that you have read and understood the confidentiality and copyright information outlined above. Unauthorized access or disclosure of the contents of this project may result in legal action and other penalties.

## How to Setup Quick Build

1. Press Win + R, type `regedit`, and press Enter to open the Windows Registry Editor.
2. Navigate to `HKEY_CLASSES_ROOT\.cluaprojx`.
3. If the `.cluaprojx` key doesn't exist, create it by right-clicking on the parent folder, selecting New > Key, and naming it `.cluaprojx`.
4. Create subkeys named `Shell` under `.cluaprojx` and `Build` under `Shell`.
5. Create a subkey named `command` under `Build`.
6. Double-click the `(Default)` value in the `command` subkey and set its value data to:

```batch
path\to\build_dispatcher.bat "%1"
```

7. Replace path\to\build_dispatcher.bat with the actual path to your batch script.
8. Modify build_dispatcher.bat to include the correct path to exposedLayer.mjs.

## Todo

### Implement Plugins

Still need to find a way for the compiler to locate the actual file for the plugin

Basics are that the compiler will locate the file for the plugin, and execute a "main" function, passing the current
file string as a parameter, and that plugin returning the modified file string.

Plugins are still for injecting code into the compiler, and not the project itself, to modify the compilers behavior.

### Implement Imports

Still need to find a way for the compiler to locate the actual file for the import

Probably gonna do the same implementation here as I did for the environmental variables.
Combine all "import" files, into 1 master file, and just put it in the project build, rather than combining it into a clua file.

### Implement Assets

This is the easiest of the 3.

For Files:
Just simply inject it into the fxmanifest, under "files". In the future, may add "DATA_FILE" support, but right now this works.

For Folders:
Little bit harder, search into every single folder, locate EVERY file, and inject all of them into the fxmanifest under "files".
