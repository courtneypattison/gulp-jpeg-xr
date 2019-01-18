const cp = require('child_process');
const fs = require('fs');
const through = require('through2');
const tmp = require('tmp');
const PluginError = require('plugin-error');
const replaceExt = require('replace-ext');

const PLUGIN_NAME = 'gulp-jpeg-xr';

function gulpJxrConverter() {
  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      return cb(null, file);
    }

    if (file.isStream()) {
      return cb(new PluginError(PLUGIN_NAME, 'Streams are not supported!', { showProperties: false }));
    }

    const tmpFilepath = tmp.tmpNameSync({ postfix: '.jxr' });
    const nconvert = cp.spawn('nconvert', ['-out', 'jxr', '-overwrite', '-o', tmpFilepath, '-quiet', file.path]);
    let nconvertError = 'nConvert errored.';

    nconvert.stderr.on('data', (data) => {
      nconvertError = data.toString();
    });

    nconvert.on('error', (error) => {
      return cb(new PluginError(PLUGIN_NAME, 'nConvert is not installed! Installation instructions: https://github.com/courtneypattison/gulp-jpeg-xr', { showProperties: false }));
    });

    nconvert.on('close', (code) => {
      if (code === 0) {
        let buffers = [];
        let catError = 'cat errored.';
        const cat = cp.spawn('cat', [tmpFilepath]);

        cat.stdout.on('data', (data) => {
          buffers.push(data);
        });

        cat.stderr.on('data', (error) => {
          catError = error.toString();
        });

        cat.on('error', (error) => {
          catError = error.toString();
        });

        cat.on('close', (code) => {
          if (code === 0) {
            file.contents = Buffer.concat(buffers);
            file.path = replaceExt(file.path, '.jxr');
            if (file.contents.length === 0) {
              return cb(new PluginError(PLUGIN_NAME, 'Empty buffer.', { showProperties: false }));
            }
            fs.unlinkSync(tmpFilepath);
            cb(null, file);
          } else {
            cb(new PluginError(PLUGIN_NAME, catError, { showProperties: false }));
          }
        });
      } else {
        cb(new PluginError(PLUGIN_NAME, nconvertError, { showProperties: false }));
      }
    });
  });
}

module.exports = gulpJxrConverter;
