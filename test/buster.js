var config = module.exports;

config["My tests"] = {
  environment: "node",
  rootPath: "../",
  sources: [
    'adapters/threejs_adapter.js',
    'src/sharejs_adapter.js',
    'src/mulwapp.js'
  ],
  tests: [
    "test/unit/*-test.js"
  ]
};