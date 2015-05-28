/**
 * This benchmark will measure if the speed of traversal differs for various
 * structurings of the scene graph.
 *
 * Structures tested
 *  - Flat, all objects are direct children of the root
 *  - Snake, all objects have a single child except one which has none
 *  - Balanced, a balanced n-ary tree for n = 2 and 4
 *
 * Output
 * 
 */

var traverseSpeedVaryGraphStructure = function () {

  var dataDirectory = 'traverse_speed_vary_graph_structure';

  // Bench matrix
  var nodes = [
    1000,
    900, 
    800, 
    700, 
    600, 
    500, 
    400, 
    300, 
    200, 
    100, 
    30, 
    10
  ];
  var time = [
    1000
  ];
  var configurations = {
    'flat'  : graphConfigurations.flat(),
    'snake' : graphConfigurations.nesting(),
    '2ary'  : graphConfigurations.nary(2),
    '4ary'  : graphConfigurations.nary(4)
  };

  // Instantiate Library Adapter and zip file
  var lalConfig = { shareConf: shareConfigurations.default };
  var lal = new ThreeAdapter(lalConfig);
  var zip = new JSZip();

  // Benchmark
  Object.keys(configurations).forEach(function (conf) {
    var data = [['#', 'iter', 'n', 'time']];

    time.forEach(function (t) {
      nodes.forEach(function (n) {
        var scene = new SceneGraph(configurations[conf](n), factories.default);
        var iter  = timeCalcDiffModel(lal, scene, t);
        data.push([iter, n, t]);
      });
    });

    var dataString = data.map(function (row) { return row.join(' '); }).join('\n');
    zip.file('data/traverse_speed_vary_graph_structure/'+conf+'.dat', dataString);
  });

  // Download the file
  location.href="data:application/zip;base64,"+zip.generate();

}

/**
 * Measures the time it takes to calculate the diff model on a scene graph a
 * number of times
 * @param  {THREE.Scene} the root of the scene graph
 * @param {number} iterations - the number of times to calculate the diff model
 * @return {number} The number of miliseconds to run the test
 */
var timeCalcDiffModel = function (lal, scene, ms) {
  var start = performance.now();
  var end;
  var iterations = 0;
  var dm = {}; var cnt = 0; // Force side effects
  while (true) {
    dm = lal.calculateDiffModel(scene.root);
    iterations++;

    // Force side effects
    if (dm) cnt++;

    end = performance.now();
    if (end - start > ms) break;
  }

  console.log(cnt);
  return iterations / ((end - start) / 1000);
}

$(function () {
  var benchBtn = $('<button type="button">');
  benchBtn.text('traverse speed vary graph structure');
  benchBtn.on('click', traverseSpeedVaryGraphStructure);
  $('.benchmark-buttons').append(benchBtn);
});