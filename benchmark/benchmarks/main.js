
ZipHandler = function () {
  this.zip = new JSZip();
  this.zipContents = $('.zip-contents');
}

ZipHandler.prototype.addFile = function (path, content) {
  this.zip.file(path, content);
  this.drawZipContents();
}

ZipHandler.prototype.drawZipContents = function () {
  this.zipContents.html(this.zip.file(/.*/).map(function (x) { 
    var lastSlash = x.name.lastIndexOf('/');
    var dir = '<span class="gray">' + x.name.substr(0, lastSlash+1) + '</span>';
    return dir + x.name.substr(lastSlash+1); 
  }).join('<br>'));
}

ZipHandler.prototype.download = function () {
  location.href='data:application/zip;base64,' + this.zip.generate();
}

BenchMarker = function () {
  this.benchmarks         = {};
  this.benchtime          = 100;
  this.zipHandler         = new ZipHandler();
  this.lastProgressUpdate = -99999999;
}

BenchMarker.prototype.addBench = function (name, benchmark) {
  this.benchmarks[name] = benchmark;

  var _this = this;
  var benchBtn = $('<button type="button">');
  benchBtn.text(name);
  benchBtn.on('click', function () {
    $('.inprogress').fadeIn('slow', function () {
      _this.runBench(name);
      $('.inprogress').fadeOut('slow');
    });
  });
  $('.benchmark-buttons').append(benchBtn);
}

BenchMarker.prototype.runBench = function (name) {
  var benchmark = this.benchmarks[name];
  var benchThis = {};

  benchmark.globalSetup.call(benchThis);

  // Count tests
  var lineCount = benchmark.testMatrix.reduce(function (acc, x) { 
    return acc + x.lineData.length; 
  }, 0);

  var benchStartTime = performance.now();
  var thisLine = 1;

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
      var timerRes = this.timer(benchmark, lineData, testThis);
      var dataWithTestRes = $.extend({stats: timerRes}, lineData);
      fileData.push(benchmark.makeLine.call(testThis, dataWithTestRes));

      // Print remaining time
      var timeDiff = performance.now() - benchStartTime;
      this.printRemainingTime(timeDiff, lineCount, thisLine);

      thisLine++;
    }, this);

    // Write the file
    var filePath = benchmark.dataDirectory + fileInfo.filename
    var dataString = fileData.map(function (row) { 
      return row.join(' '); 
    }).join('\n');
    this.zipHandler.addFile(filePath, dataString);
  }, this);
}

BenchMarker.prototype.printRemainingTime = function (d, totalLines, linesDone) {
  var now = performance.now();
  if (this.lastProgressUpdate > now - 5000) return;

  var linesLeft = totalLines - linesDone;
  var timeLeft  = Math.floor(((d / linesDone) * linesLeft) / 1000);

  var mins = Math.floor(timeLeft / 60);
  var secs = ('0' + (timeLeft % 60)).substr(-2);
  var pct  = Math.floor(linesDone / totalLines * 100);
  console.log('Time left: ' + mins + ':' + secs + ' ('+pct+'%)');

  this.lastProgressUpdate = now;
}

BenchMarker.prototype.timer = function (benchmark, lineInfo, testThis) {
  var testStart = performance.now();

  var tb; 
  var ta;
  var ts = [];
  while (true) {
    var tb = performance.now();
    benchmark.testCase.call(testThis, lineInfo);
    var ta = performance.now();
    ts.push(ta - tb);
    if (performance.now() - testStart > this.benchtime && ts.length > 50) {
      break;
    }
  }

  ts.sort();
  ts.shift();
  ts.shift();
  ts.pop();
  ts.pop();
  var mean = ts.reduce(function (acc, t) { return acc + t; }) / ts.length;
  var variance = ts.reduce(
    function (acc, t) { 
      return Math.pow(t - mean, 2) + acc; 
    }
  ) / ts.length;
  var sd = Math.sqrt(variance);

  return {
    mean     : mean,
    sd       : sd,
    variance : variance,
    sec      : 1000 / mean,
  };
}

BenchMarker.prototype.download = function () {
  this.zipHandler.download();
}

benchmarker = new BenchMarker(); // Global var

$(function () {
  var benchBtn = $('<button type="button">');
  benchBtn.text('Download Zippio Kontos');
  benchBtn.on('click', benchmarker.download.bind(benchmarker));
  benchBtn.addClass('button-primary');
  $('.benchmark-buttons').append(benchBtn);
});

