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
    },

    BlackTourus : function () {
      var texture = THREE.ImageUtils.loadTexture("textures/planets/moon_1024.jpg");
      texture.repeat.set(2, 1);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.format = THREE.RGBFormat;

      var objectMaterial = new THREE.MeshPhongMaterial({
        color: 0x000000, 
        specular: 0xffffff, 
        metal: true, 
        map: texture,
      });

      var objectGeometry = new THREE.TorusGeometry(1.5, 0.4, 8, 16);

      var mesh = new THREE.Mesh( objectGeometry, objectMaterial );
      mesh.position.x = 400 * ( 0.5 - Math.random() );
      mesh.position.y = 50 * ( 0.5 - Math.random() ) + 25;
      mesh.position.z = 200 * ( 0.5 - Math.random() );
      mesh.rotation.y = 3.14 * ( 0.5 - Math.random() );
      mesh.rotation.x = 3.14 * ( 0.5 - Math.random() );

      return mesh;
    }
  }

};
