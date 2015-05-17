var ThreeAdapter = require('../../adapters/threejs_adapter');
var THREE = require('three');
var buster = require('buster');
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
    }
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
      console.log(diffModel);
      assert.equals(1, 1);
    }
  }

});
