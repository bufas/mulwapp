
shareConfigurations = {

  default : function (node, path, root) {
    return {
      'watch_props' : [
        'visible',
        'position.x',
        'position.y',
        'position.z',
        'rotation.x',
        'rotation.y',
        'rotation.z',
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

