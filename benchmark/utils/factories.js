factories = {

  default : {
    /**
     * Creates a standard scene
     */
    Scene : function () {
      var obj = new THREE.Scene();
      obj.mulwapp_guid = Math.random();
      obj.mulwapp_create_spec = {args: []}
      return obj
    },

    /**
     * Creates a standard mesh
     */
    Mesh : function () {
      var obj = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      obj.mulwapp_guid = Math.random();
      obj.mulwapp_create_spec = {args: []}
      return obj
    }
  }

};
