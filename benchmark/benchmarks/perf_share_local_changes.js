
var perfShareLocalChangesShared = {
  /**
   * The directory in which to save the benchmarks
   * @type {String}
   */
  dataDirectory : 'data/perf_share_local_changes/',
  
  /**
   * A string to prepend to every data file
   * @type {String}
   */
  header        : ['# nodes mean sd ops/sec fractionChanged changes'],

  /**
   * A setup function that is only run once.
   */
  globalSetup   : function () {
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

    this.mulwapp = new Mulwapp(ThreeAdapter, MockSyncAdapter, {
      lal  : { shareConf: shareConfigurations.default },
      sync : {}
    });

    this.mulwapp.syncIsReady = true;
    this.mulwapp.firstAnimationFrameRun = false;

    this.scenes = {};
  },

  applyChanges  : function (root, nodes, changeFrac, changesToEachNode) {
    var changes = Math.floor(changeFrac * nodes);
    var graphNodes = [root];
    for (var i = 0; i < changes; i++) {
      var node = graphNodes.shift();
      node.children.forEach(function (c) { graphNodes.push(c); });

      if (changesToEachNode > 0) node.position.x += 1;
      if (changesToEachNode > 1) node.position.y += 1;
      if (changesToEachNode > 2) node.position.z += 1;
      if (changesToEachNode > 3) node.rotation.x += 0.000000001;
      if (changesToEachNode > 4) node.rotation.y += 0.000000001;
      if (changesToEachNode > 5) node.rotation.z += 0.000000001;
    }
  },

  testCase      : function () {
    this.mulwapp.animationFrameFn(this.scene.root);
  },

  makeLine      : function (args) {
    return [
      args.nodes,
      args.stats.mean,
      args.stats.sd,
      args.stats.sec,
      args.changeFrac,
      args.changesToEachNode,
    ];
  }
}

var perfShareLocalChangesVaryChangeFrac = {
  dataDirectory : perfShareLocalChangesShared.dataDirectory,
  header        : perfShareLocalChangesShared.header,
  globalSetup   : perfShareLocalChangesShared.globalSetup,
  fileSetup     : function (args) {
    var snapshot;
    if (args.nodes in this.scenes) {
      console.log('hit');
      this.scene = this.scenes[args.nodes].scene;
      snapshot = this.scenes[args.nodes].snap;
      this.mulwapp.lal.allLocalObjects = this.scenes[args.nodes].lalobj;
    }
    else {
      this.mulwapp.lal.allLocalObjects = {};

      var conf = graphConfigurations.nary(4);
      var factory = factories.default

      this.scene = new SceneGraph(conf(args.nodes), factory);
      snapshot = this.mulwapp.lal.calculateDiffModel(this.scene.root);
      this.scenes[args.nodes] = {
        scene  : this.scene,
        snap   : snapshot,
        lalobj : this.mulwapp.lal.allLocalObjects
      };
    }

    this.mulwapp.syncAdapter.setSnapshot(snapshot);
  },
  testSetup     : function (args) {
    perfShareLocalChangesShared.applyChanges(
      this.scene.root, 
      args.nodes, 
      args.changeFrac, 
      args.changesToEachNode
    );
  },
  testCase      : perfShareLocalChangesShared.testCase,
  testMatrix    : (function () {
    var nodes = [10, 50, 100, 500, 1000];

    var changeFrac = [];
    for (var i = 0.00; i <= 1.00; i += 0.1) changeFrac.push(i);

    var changesToEachNode = [1, 6];

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
    
    return testMatrix;
  })(),
  makeLine      : perfShareLocalChangesShared.makeLine,
}

var perfShareLocalChangesVaryNodes = {
  dataDirectory : perfShareLocalChangesShared.dataDirectory,
  header        : perfShareLocalChangesShared.header,
  globalSetup   : perfShareLocalChangesShared.globalSetup,
  fileSetup     : function () {},
  testSetup     : function (args) {
    this.mulwapp.lal.allLocalObjects = {};

    var conf = graphConfigurations.nary(4);
    var factory = factories.default

    this.scene = new SceneGraph(conf(args.nodes), factory);

    var snapshot = this.mulwapp.lal.calculateDiffModel(this.scene.root);
    this.mulwapp.syncAdapter.setSnapshot(snapshot);

    perfShareLocalChangesShared.applyChanges(
      this.scene.root, 
      args.nodes, 
      args.changeFrac, 
      args.changesToEachNode
    );
  },
  testCase      : perfShareLocalChangesShared.testCase,
  testMatrix    : (function () {
    var nodes = [];
    for (var i = 10; i <= 1000; i += 30) nodes.push(i);

    var changesToEachNode = [1, 6];
    var changeFrac = 0.2;

    var testMatrix = [];
    changesToEachNode.forEach(function (cten) {
      testMatrix.push({
        filename : 'changes' + cten + '.dat',
        fileData : {changeFrac: changeFrac, changesToEachNode: cten},
        lineData : nodes.map(function (n) { 
          return {nodes: n};
        })
      });
    });

    return testMatrix;
  })(),
  makeLine      : perfShareLocalChangesShared.makeLine,
}

$(function () {
  benchmarker.addBench(
    'Share local changes - vary changeFrac', 
    perfShareLocalChangesVaryChangeFrac
  );
  benchmarker.addBench(
    'Share local changes - vary nodes', 
    perfShareLocalChangesVaryNodes
  );
});