/**
 * Polyfill for Array.prototype.find
 */
if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this == null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}


/**
 * A Library Adapter Layer for ThreeJS 
 */

var THREE = require('three');

/**
 * Constructor for the ThreeJS Library Adapter Layer.
 * @param {object} config - A configuration object. Must contain a 'shareConf' 
 *   function.
 */
module.exports = ThreeAdapter = function (config) {
  this.config = config;
  this.allLocalObjects = {};
}

/**
 *
 */
ThreeAdapter.prototype.initialize = function (mulwapp) {
  this.setupConstructorInterceptors(mulwapp, this.config.constructors);
}

/**
 * Calculates the diff model
 * @param {THREE.Scene} root - The scene graph root
 * @returns The diff model of the current scene graph
 */
ThreeAdapter.prototype.calculateDiffModel = function (root) {
  var doc = {};

  (function aux (node, path) {
    var docNode = {
      'props': {}, 
      'children': {}
    };

    var conf = this.config.shareConf(node, path, root);

    if (conf.watch_props) {
      conf.watch_props.forEach(function (prop) {
        var val = node;
        prop.split('.').forEach(function (step) {
          val = val[step];
        });
        docNode.props[prop] = val;
      });
    }

    node.children.forEach(function (child, idx) {
      path.push(idx);
      aux.call(this, child, path);
      path.pop();
      docNode.children[child.mulwapp_guid] = true;
    }, this);

    doc[node.mulwapp_guid] = docNode;
  }).call(this, root, []);

  return doc;
}

/**
 * Intercepts constructor calls to create a create specification before 
 * creating the object.
 * @param {Mulwapp} mulwapp - A reference to a Mulwapp object
 * @param {Array} constructors - A list of constructors to intercept
 */
ThreeAdapter.prototype.setupConstructorInterceptors = function (mulwapp, constructors) {
  var _this = this;

  constructors.forEach(function (name) {
    var backupName = '_' + name;

    // Backup the original constructor somewhere
    THREE[backupName] = THREE[name];

    // Override with your own, then call the original
    THREE[name] = function () {
      // Decorate constructor
      if (! (this.mulwapp_guid in _this.all_local_objects)) {
        var spec = _this.generateCreateSpec(name, this.mulwapp_guid, arguments);
        mulwapp.addToCreateList(spec);
      }

      // Call original constructor
      THREE[backupName].apply(this, arguments);
    }

    // Extend the original class
    THREE[name].prototype = Object.create(THREE[backupName].prototype);
  });
}

/**
 * Generate the specification that is used by remote peers to replay
 * object creation.
 * @param {string} name The name of the object type
 * @param {string} id The mulwapp_guid of the object
 * @param {Array} argum The arguments given to the local constructor
 */
ThreeAdapter.prototype.generateCreateSpec = function (name, id, argum) {
  var args = [];

  argum.forEach(function (arg, idx) {
    if ((typeof arg) == 'object' && arg.mulwapp_guid != undefined) {
      args.push({primitive: false, value: arg.mulwapp_guid});
    } else {
      args.push({primitive: true, value: arg});
    }
  });

  return {type: name, mulwapp_guid: id, args: args}
}

/**
 * Constructs an object from a specification made by Mulwapp.generateCreateSpec
 * @param {Object} spec Specification needed to create the object.
 * @return {Object} The object created
 */
ThreeAdapter.prototype.constructorReplayer = function (spec) {
  function F(args) {
    return THREE[spec.type].apply(this, args);
  }
  F.prototype = THREE[spec.type].prototype;

  // Parse argument list
  var args = [];
  spec.args.forEach(function (e) {
    if (e.primitive) args.push(e.value);
    else args.push(this.lookupNodeByGuid(e.value));
  }, this);

  // Create object
  var o = new F(args);
  o.mulwapp_guid = spec.mulwapp_guid;
  this.allLocalObjects[spec.mulwapp_guid] = o;

  return o;
}

/**
 *
 */
ThreeAdapter.prototype.modelUpdater = function (op) {
  var node = this.lookupNodeByGuid(op.guid);

  if (op.type == 'update prop') {
    var keyPath = op.key.split('.');
    keyPath.slice(0, -1).forEach(function (step) {
      node = node[step];
    });
    node[keyPath[keyPath.length - 1]] = op.val;
  }
  else if (op.type == 'insert child') {
    var child = this.lookupNodeByGuid(op.key);
    node.add(child);
  }
  else if (op.type == 'delete child') {
    var child = this.lookupNodeByGuid(op.key);
    node.remove(child);
  }
  else if (op.type == 'insert object') {
    var createSpec = val.create_spec;
    this.constructorReplayer(createSpec);
  }
  else if (op.type == 'delete object') {
    delete this.allLocalObjects[guid];
    delete node;
  }
}

/**
 *
 */
ThreeAdapter.prototype.lookupNodeByGuid = function (guid) {
  return this.allLocalObjects(guid);
}
