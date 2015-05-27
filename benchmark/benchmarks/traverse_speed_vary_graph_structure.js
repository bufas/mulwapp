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
    10, 
    30, 
    100, 
    200, 
    300, 
    400, 
    500, 
    600, 
    700, 
    800, 
    900, 
    1000
  ];
  var iterations = [
    10000
  ];
  var configurations = {
    'flat'  : graphConfigurations.flat(),
    'snake' : graphConfigurations.nesting(),
    '2ary'  : graphConfigurations.nary(2),
    '4ary'  : graphConfigurations.nary(4)
  };

  // Instantiate Library Adapter
  var lalConfig = { shareConf: shareConfigurations.default };
  var lal = new ThreeAdapter(lalConfig);

  // Benchmark
  var data = [['#', 'conf', 'time', 'n', 'iter']];
  Object.keys(configurations).forEach(function (conf) {
    iterations.forEach(function (iter) {
      nodes.forEach(function (n) {
        var scene = new SceneGraph(configurations[conf](nodes), factories.default);
        var time  = timeCalcDiffModel(lal, scene, iter);
        data.push([conf, time, n, iter]);
      });
    });
  });

  // Write to file
  var dataString = data.map(function (row) { return row.join(' '); }).join('\n');
  var zip = new JSZip();
  zip.file('data/traverse_speed_vary_graph_structure/data.txt', dataString);
  location.href="data:application/zip;base64,"+zip.generate({type:"base64"});

}

/**
 * Measures the time it takes to calculate the diff model on a scene graph a
 * number of times
 * @param  {THREE.Scene} the root of the scene graph
 * @param {number} iterations - the number of times to calculate the diff model
 * @return {number} The number of miliseconds to run the test
 */
var timeCalcDiffModel = function (lal, scene, iterations) {
  var start = performance.now();
  for (var i = 0; i < iterations; i++) {
    lal.calculateDiffModel(scene.root);
  }
  var end = performance.now();
  return end - start;
}

$(function () {
  var benchBtn = $('<button type="button">');
  benchBtn.text('traverse speed vary graph structure');
  benchBtn.on('click', traverseSpeedVaryGraphStructure);
  $('.benchmark-buttons').append(benchBtn);
});