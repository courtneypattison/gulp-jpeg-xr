# [gulp](https://gulpjs.com/)-jpeg-xr [![Coverage Status](https://coveralls.io/repos/github/courtneypattison/gulp-jpeg-xr/badge.svg?branch=master)](https://coveralls.io/github/courtneypattison/gulp-jpeg-xr?branch=master)
> A gulp plugin for converting images to JPEG XR (JXR) using [nConvert](https://www.xnview.com/en/nconvert/)

## Installation
Install with npm:
```
$ npm install --save-dev gulp-jpeg-xr
```

### nConvert
[Download nConvert](https://www.xnview.com/en/nconvert/#downloads) and install it on your system. On macOS, install nConvert by adding it to a directory in your $PATH:
```
$ mv ~/Downloads/NConvert/nconvert /usr/local/bin/
```

## Usage
```
var gulp = require('gulp');
var jxr = require('gulp-jpeg-xr');

function convertJXR() {
  return gulp.src('src/images/**/*.{jpg,jpeg,png}')
    .pipe(jxr())
    .pipe(gulp.dest('dist/images'));
}
```

## License

MIT © [Courtney Pattison](https://courtneypattison.com/)
