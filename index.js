const cp = require('child_process');
const fs = require('fs');
const os = require('os');
const PluginError = require('plugin-error');
const replaceExt = require('replace-ext');
const through = require('through2');
const tmp = require('tmp');

const PLUGIN_NAME = 'gulp-jpeg-xr';

function gulpJxrConverter() {
  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      return cb(null, file);
    }

    if (file.isStream()) {
      return cb(new PluginError(PLUGIN_NAME, 'Streams are not supported!', { showProperties: false }));
    }

    try {
      // nConvert doesn't work realiably with streams, so use temporary files for input and output
      const tmpInFilePath = tmp.tmpNameSync({ postfix: file.extname });
      const tmpOutFilePath = tmp.tmpNameSync({ postfix: '.jxr' });

      fs.writeFileSync(tmpInFilePath, file.contents);
      
      const nconvert = cp.spawn('nconvert', ['-out', 'jxr', '-overwrite', '-o', tmpOutFilePath, '-quiet', tmpInFilePath]);
      let nconvertError = 'nConvert error.';

      nconvert.stderr.on('data', (data) => {
        nconvertError = data.toString();
      });

      nconvert.on('error', (error) => {
        return cb(new PluginError(PLUGIN_NAME, 'nConvert is not installed! Installation instructions: https://github.com/courtneypattison/gulp-jpeg-xr', { showProperties: false }));
      });

      nconvert.on('close', (code) => {
        fs.unlinkSync(tmpInFilePath);
        if (code === 0) {
          let buffers = [];
          let outputProcessError = 'outputProcess errored.';
          const outputProcessName = os.platform() === 'win32' ? 'type' : 'cat';
          const outputProcess = cp.spawn(outputProcessName, [tmpOutFilePath], { shell: true });

          outputProcess.stdout.on('data', (data) => {
            buffers.push(data);
          });

          outputProcess.stderr.on('data', (error) => {
            outputProcessError = error.toString();
          });

          outputProcess.on('error', (error) => {
            outputProcessError = error.toString();
          });

          outputProcess.on('close', (code) => {
            if (code === 0) {
              file.contents = Buffer.concat(buffers);
              file.path = replaceExt(file.path, '.jxr');
              if (file.contents.length === 0) {
                return cb(new PluginError(PLUGIN_NAME, 'Empty buffer.', { showProperties: false }));
              }
              fs.unlinkSync(tmpOutFilePath);
              cb(null, file);
            } else {
              cb(new PluginError(PLUGIN_NAME, outputProcessError, { showProperties: false }));
            }
          });
        } else {
          cb(new PluginError(PLUGIN_NAME, nconvertError, { showProperties: false }));
        }
      });
    } catch (error) {
      return cb(new PluginError(PLUGIN_NAME, error.message ? error.message : 'Failed to write/read tmp files.', { showProperties: false }));
    }
  });
}

module.exports = gulpJxrConverter;
