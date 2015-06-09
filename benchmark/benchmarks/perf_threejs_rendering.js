
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
  header        : ['# nodes', 'mean', 'sd', 'min', 'max', 'ops/sec'],

  /**
   * A setup function that is only run once.
   */
  globalSetup   : function () {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.gammaInput = true;
    this.renderer.gammaOutput = true;
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
    var conf = graphConfigurations.nary(4, 'BlackTourus');
    var factory = factories.default;

    this.scene = new SceneGraph(conf(args.nodes), factory).root;

    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 300);
    this.camera.position.set(0, 15, 150);
    this.camera.lookAt(new THREE.Vector3());

    this.scene.add(new THREE.AmbientLight(0x111111));

    var c1 = 0xff0040;
    var c2 = 0x0040ff;
    var c3 = 0x80ff80;
    var c4 = 0xffaa00;
    var c5 = 0x00ffaa;
    var c6 = 0xff1100;

    var intensity = 2.5;
    var distance = 100;

    this.light1 = new THREE.PointLight(c1, intensity, distance);
    this.light2 = new THREE.PointLight(c2, intensity, distance);
    this.light3 = new THREE.PointLight(c3, intensity, distance);
    this.light4 = new THREE.PointLight(c4, intensity, distance);
    this.light5 = new THREE.PointLight(c5, intensity, distance);
    this.light6 = new THREE.PointLight(c6, intensity, distance);

    this.scene.add(this.light1);
    this.scene.add(this.light2);
    this.scene.add(this.light3);
    this.scene.add(this.light4);
    this.scene.add(this.light5);
    this.scene.add(this.light6);

    this.dlight = new THREE.DirectionalLight(0xffffff, 0.1);
    this.dlight.position.set(0.5, -1, 0).normalize();
    this.scene.add(this.dlight);
  },

  testCase      : function () {
    this.renderer.render(this.scene, this.camera);
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
      args.nodes,
      args.stats.mean,
      args.stats.sd,
      args.stats.min,
      args.stats.max,
      args.stats.sec,
    ];
  }
}

$(function () {
  benchmarker.addBench('perf ThreeJS render', perfThreeJSRender);
});