#!/usr/bin/env node

// Copyright 2021 BAIELFOW. All rights reserved.
// Please see the LICENCE file for use of this source code.

const { exec } = require('child_process');

const VERSION = require('./package').version;

function execCmd(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error(`ERROR in exec: ${err}`);
        return;
      }

      console.log(`${stdout}`);
      //console.log(`stderr: ${stderr}`);
      if (stderr) reject(stderr);
      resolve(stdout);
    });
  });
}

execCmd('npx gulp package').then(() => {
  execCmd(`zip -rq pafe-v${VERSION}-macOS.zip ./build/Pafe-darwin-x64/Pafe.app && rm -r build`)
  .then(() => {
    console.log('build for macOS complete.');
    process.exit(0);
  });
});
