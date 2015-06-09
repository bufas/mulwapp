
graphConfigurations = {

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
  flat : function () {
    return function (children) {
      var obj = {
        type : 'Scene',
        children : []
      };

      for (var i = 0; i < children; i++) {
        obj.children.push({type : 'Mesh'});
      }

      return obj;
    }
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
  nesting : function () {
    return function (nestings) {
      var obj = {
        type : 'Scene',
        children : []
      };

      var nestingStructure = {type : 'Mesh'};
      for (var i = 1; i < nestings; i++) {
        nestingStructure = {
          type : 'Mesh',
          children : [nestingStructure]
        }
      }

      obj.children = [nestingStructure];
      
      return obj;
    }
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
  nary : function (n, type) {
    type = type || 'Mesh';
    
    return function (count) {
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
  }

};
