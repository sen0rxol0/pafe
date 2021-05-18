const { exec, spawn } = require('child_process');
const { task, src, dest, watch, parallel, series } = require('gulp');
const buildMeta = require('./package.json').build;

var electron = null;

task('assets', async () => { // TODO: Add imagemin, svgo, and other assets optimization tools
  // exec('rm -r build/assets && mkdir build build/assets');
  // return src(`${__dirname}/src/assets/**`)
  //   .pipe(dest(`${__dirname}/build/assets/`));
});

task('js', resolve => {
  resolve();
});

task('watch', async () => {
  // watch(`${__dirname}/assets/**/*.{jpg,jpeg,png,svg,gif}`, task('assets'));
  watch(`${__dirname}/src/**/*.js`, resolve => {
    if (typeof electron === null) { resolve(); }
    else {
      console.log(`Killing electron`);
      electron.kill();
      console.log(`Respawning electron at ${__dirname}`);
      const respawn = spawn('npx', ['electron', `${__dirname}`]);
      // respawn.on('close', () => process.exit());
      electron = respawn;
      resolve();
    }
  });
});

task('build', parallel('assets', 'js'));
task('start', series('build', resolve => {
    console.log(`Spawning electron at ${__dirname}`);
    electron = spawn('npx', ['electron', `${__dirname}`]);
    // electron.on('close', () => process.exit());
    resolve();
}));

task('pack', series('build', () => {
  return exec(`${__dirname}/node_modules/.bin/electron-packager ./ --platform=darwin --arch=x64 --icon=src/assets/icons.icns --prune=true --out=build --overwrite`)
    .on('close', () => process.exit());
}));

task('pack:win', series('build', () => {
  return exec(`${__dirname}/node_modules/.bin/electron-packager ./ --platform=win32 --arch=ia32 --icon=src/assets/icon_512x512@1x.png --prune=true --win32metadata.CompanyName="BAIEFLOW" --asar --out=build --overwrite`)
    .on('close', () => process.exit());
}));

task('pack:linux', series('build', () => {
  return exec(`${__dirname}/node_modules/.bin/electron-packager ./ --platform=linux --arch=x64 --icon=src/assets/icon_512x512@1x.png --prune=true --asar --out=build --overwrite`)
    .on('close', () => process.exit());
}));

task('dev', parallel('start', 'watch'));
task('clean', resolve => {
  exec(`rm -rf ./build && mkdir ./build && gulp assets`);
  resolve();
});
