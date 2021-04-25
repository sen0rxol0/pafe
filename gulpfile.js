const { exec, spawn } = require('child_process');
const { task, src, dest, watch, parallel, series } = require('gulp');
//const babel = require('gulp-babel');
//const concat = require('gulp-concat');
//const sourcemaps = require('gulp-sourcemaps');

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
  watch(`${__dirname}/src/**/*.{js,jsx}`, resolve => {
    if (typeof electron === null) { resolve(); }
    else {
      electron.kill();
      const respawn = spawn('npx', ['electron',`${__dirname}`]);
      // respawn.on('close', () => process.exit());
      electron = respawn;
      resolve();
    }
  });
});

task('build', parallel('assets', 'js'));
task('start', series('build', resolve => {
  setTimeout(() => {
    electron = spawn('npx', ['electron', `${__dirname}`]);
    // electron.on('close', () => process.exit());
    resolve();
  }, 6000);
}));

task('release', series('build', () => {
  return exec(`${__dirname}/node_modules/.bin/electron-builder .`)
    .on('close', () => process.exit());
}));

task('dev', parallel('start', 'watch'));
task('clean', resolve => {
  exec(`rm -rf ./build && mkdir ./build && gulp assets`);
  resolve();
});
