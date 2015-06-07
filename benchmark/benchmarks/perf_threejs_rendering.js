
var perfThreeJSRender = {
  /**
   * The directory in which to save the benchmarks
   * @type {String}
   */
  dataDirectory : 'data/perf_threejs_renderer/',
  
  /**
   * A string to prepend to every data file
   * @type {String}
   */
  header        : ['# iter nodes'],

  /**
   * A setup function that is only run once.
   */
  globalSetup   : function () {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(500, 500);
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
    var conf = graphConfigurations.nary(4);
    var factory = factories.default
    this.scene = new SceneGraph(conf(args.nodes), factory);

    this.camera = new THREE.PerspectiveCamera(85, 500/500, 0.1, 1000);
    this.camera.position.set(10, 10, 10);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
  },

  testCase      : function () {
    this.renderer.render(this.scene.root, this.camera);
  },

  /**
   * Create the test matrix. The matrix is 3-dimentional array. The first layer
   * is an array of files. Files contains lines, and lines contains data.
   */
  testMatrix    : (function () {
    var nodes = [];
    for (var i = 10; i <= 1000; i += 30) nodes.push(i);

    var testMatrix = [{
      filename : 'threejs_rendering.dat',
      fileData : {},
      lineData : nodes.map(function (n) { 
        return {nodes: n};
      })
    }];

    return testMatrix;
  })(),

  makeLine      : function (args) {
    return [
      args.res,
      args.nodes
    ];
  }
}

$(function () {
  benchmarker.addBench('perf ThreeJS render', perfThreeJSRender);
});