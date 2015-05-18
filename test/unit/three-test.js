var assert = buster.referee.assert;
var refute = buster.referee.refute;

buster.testCase('ThreeJS Adapter', {
  'setUp': function () {
    var config = {
      shareConf: function (node, path, root) {
        var res = {'watch_props': []};
        if (node instanceof THREE.Mesh) {
          res.watch_props = [
            'visible',
            'position.x',
            'position.y',
            'position.z'
          ];
        }

        return res;
      }
    };
    this.three = new ThreeAdapter(config);
  },

  /**
   * Test Mulwapp.diffNodes
   */

  'test calculateDiffModel': {
    'setUp': function () {
      this.scene = new THREE.Scene();
      var m1 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
      var m2 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
      var m3 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));

      this.scene.mulwapp_guid = 'guid0';
      m1.mulwapp_guid = 'guid1';
      m2.mulwapp_guid = 'guid2';
      m3.mulwapp_guid = 'guid3';

      m1.position.set(1, 2, 3);
      m2.position.set(5, 10, 20);

      this.scene.add(m1);
      this.scene.add(m2);
      m1.add(m3);
    },

    'test': function () {
      var diffModel = this.three.calculateDiffModel(this.scene);
      // console.log(diffModel);
      assert.equals(diffModel, {
        guid0: { 
          children: {
            guid1: true, 
            guid2: true
          }, 
          create_spec: undefined,
          props: {} 
        },
        guid1: {
          children: { 
            guid3: true 
          },
          create_spec: undefined,
          props: { 
            'position.x': 1, 
            'position.y': 2, 
            'position.z': 3, 
            visible: true 
          }
        },
        guid2: {
          children: {},
          create_spec: undefined,
          props: { 
            'position.x': 5, 
            'position.y': 10, 
            'position.z': 20, 
            visible: true 
          }
        },
        guid3: {
          children: {},
          create_spec: undefined,
          props: { 
            'position.x': 0, 
            'position.y': 0, 
            'position.z': 0, 
            visible: true 
          }
        }
      });
    }
  },

  'test setupConstructorInterceptors': {
    'setUp': function () {
      this.sceneCtor = THREE.Scene;
      this.three.addGuidProperty();
      this.three.setupConstructorInterceptors(['Scene']);
    },

    'tearDown': function () {
      THREE.Scene = this.sceneCtor;
    },

    'mulwapp_guid prop is set': function () {
      var scene = new THREE.Scene();
      assert(scene.mulwapp_guid != undefined);
    },

    'mulwapp_create_spec is set': function () {
      var scene = new THREE.Scene();
      assert(scene.mulwapp_create_spec != undefined);
    }
  },

  'test generateCreateSpec': {
    'setUp': function () {
      this.m1 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
      this.m1.mulwapp_guid = 'guid1';
    },

    'no arguments': function () {
      var createSpec = this.three.generateCreateSpec('Mesh', 'guid2', []);
      assert.equals(createSpec, {
        type: 'Mesh', 
        mulwapp_guid: 'guid2', 
        args: []
      })
    },

    'primitive argument': function () {
      var createSpec = this.three.generateCreateSpec('Mesh', 'guid2', [100]);
      assert.equals(createSpec, {
        type: 'Mesh', 
        mulwapp_guid: 'guid2', 
        args: [{primitive: true, value: 100}]
      })
    },

    'object argument': function () {
      var createSpec = this.three.generateCreateSpec('Mesh', 'guid2', [this.m1]);
      assert.equals(createSpec, {
        type: 'Mesh', 
        mulwapp_guid: 'guid2', 
        args: [{primitive: false, value: 'guid1'}]
      })
    },

    'multiple arguments': function () {
      var createSpec = this.three.generateCreateSpec('Mesh', 'guid2', [100, this.m1, false, {fish: true}]);
      assert.equals(createSpec, {
        type: 'Mesh', 
        mulwapp_guid: 'guid2', 
        args: [
          {primitive: true, value: 100},
          {primitive: false, value: 'guid1'},
          {primitive: true, value: false},
          {primitive: true, value: {fish: true}}
        ]
      })
    },
  },

  'test constructorReplayer': {
    'setUp': function () {
      this.geom = new THREE.BoxGeometry(1, 1, 1);
      this.geom.mulwapp_guid = 'guid0';
      this.three.allLocalObjects.guid0 = this.geom;
    },

    'create scene': function () {
      var spec = {
        type: 'Scene',
        mulwapp_guid: 'guid0',
        args: []
      }

      var obj = this.three.constructorReplayer(spec);
      assert(obj instanceof THREE.Scene);
    },

    'create from primitive args': function () {
      var spec = {
        type: 'BoxGeometry',
        mulwapp_guid: 'guid5',
        args: [
          {primitive: true, value: 1},
          {primitive: true, value: 2},
          {primitive: true, value: 3}
        ]
      }

      var obj = this.three.constructorReplayer(spec);
      assert(obj instanceof THREE.BoxGeometry);
    },

    'create from non primitive args': function () {
      var spec = {
        type: 'Mesh',
        mulwapp_guid: 'guid5',
        args: [
          {primitive: false, value: 'guid0'}
        ]
      }

      var obj = this.three.constructorReplayer(spec);
      assert(obj instanceof THREE.Mesh);
    },

    'created object is put into allLocalObjects': function () {
      var spec = {
        type: 'Scene',
        mulwapp_guid: 'guid0',
        args: []
      }

      var obj = this.three.constructorReplayer(spec);
      assert.equals(obj, this.three.allLocalObjects.guid0);
    },

  },

  'test modelUpdater': {
    'setUp': function () {
      this.scene = new THREE.Scene();
      this.m1 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
      this.m2 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));

      this.scene.mulwapp_guid = 'guid0';
      this.m1.mulwapp_guid = 'guid1';
      this.m2.mulwapp_guid = 'guid2';

      this.three.allLocalObjects.guid0 = this.scene;
      this.three.allLocalObjects.guid1 = this.m1;
      this.three.allLocalObjects.guid2 = this.m2;

      this.scene.add(this.m1);
    },

    'update prop simple': function () {
      var op = {
        type: 'update prop',
        guid: 'guid1',
        key: 'visible',
        val: false
      }

      this.three.modelUpdater(op);
      assert.equals(this.m1.visible, false);
    },

    'update prop complex': function () {
      var op = {
        type: 'update prop',
        guid: 'guid1',
        key: 'position.x',
        val: 10
      }

      this.three.modelUpdater(op);
      assert.equals(this.m1.position.x, 10);
    },

    'insert child': function () {
      var op = {
        type: 'insert child',
        guid: 'guid0',
        key: 'guid2'
      }

      this.three.modelUpdater(op);
      assert.equals(this.scene.children.length, 2);
    },

    'remove child': function () {
      var op = {
        type: 'delete child',
        guid: 'guid0',
        key: 'guid1'
      }

      this.three.modelUpdater(op);
      assert.equals(this.scene.children.length, 0);
    },

    'insert object': function () {
      var newObj = {
        props: {},
        children: {},
        create_spec: {
          type: 'Scene',
          mulwapp_guid: 'guid5',
          args: []
        }
      };

      var op = {
        type: 'insert object',
        val: newObj
      }

      this.three.modelUpdater(op);
      assert('guid5' in this.three.allLocalObjects);
    },

    'remove object': function () {
      var op = {
        type: 'delete object',
        guid: 'guid2'
      }

      this.three.modelUpdater(op);
      refute('guid2' in this.three.allLocalObjects);
    },
  },

});
