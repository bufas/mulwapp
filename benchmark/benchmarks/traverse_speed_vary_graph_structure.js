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

var traverseSpeedVaryGraphStructure = {

  dataDirectory : 'data/traverse_speed_vary_graph_structure/',

  header : ['# iter n'],

  globalSetup : function () {
    var lalConfig = { shareConf: shareConfigurations.default };
    this.lal = new ThreeAdapter(lalConfig);
  },

  fileSetup     : function (args) {

  },

  testSetup : function (args) {
    this.scene = new SceneGraph(args.conf(args.nodes), factories.default);
  },

  testCase : function () {
    this.lal.calculateDiffModel(this.scene.root);
  },

  testMatrix : (function () {
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
    var configurations = {
      'flat'  : graphConfigurations.flat(),
      'snake' : graphConfigurations.nesting(),
      '2ary'  : graphConfigurations.nary(2),
      '4ary'  : graphConfigurations.nary(4)
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
    return [args.res, args.nodes];
  }
}

$(function () {
  var name = 'traverse speed vary graph structure';
  benchmarker.addBench(name, traverseSpeedVaryGraphStructure);
});