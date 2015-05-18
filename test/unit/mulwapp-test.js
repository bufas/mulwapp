var assert = buster.referee.assert;
var refute = buster.referee.refute;

buster.testCase('Mulwapp', {
  'setUp': function () {
    this.lal = function () { return {initialize: function () {}}; };
    this.sjs = function () {};
    this.mulwapp = new Mulwapp(this.lal, this.sjs, {});
  },

  /**
   * Test Mulwapp.diffNodes
   */

  'test diffNodes': {
    'setUp': function () {
      this.oldNode = {
        props: {
          a: 1,
          b: 'Hello World!',
          c: true,
          'position.x': 100
        },
        children: {
          guid1: true,
          guid2: true
        }
      }

      this.newNode = JSON.parse(JSON.stringify(this.oldNode));
    },

    'empty diffNodes for equal objects': function () {
      var diff = this.mulwapp.diffNodes(this.newNode, this.oldNode, 'guid0');
      assert.equals(diff, []);
    },

    'diffNodes detect int property change': function () {
      this.newNode.props.a = 2;
      var diff = this.mulwapp.diffNodes(this.newNode, this.oldNode, 'guid0');
      assert.equals(diff, [{
        type: 'update prop', 
        guid: 'guid0',
        key: 'a',
        val: 2
      }]);
    },

    'diffNodes detect string property change': function () {
      this.newNode.props.b = 'Yo dawg!';
      var diff = this.mulwapp.diffNodes(this.newNode, this.oldNode, 'guid0');
      assert.equals(diff, [{
        type: 'update prop', 
        guid: 'guid0',
        key: 'b',
        val: 'Yo dawg!'
      }]);
    },

    'diffNodes detect multiple changes': function () {
      this.newNode.props.c = false;
      this.newNode.props['position.x'] = 5;
      var diff = this.mulwapp.diffNodes(this.newNode, this.oldNode, 'guid0');

      assert.equals(diff, [{
        type: 'update prop', 
        guid: 'guid0',
        key: 'c',
        val: false
      }, {
        type: 'update prop', 
        guid: 'guid0',
        key: 'position.x', 
        val: 5
      }]);
    },

    'diffNodes detect child delete': function () {
      delete this.newNode.children.guid2;
      var diff = this.mulwapp.diffNodes(this.newNode, this.oldNode, 'guid0');
      assert.equals(diff, [{
        type: 'delete child', 
        guid: 'guid0',
        key: 'guid2'
      }]);
    },

    'diffNodes detect child insert': function () {
      this.newNode.children.guid3 = true;
      var diff = this.mulwapp.diffNodes(this.newNode, this.oldNode, 'guid0');
      assert.equals(diff, [{
        type: 'insert child', 
        guid: 'guid0',
        key: 'guid3'
      }]);
    },
  },

  /**
   * Test Mulwapp.diff
   */

  'test diff': {
    'setUp': function () {
      this.oldModel = {
        'guid0': {
          props: {a: 1, b: 2, c: '3po'},
          children: {'guid1': true, 'guid2': true}
        },
        'guid1': {
          props: {x: 10},
          children: {'guid3': true}
        },
        'guid2': {
          props: {x: 15},
          children: {}
        },
        'guid3': {
          props: {x: 20},
          children: {}
        },
        'guid4': {
          props: {t: 'Horse'},
          children: {}
        }
      };

      this.newModel = JSON.parse(JSON.stringify(this.oldModel));
    },

    'empty diff for equal models': function () {
      var diff = this.mulwapp.diff(this.newModel, this.oldModel, 'guid0');
      assert.equals(diff, []);
    },

    'detect change in root prop': function () {
      this.newModel.guid0.props.a = 3;
      var diff = this.mulwapp.diff(this.newModel, this.oldModel, 'guid0');
      assert.equals(diff, [{
        type: 'update prop', 
        guid: 'guid0',
        key: 'a',
        val: 3
      }]);
    },

    'detect change in non root prop': function () {
      this.newModel.guid3.props.x = 50;
      var diff = this.mulwapp.diff(this.newModel, this.oldModel, 'guid0');
      assert.equals(diff, [{
        type: 'update prop', 
        guid: 'guid3',
        key: 'x',
        val: 50
      }]);
    },

    'do not detect change in non graph object prop': function () {
      this.newModel.guid4.props.x = 50;
      var diff = this.mulwapp.diff(this.newModel, this.oldModel, 'guid0');
      assert.equals(diff, []);
    },

    'detect object delete': function () {
      delete this.newModel.guid1;
      var diff = this.mulwapp.diff(this.newModel, this.oldModel, 'guid0');
      assert.equals(diff, [{
        type: 'delete object', 
        guid: 'guid1'
      }]);
    },

    'detect object create': function () {
      var newNode = {
        props: {fish: 'chips'},
        children: {}
      };

      this.newModel.guid5 = newNode;
      var diff = this.mulwapp.diff(this.newModel, this.oldModel, 'guid0');
      assert.equals(diff, [{
        type: 'insert object',
        guid: 'guid5',
        val: newNode
      }]);
    },

    // 'detect multiple changes': function () {
    //   // TODO
    // },
  },

});
