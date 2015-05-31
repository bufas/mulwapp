
var perfShareLocalChanges = {
  /**
   * The directory in which to save the benchmarks
   * @type {String}
   */
  dataDirectory : 'data/perf_share_local_changes/',
  
  /**
   * A string to prepend to every data file
   * @type {String}
   */
  header        : ['# iter nodes fractionOfNodesChanged changesToEachNode'],

  /**
   * A setup function that is only run once.
   */
  globalSetup   : function () {
    // Create mock synchronization adapter
    var MockSyncAdapter = function () {}
    MockSyncAdapter.prototype.getSnapshot = function () { 
      return this.snapshot; 
    }
    MockSyncAdapter.prototype.setSnapshot = function (s) { 
      this.snapshot = s; 
    }
    MockSyncAdapter.prototype.applyOperations = function (ops) { 
      this.ops = ops; 
    }
    MockSyncAdapter.prototype.initialize = function () { 
      return { 
        then: function () {} 
      }; 
    };

    // Set up Mulwapp
    this.mulwapp = new Mulwapp(ThreeAdapter, MockSyncAdapter, {
      lal  : { shareConf: shareConfigurations.default },
      sync : {}
    });

    this.mulwapp.syncIsReady = true;
    this.mulwapp.firstAnimationFrameRun = false;
  },

  /**
   * Setup function called once per file
   * @param  {[type]}
   * @return {[type]}
   */
  fileSetup     : function (args) {

  },

  /**
   * Setup function that is called before every test
   */
  testSetup     : function (args) {
    var applyChanges = function (root, nodes, changeFrac, changesToEachNode) {
      var changes = Math.floor(changeFrac * nodes);
      var graphNodes = [root];
      for (var i = 0; i < changes; i++) {
        var node = graphNodes.shift();
        node.children.forEach(function (c) { graphNodes.push(c); });

        if (changesToEachNode > 0) node.position.x += 1;
        if (changesToEachNode > 1) node.position.y += 1;
        if (changesToEachNode > 2) node.position.z += 1;
        if (changesToEachNode > 3) node.visible = !node.visible;
      }
    }

    var conf = graphConfigurations.nary(4);
    var factory = factories.default

    this.scene = new SceneGraph(conf(args.nodes), factory);
    this.mulwapp.syncAdapter.setSnapshot(this.mulwapp.lal.calculateDiffModel(this.scene.root));
    applyChanges(this.scene.root, args.nodes, args.changeFrac, args.changesToEachNode);
  },

  testCase      : function () {
    this.mulwapp.animationFrameFn(this.scene.root);
  },

  /**
   * Create the test matrix. The matrix is 3-dimentional array. The first layer
   * is an array of files. Files contains lines, and lines contains data.
   */
  testMatrix    : (function () {
    var nodes = [
      10,
      20,
      50,
      100,
      200,
      500,
      1000
    ];

    var changeFrac = [];
    for (var i = 0.00; i <= 1.00; i += 0.1) changeFrac.push(i);

    var changesToEachNode = [
      1, 
      2, 
      3, 
      4
    ];

    var testMatrix = [];
    changesToEachNode.forEach(function (cten) {
      nodes.forEach(function (n) {
        testMatrix.push({
          filename : 'nodes' + n + '_changes' + cten + '.dat',
          fileData : {nodes: n, changesToEachNode: cten},
          lineData : changeFrac.map(function (c) { 
            return {changeFrac: c};
          })
        });
      });
    });

    nodes = [];
    for (var i = 10; i <= 1000; i += 30) nodes.push(i);

    changesToEachNode.forEach(function (cten) {
      testMatrix.push({
        filename : 'changes' + cten + '.dat',
        fileData : {changeFrac: 1.00, changesToEachNode: cten},
        lineData : nodes.map(function (n) { 
          return {nodes: n};
        })
      });
    });

    return testMatrix;
  })(),

  makeLine      : function (args) {
    return [
      args.res,
      args.nodes,
      args.changeFrac,
      args.changesToEachNode
    ];
  }
}

$(function () {
  benchmarker.addBench('perf share local changes', perfShareLocalChanges);
});