
shareConfigurations = {

  default : function (node, path, root) {
    return {
      'watch_props' : [
        'uuid',
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
        'uuid',
        'visible',
        'position.x',
        'position.y',
        'position.z'
      ]
    };
  }

}

