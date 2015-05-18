var config = module.exports;

config["My tests"] = {
  environment: "browser",
  rootPath: "../",
  sources: [
    'src/bower_components/threejs/build/three.min.js',
    'src/threejs_adapter.js',
    'src/sharejs_adapter.js',
    'src/mulwapp.js'
  ],
  tests: [
    "test/unit/*-test.js"
  ]
};