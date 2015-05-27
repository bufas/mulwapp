/**
 * Creates and returns a scene graph from a configuration
 * @param {object} conf - A configuration object, see utils/graphConfigurations.js
 * @param {object} factories - A factory object, see utils/factories.js
 */
SceneGraph = function (conf, factories) {

  var construct = function (conf) {
    var obj = factories[conf.type].apply(this, conf.args || []);

    conf.children && conf.children.forEach(function (subconf) {
      var child = construct(subconf);
      obj.add(child);
    });

    return obj;
  }

  this.root = construct(conf);
};

/**
 * Runs the render loop a given number of times
 * @param {Number} interations - The number of animation frames to run
 * @param {THREE.Scene} scene - The scene to render
 * @param {function} workFunc - Function called every iteration
 * @returns {Promise} Fulfills when all iterations has been run
 */
startFakeRenderLoop = function (iterations, scene, changeHandler, workFunc) {
  var flipMatrixWorldNeedsUpdate = function (obj) {
    obj.matrixWorldNeedsUpdate = !obj.matrixWorldNeedsUpdate;
  }

  var p = new Promise(function (resolve) {
    (function renderLoop() {
      // Stop if all iterations has been run
      if (iterations <= 0) {
        resolve();
        return;
      }

      // Request new animation frame and render the scene
      requestAnimationFrame(renderLoop);

      // Flip matrixWorldNeedsUpdate twice
      scene.traverse(flipMatrixWorldNeedsUpdate);
      scene.traverse(flipMatrixWorldNeedsUpdate);

      // Traverse/update sharejs/whatever work needs done every frame
      if (workFunc) workFunc.diff();

      // Send all changes to ShareJS
      if (Object.keys(changeHandler.changes).length) console.log(changeHandler.changes);
      changeHandler.clear();

      iterations -= 1;
    })();
  });

  return p;
}