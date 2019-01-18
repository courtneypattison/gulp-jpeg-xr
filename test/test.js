'use strict';

const cp = require('child_process');
const expect = require('chai').expect;
const fileType = require('file-type');
const jxr = require('../index');
const pj = require('path').join;
const sinon = require('sinon');
const Stream = require('readable-stream');
const Vinyl = require('vinyl');
const vinylFile = require('vinyl-file');

const PLUGIN_NAME = 'gulp-jpeg-xr';

describe(PLUGIN_NAME, () => {
  beforeEach(() => {
    this.mockProcess = {
      on: sinon.stub(),
      stdout: {
        on: sinon.stub()
      },
      stderr: {
        on: sinon.stub()
      }
    };
  });

  it('return a null file when passed null file', (done) => {
    const stream = jxr();
    const vinyl = new Vinyl();

    stream.write(vinyl);
    stream.once('data', (file) => {
      expect(file).to.deep.equal(vinyl);
      done();
    });
  });

  it('convert png to jxr when valid file contents', (done) => {
    const stream = jxr();
    const vinyl = vinylFile.readSync(pj(__dirname, 'fixtures/cat.png'));

    stream.write(vinyl);
    stream.once('data', (file) => {
      expect(fileType(file.contents).mime).to.equal('image/vnd.ms-photo');
      expect(fileType(file.contents).ext).to.equal('jxr');
      done();
    });
  });

  it('convert tif to jxr when valid file contents', (done) => {
    const stream = jxr();
    const vinyl = vinylFile.readSync(pj(__dirname, 'fixtures/cat.tif'));

    stream.write(vinyl);
    stream.once('data', (file) => {
      expect(fileType(file.contents).mime).to.equal('image/vnd.ms-photo');
      expect(fileType(file.contents).ext).to.equal('jxr');
      done();
    });
  });

  it('convert jpg to jxr when valid file contents', (done) => {
    const stream = jxr();
    const vinyl = vinylFile.readSync(pj(__dirname, 'fixtures/cat.jpg'));

    stream.write(vinyl);
    stream.once('data', (file) => {
      expect(fileType(file.contents).mime).to.equal('image/vnd.ms-photo');
      expect(fileType(file.contents).ext).to.equal('jxr');
      done();
    });
  });

  it('error with filename when invalid file contents', (done) => {
    const stream = jxr();
    const filename = 'cat.txt';
    const vinyl = new Vinyl({
      path: 'cat.txt',
      contents: Buffer.from('cat')
    });

    stream.write(vinyl);
    stream.once('error', (error) => {
      expect(error.message).to.contain(filename);
      done();
    });
  });

  it('error when corrupt image', (done) => {
    const stream = jxr();
    const vinyl = vinylFile.readSync(pj(__dirname, 'fixtures/corruptcat.jpg'));

    stream.write(vinyl);
    stream.once('error', (error) => {
      expect(error);
      done();
    });
  });

  it('error when nConvert not installed', (done) => {
    this.mockProcess.on.withArgs('error').yieldsAsync(new Error());
    sinon.stub(cp, 'spawn').returns(this.mockProcess);
    const vinyl = new Vinyl({
      path: 'cat.txt',
      contents: Buffer.from('cat')
    });

    const stream = jxr();
    stream.write(vinyl);
    stream.once('error', (error) => {
      expect(error);
      cp.spawn.restore();
      done();
    });
  });

  it('error when buffer empty', (done) => {
    this.mockProcess.on.withArgs('close').yieldsAsync(0);
    sinon.stub(cp, 'spawn').returns(this.mockProcess);
    const vinyl = new Vinyl({
      path: 'cat.txt',
      contents: Buffer.from('cat')
    });

    const stream = jxr();
    stream.write(vinyl);
    stream.once('error', (error) => {
      expect(error.message.toLowerCase()).to.contain('empty buffer');
      cp.spawn.restore();
      done();
    });
  });

  it('error when cat exits with nonzero status', (done) => {
    this.mockProcess.on.withArgs('close').onFirstCall().yieldsAsync(0);
    this.mockProcess.on.withArgs('close').onSecondCall().yieldsAsync(1);
    this.mockProcess.on.withArgs('error').onSecondCall().yieldsAsync('bash: cat: command not found');
    sinon.stub(cp, 'spawn').returns(this.mockProcess);
    const vinyl = new Vinyl({
      path: 'cat.txt',
      contents: Buffer.from('cat')
    });

    const stream = jxr();
    stream.write(vinyl);
    stream.once('error', (error) => {
      expect(error.message.toLowerCase()).to.contain('cat');
      cp.spawn.restore();
      done();
    });
  });

  it('stderr from cat', (done) => {
    this.mockProcess.on.withArgs('close').onFirstCall().yieldsAsync(0);
    this.mockProcess.on.withArgs('close').onSecondCall().yieldsAsync(1);
    this.mockProcess.stdout.on.withArgs('data').yieldsAsync(Buffer.from('cat'));
    this.mockProcess.stderr.on.withArgs('data').yieldsAsync('stderr from cat');
    sinon.stub(cp, 'spawn').returns(this.mockProcess);
    const vinyl = new Vinyl({
      path: 'cat.txt',
      contents: Buffer.from('cat')
    });

    const stream = jxr();
    stream.write(vinyl);
    stream.once('error', (error) => {
      expect(error.message.toLowerCase()).to.contain('cat');
      cp.spawn.restore();
      done();
    });
  });

  it('error when passed a stream', (done) => {
    const stream = jxr();
    const vinyl = new Vinyl({
      contents: new Stream()
    });

    try {
      stream.write(vinyl);
    } catch (error) {
      expect(error.message.toLowerCase()).to.contain('stream');
      done();
    }
  });
});
