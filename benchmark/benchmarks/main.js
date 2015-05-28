
ZipHandler = function () {
  this.zip = new JSZip();
  this.zipContents = $('.zip-contents');
}

ZipHandler.prototype.addFile = function (path, content) {
  this.zip.file(path, content);
  this.drawZipContents();
}

ZipHandler.prototype.drawZipContents = function () {
  this.zipContents.text(this.zip.file(/.*/).map(function (x) { 
    return x.name; 
  }).join('\n'));
}

ZipHandler.prototype.download = function () {
  location.href='data:application/zip;base64,' + this.zip.generate();
}






BenchMarker = function () {
  this.benchmarks = {};
  this.benchtime  = 1000;
  this.zipHandler = new ZipHandler();
}

BenchMarker.prototype.addBench = function (name, benchmark) {
  this.benchmarks[name] = benchmark;

  var benchBtn = $('<button type="button">');
  benchBtn.text(name);
  benchBtn.on('click', this.runBench.bind(this, name));
  $('.benchmark-buttons').append(benchBtn);
}

BenchMarker.prototype.runBench = function (name) {
  var benchmark = this.benchmarks[name];
  var benchThis = {};

  benchmark.globalSetup.call(benchThis);

  // Run through all files
  benchmark.testMatrix.forEach(function (fileInfo) {
    var fileData = [benchmark.header];
    var fileThis = $.extend({}, benchThis);
    benchmark.fileSetup.call(fileThis, fileInfo.fileData);

    // Run all the tests of the file
    fileInfo.lineData.forEach(function (lineData) {
      lineData = $.extend(lineData, fileInfo.fileData);
      var testThis = $.extend({}, fileThis);
      benchmark.testSetup.call(testThis, lineData);
      var iter = this.timer(benchmark, lineData, testThis);
      var dataWithTestRes = $.extend({res: iter}, lineData);
      fileData.push(benchmark.makeLine.call(testThis, dataWithTestRes));
    }, this);

    // Write the file
    var filePath = benchmark.dataDirectory + fileInfo.filename
    var dataString = fileData.map(function (row) { 
      return row.join(' '); 
    }).join('\n');
    this.zipHandler.addFile(filePath, dataString);
  }, this);
}

BenchMarker.prototype.timer = function (benchmark, lineInfo, testThis) {
  var start = performance.now();
  var end;
  var iterations = 0;
  while (true) {
    benchmark.testCase.call(testThis, lineInfo);
    iterations++;
    end = performance.now();
    if (end - start > this.benchtime) break;
  }

  return iterations / ((end - start) / 1000);
}

BenchMarker.prototype.download = function () {
  this.zipHandler.download();
}

benchmarker = new BenchMarker(); // Global var

$(function () {
  var benchBtn = $('<button type="button">');
  benchBtn.text('Download Zippio Kontos');
  benchBtn.on('click', benchmarker.download.bind(benchmarker));
  $('.benchmark-buttons').append(benchBtn);
});

