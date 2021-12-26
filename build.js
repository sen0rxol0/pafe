#!/usr/bin/env node

// Copyright 2021 BAIELFOW. All rights reserved.
// Please see the LICENCE file for use of this source code.

const { exec } = require('child_process');
const VERSION = require('./package.json').version;
// TODO
// download or build gui for each platform 

function execCmd(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error(`${err}\n`);
      }
      console.log(`${stdout}\n`);
      if (stderr) reject(stderr);
      resolve(stdout);
    });
  });
}

const onExecCatch = (err) => console.error(`${err}\n`);

execCmd('npx gulp pack').then(() => {
  execCmd(`cd build/Pafe-darwin-x64 && zip -rq -9 pafe-v${VERSION}-macOS.zip ./Pafe.app`)
  .then(() => {
    console.log('build for mac platform is complete.\n');
  }).catch(onExecCatch);
}).catch(onExecCatch);

execCmd('npx gulp pack:linux').then(() => {
  execCmd(`cd build/Pafe-linux-x64/ && zip -rq -9 pafe-v${VERSION}-linux.zip ./`)
  .then(() => {
    console.log('build for linux platform is complete.\n');
  }).catch(onExecCatch);
}).catch(onExecCatch);

// execCmd('npx gulp pack:win').then(() => {
//   execCmd(`zip -rq pafe-v${VERSION}-win.zip ./build/Pafe-darwin-x64/Pafe.app && rm -r build`)
//   .then(() => {
//     console.log('build for win platform is complete.');
//     process.exit(0);
//   });
// });
