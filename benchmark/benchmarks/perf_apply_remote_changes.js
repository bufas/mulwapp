
var perfApplyRemoteChanges = {
  /**
   * The directory in which to save the benchmarks
   * @type {String}
   */
  dataDirectory : 'data/perf_apply_remote_changes/',
  
  /**
   * A string to prepend to every data file
   * @type {String}
   */
  header        : ['# nodes mean sd ops/sec changeType numberOfChanges'],

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

    // Create a sample geometry
    var geomguid = Math.random();
    this.sampleGeometry = new THREE.BoxGeometry(1, 1, 1);
    this.sampleGeometry.mulwapp_guid = geomguid;
    this.mulwapp.lal.allLocalObjects[geomguid] = this.sampleGeometry;

    // Create a sample mesh
    var meshguid = Math.random();
    this.sampleMesh = new THREE.Mesh(this.sampleGeometry);
    this.sampleMesh.mulwapp_guid = meshguid;
    this.mulwapp.lal.allLocalObjects[meshguid] = this.sampleMesh;
  },

  /**
   * Setup function called once per file
   * @param  {[type]}
   * @return {[type]}
   */
  fileSetup     : function (args) {
    var conf    = graphConfigurations.flat();
    var factory = factories.default

    this.mulwapp.lal.allLocalObjects = {};
    this.scene  = new SceneGraph(conf(args.nodes), factory);
  },

  /**
   * Setup function that is called before every test
   */
  testSetup     : function (args) {
    var getRandomChild = function (node) {
      var idx = Math.floor(Math.random() * node.children.length);
      return node.children[idx];
    }

    // Create operations
    this.operations = [];
    for (var i = 0; i < args.changes; i++) {
      var op = { type: args.optyp };

      if (args.optyp == 'insert object') {
        var guid = Math.random();
        op.guid = guid;
        op.val  = {
          'extra'        : {
            type         : 'Mesh',
            mulwapp_guid : guid,
            args         : [
              {primitive: false, value: this.sampleGeometry.mulwapp_guid}
            ]
          },
          'dependencies' : [this.sampleGeometry.mulwapp_guid],
          'props'        : {}, 
          'children'     : {}
        }
      }
      else if (args.optyp == 'insert child') {
        op.guid = this.scene.root.mulwapp_guid;
        op.key  = this.sampleMesh.mulwapp_guid;
      }
      else if (args.optyp == 'update prop') {
        op.guid = getRandomChild(this.scene.root).mulwapp_guid;
        op.key  = 'position.x';
        op.val  = Math.random();
      }
      else if (args.optyp == 'delete child') {
        if (args.change > args.nodes) break;
        op.guid = this.scene.root.mulwapp_guid;
        op.key  = this.scene.root.children[i].mulwapp_guid;
      }
      else if (args.optyp == 'delete object') {
        if (args.change > args.nodes) break;
        op.guid = this.scene.root.children[i].mulwapp_guid;
      }

      this.operations.push(op);
    }
  },

  testCase      : function () {
    this.mulwapp.handleRemoteOperations(this.operations);
  },

  /**
   * Create the test matrix. The matrix is 3-dimentional array. The first layer
   * is an array of files. Files contains lines, and lines contains data.
   */
  testMatrix    : (function () {
    var nodes = [10, 50, 100, 500, 1000];

    var operationTypes = [
      'insert object', 
      'insert child', 
      'update prop', 
      'delete child', 
      'delete object'
    ];

    var numberOfChanges = [1];
    for (var i = 5; i <= 150; i += 5) numberOfChanges.push(i);

    var testMatrix = [];
    operationTypes.forEach(function (optyp) {
      nodes.forEach(function (n) {
        testMatrix.push({
          filename : optyp.replace(' ', '') + '_nodes' + n + '.dat',
          fileData : {nodes: n, operationType: optyp},
          lineData : numberOfChanges.map(function (noc) { 
            return {changes: noc};
          })
        });
      });
    });

    return testMatrix;
  })(),

  makeLine      : function (args) {
    return [
      args.nodes,
      args.stats.mean,
      args.stats.sd,
      args.stats.sec,
      args.operationType.replace(' ', ''),
      args.changes
    ];
  }
}

$(function () {
  benchmarker.addBench('perf apply remote changes', perfApplyRemoteChanges);
});