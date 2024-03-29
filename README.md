<small>WARNING: This repo is experimental !</small>

> PAFE is a **password management** application.

## Features
- AES encryption
- Password management
- Browser addon for automatic login credentials auto-complete
- CSV file imports
- Cross-platform

<!-- ## Roadmap -->
<!-- 1. Add support for file encryption -->

## Availability
Cross-platform on the desktop, not available on mobile as of yet but eventually Pafe will be made available on the mobile platforms.

*PS: Install __NodeJS__, then clone this repo, type `npm install` in your terminal at the root directory, wait for node_modules to finish installing, type `npm run start` to launch the application*
<!-- ## Next -->

## About encryption
    PAFE encrypts using AES-256-GCM encryption algorithm, with a master key,
    which is derived from the PBKDF2 algorithm function and the master password.
<details>
<br/>
AES-256-GCM (Advanced Encryption Standard in Galois/Counter Mode)<br/>
Meaning the data is encrypted with a 256-bit key, generated for encryption using AES in GCM mode.
<br/><br/>
<a href="https://fr.wikipedia.org/wiki/PBKDF2">PBKDF2 (Password-Based Key Derivation Function 2)</a>
<br/><br/>
</details>

## About license
- **[MIT](https://github.com/sen0rxol0/pafe/blob/main/LICENCE)**
    - [ElectronJS](https://github.com/electron/electron) is licenced under the [MIT](https://github.com/electron/electron/blob/master/LICENSE)
    - [Yue](https://github.com/yue/yue) is licenced under the [LGPL v2.1](https://github.com/yue/yue/blob/master/LICENSE)
