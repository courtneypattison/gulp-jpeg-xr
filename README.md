[![Build Status][travis-img]][travis-url] [![Coverage Status][coveralls-img]][coveralls-url] [![NPM Version][npm-img]][npm-url]

# [gulp](https://gulpjs.com/)-jpeg-xr
> A gulp plugin for converting images to JPEG XR (JXR) using [nConvert][nconvert-url]

## Installation
Install with [yarn][yarn-url] or [npm][npm-home-url]:
```
$ yarn add gulp-jpeg-xr -D
```
```
$ npm i gulp-jpeg-xr -D
```

### nConvert
[Download nConvert][nconvert-download-url] and install it on your system. On macOS, install nConvert by adding it to a directory in your $PATH:
```
$ mv ~/Downloads/NConvert/nconvert /usr/local/bin/
```

## Usage
```js
var gulp = require('gulp');
var jxr = require('gulp-jpeg-xr');

function convertJXR() {
  return gulp.src('src/images/**/*.{jpg,jpeg,png}')
    .pipe(jxr(['-truecolours', '-tile', '32']))
    .pipe(gulp.dest('dist/images'));
}
```

## API
### jxr([options])
Run `$ nconvert -help` to see the options. No spaces are allowed in the options array.

## License

MIT © [Courtney Pattison](https://courtneypattison.com/)

[coveralls-img]: https://img.shields.io/coveralls/github/courtneypattison/gulp-jpeg-xr.svg
[coveralls-url]: https://coveralls.io/github/courtneypattison/gulp-jpeg-xr

[nconvert-download-url]: (https://www.xnview.com/en/nconvert/#downloads)
[nconvert-url]: (https://www.xnview.com/en/nconvert/)

[npm-home-url]: https://www.npmjs.com/
[npm-img]: https://img.shields.io/npm/v/gulp-jpeg-xr.svg
[npm-url]: https://www.npmjs.com/package/gulp-jpeg-xr

[travis-img]: https://img.shields.io/travis/courtneypattison/gulp-jpeg-xr.svg
[travis-url]: https://travis-ci.org/courtneypattison/gulp-jpeg-xr

[yarn-url]: https://yarnpkg.com/
