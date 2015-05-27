/**
 * Creates and returns a scene graph from a configuration
 * @param {object} conf - A configuration object, see utils/graphConfigurations.js
 * @param {object} factories - A factory object, see utils/factories.js
 */
var SceneGraph = function (conf, factories) {

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
var startFakeRenderLoop = function (iterations, scene, changeHandler, workFunc) {
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

/**
 * 
 */
var factories = {

  default : {
    /**
     * Creates a standard scene
     */
    Scene : function () {
      return new THREE.Scene();
    },

    /**
     * Creates a standard mesh
     */
    Mesh : function () {
      return new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
    }
  }

};

/**
 * 
 */
var shareConfigurations = {

  default : function (node, path, root) {
    return {
      'watch_props' : [
        'visible',
        'position.x',
        'position.y',
        'position.z'
      ]
    };
  },

  test : function (node, path, root) {
    return {
      'watch_props' : [
        'matrixWorldNeedsUpdate',
        'visible',
        'position.x',
        'position.y',
        'position.z'
      ]
    };
  }

}

var graphConfigurations = {

  /**
   * Creates a flat scene graph of meshes. Like this:
   *
   * {type : 'Scene', children : [
   *   {type : 'Mesh'},
   *   {type : 'Mesh'},
   *   {type : 'Mesh'},
   *   {type : 'Mesh'}]}
   *
   * @param {Number} children - The number of scene children
   */
  flat : function (children) {
    var obj = {
      type : 'Scene',
      children : []
    };

    for (var i = 0; i < children; i++) {
      obj.children.push({type : 'Mesh'});
    }

    return obj;
  },

  /**
   * Creates a chain of meshes. Like this:
   *
   * {type : 'Scene', children : [
   *   {type : 'Mesh', children : [
   *     {type : 'Mesh', children : [
   *       {type : 'Mesh', children : [
   *         {type : 'Mesh'}]}]}]}]}
   *
   * @param {Number} nestings - The length og the children chain
   */
  nesting : function (nestings) {
    var obj = {
      type : 'Scene',
      children : []
    };

    var nestingStructure = {type : 'Mesh'};
    for (var i = 1; i < nestings; i++) {
      nestingStructure = {
        type : 'Mesh',
        children : nestingStructure
      }
    }

    obj.children = nestingStructure;
    
    return obj;
  },

  /**
   * Creates an n-ary tree of meshes. Like this (7 nodes, binary):
   *
   * {type : 'Scene', children : [
   *   {type : 'Mesh', children : [
   *     {type : 'Mesh'},
   *     {type : 'Mesh'}]},
   *   {type : 'Mesh', children : [
   *     {type : 'Mesh'},
   *     {type : 'Mesh'}]}]}
   *
   * @param {Number} count - The number of nodes (including scene)
   * @param {Number} n - The number of children per node
   */
  nary : function (count, n) {
    n = n || 2;

    var obj = {
      type : 'Scene',
      children : []
    };

    var queue = [];
    var current = obj;

    while (count > 1) {
      if (current.children === undefined) {
        current.children = [];
      }

      if (current.children.length < n) {
        var mesh = {
          type : 'Mesh'
        };

        current.children.push(mesh);
        queue.push(mesh);
        count--;
      } else {
        current = queue.shift();
      }
    }

    return obj;
  }

};

module.export = {
  'SceneGraph'          : SceneGraph, 
  'startFakeRenderLoop' : startFakeRenderLoop,
  'factories'           : factories,
  'shareConfigurations' : shareConfigurations,
  'graphConfigurations' : graphConfigurations
}
