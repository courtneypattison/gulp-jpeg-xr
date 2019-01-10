const cp = require('child_process');
const fs = require('fs');
const log = require('fancy-log');
const through = require('through2');
const PluginError = require('plugin-error');
const rename = require('rename');
const replaceExt = require('replace-ext');

const PLUGIN_NAME = 'gulp-jpeg-xr';

function gulpJxrConverter() {
  cp.exec('nconvert', (error, stdout) => {
    if (!stdout || stdout.toString().toLowerCase().indexOf('nconvert') === -1) {
      throw new PluginError(PLUGIN_NAME, 'nConvert is not installed! Installation instructions: https://github.com/courtneypattison/gulp-jpeg-xr', { showProperties: false });
    }
  });

  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      log(PLUGIN_NAME, 'File is empty!');
      return cb(null, file);
    }
    if (file.isStream()) {
      cb(new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
      return;
    }

    const tempFilepath = rename(file.path, { prefix: '.' });
    const nconvert = cp.spawn('nconvert', ['-out', 'jxr', '-overwrite', '-o', tempFilepath, '-quiet', file.path]);
    let buffers = [];

    nconvert.on('close', (code) => {
      const cat = cp.spawn('cat', [tempFilepath]);

      cat.stdout.on('data', (data) => {
        buffers.push(data);
      });

      cat.stderr.on('data', (err) => {
        cb(new PluginError(PLUGIN_NAME, err));
        return;
      });

      cat.stderr.on('close', (err) => {
        file.contents = Buffer.concat(buffers);
        file.path = replaceExt(file.path, '.jxr');
        if (file.contents.length === 0) {
          cb(new PluginError(PLUGIN_NAME, 'Empty buffer.'));
          return;
        }
        fs.unlinkSync(tempFilepath);
        cb(null, file);
      });

      cat.on('error', (err) => {
        cb(new PluginError(PLUGIN_NAME, 'Failed cat file.'));
        return;
      });
    });

    nconvert.on('error', (err) => {
      cb(new PluginError(PLUGIN_NAME, 'Failed to start nConvert.'));
      return;
    });
  });
}

module.exports = gulpJxrConverter;
