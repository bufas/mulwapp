/**
 * This benchmark will measure if the speed of traversal differs for various
 * structurings of the scene graph.
 *
 * Structures tested
 *  - Flat, all objects are direct children of the root
 *  - Snake, all objects have a single child except one which has none
 *  - Balanced, a balanced n-ary tree for n = 2 and 4
 */

var traverseSpeedVaryGraphStructure = {

  dataDirectory : 'data/traverse_speed_vary_graph_structure/',

  header : ['# nodes mean sd ops/sec'],

  globalSetup : function () {
    var lalConfig = { shareConf: shareConfigurations.default };
    this.lal = new ThreeAdapter(lalConfig);
    this.lal.initialize({applicationInitializationOngoing: false});
  },

  fileSetup     : function (args) {

  },

  testSetup : function (args) {
    this.lal.allLocalObjects = {};
    this.scene = new SceneGraph(args.conf(args.nodes), factories.default);
  },

  testCase : function () {
    this.lal.calculateDiffModel(this.scene.root);
  },

  testMatrix : (function () {
    // Bench matrix
    var nodes = [];
    for (var i = 10; i <= 1000; i += 30) nodes.push(i);

    var configurations = {
      'flat'   : graphConfigurations.flat(),
      'snake'  : graphConfigurations.nary(1),
      'binary' : graphConfigurations.nary(2),
      '4ary'   : graphConfigurations.nary(4)
    };

    // Benchmark
    var testMatrix = [];
    Object.keys(configurations).forEach(function (confName) {
      testMatrix.push({
        filename : confName + '.dat',
        fileData : {confName: confName, conf: configurations[confName]},
        lineData : nodes.map(function (n) {
          return {nodes: n};
        })
      });
    });

    return testMatrix;
  })(),

  makeLine : function (args) {
    return [
      args.nodes,
      args.stats.mean, 
      args.stats.sd, 
      args.stats.sec, 
    ];
  }
}

$(function () {
  var name = 'traverse speed vary graph structure';
  benchmarker.addBench(name, traverseSpeedVaryGraphStructure);
});