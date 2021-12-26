#!/usr/bin/env node

// Copyright 2021 BAIELFOW. All rights reserved.
// Please see the LICENCE file for use of this source code.

const { exec } = require('child_process');
const VERSION = require('./package.json').version;
const onExecCatch = (err) => console.error(`${err}\n`);
const electronVersion = '16';
const yueTagName = 'v0.10.1';

function execCmd(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error(`${err}\n`);
      }
      // console.log(`${stdout}\n`);
      if (stderr) reject(stderr);
      resolve(stdout);
    });
  });
}

function downloadYue(platform) {
  const yueDownloadUrl = `https://github.com/yue/yue/releases/download/${yueTagName}/node_yue_electron_${electronVersion}_${yueTagName}_${platform}.zip`;
  const filename = `gui_electron_${platform}.zip`;
  return execCmd(`wget -q -O ${filename} ${yueDownloadUrl}; unzip -o ${filename} -x LICENSE; rm ${filename}`);
}

function packDarwin() {
  return downloadYue('mac_x64').then(() => {
    return execCmd('npx gulp pack').then(() => {
      return execCmd(`cd build/Pafe-darwin-x64 && zip -rq -9 pafe-v${VERSION}-macOS.zip ./Pafe.app`);
    }).catch(onExecCatch);
  }).catch(onExecCatch);
}

function packLinux() {
  return downloadYue('linux_x64').then(() => {
    return execCmd('npx gulp pack:linux').then(() => {
      return execCmd(`cd build/Pafe-linux-x64/ && zip -rq -9 pafe-v${VERSION}-linux.zip ./`);
    }).catch(onExecCatch);
  }).catch(onExecCatch);
}

packDarwin().then(() => {
  console.log('build for mac platform is complete.\n');
  packLinux().then(() => {
    console.log('build for linux platform is complete.\n');
    downloadYue('mac_x64');
  }).catch(onExecCatch);
}).catch(onExecCatch);

// execCmd('curl https://api.github.com/repos/yue/yue/releases/latest > yue_releases.json').then(() => {
//   // const tagName = JSON.parse(res).tag_name;
//   // console.log(tagName);
// }).catch(onExecCatch);

// execCmd('npx gulp pack:win').then(() => {
//   execCmd(`zip -rq pafe-v${VERSION}-win.zip ./build/Pafe-darwin-x64/Pafe.app && rm -r build`)
//   .then(() => {
//     console.log('build for win platform is complete.');
//     process.exit(0);
//   });
// });
