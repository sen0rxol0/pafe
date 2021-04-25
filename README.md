# PAFE - PRIVATE SAFE
This app is targeted for anything that needs password encryption.

MOTO: One password to rule them all.
State: early BETA 

## About encryption
PAFE encrypts using AES-256-GCM algorithm with a master key,
which is derived using PBKDF2 algorithm from the master password.

## About setup
Install node dependencies (using either `yarn` or `npm`):
The development files are under the `src` directory, `main.js` is the project entrypoint.

## Thanks
Thanks to [ElectronJS](https://github.com/electron/electron) and [Yue](https://github.com/yue/yue)

## About license
- [MIT]()
- Electron is licenced under [MIT](https://github.com/electron/electron/blob/master/LICENSE)
- Yue is licenced under [LGPL v2.1](https://github.com/yue/yue/blob/master/LICENSE)
