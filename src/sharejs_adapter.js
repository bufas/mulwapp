/**
 * ShareJS Adapter for Mulwapp
 */

var sharejs = require('share').client;

/**
 * @param {Mulwapp} mulwapp - A reference to a Mulwapp object
 * @param {object} config - A configuration object
 */
module.exports = SharejsAdapter = function (mulwapp, config) {
  var _this = this
  this.docName = config.documentName;

  // Open a connection to the server
  sharejs.open(this.docName, 'json', function (_, doc) {
    // Bind Mulwapp handler to remote operation events
    doc.on('remoteop', function (ops) {
      var mulwappOps = _this.convertOperations(ops);
      mulwapp.handleRemoteOperations(mulwappOps);
    });

    if (doc.get() == null) {
      // Initialize document (i.e. I'm the first client)
      doc.set({});
    }
  });
}

SharejsAdapter.prototype.getDoc = function () {
  return new Promise(function (resolve, reject) {
    sharejs.open(this.docName, 'json', function (err, doc) {
      if (err) {
        reject(err);
      } else {
        resolve(doc);
      }
    });
  })
}

/**
 * Applies a list of operations to the synchronized model
 * @param {Array} operations - A list of operations
 */
SharejsAdapter.prototype.applyOperations = function (operations) {
  var _this = this;
  this.getDoc.then(function (doc) {
    operations.forEach(function (op) {
      _this.applyOperation(op, doc);
    });
  });
}

/**
 *
 */
SharejsAdapter.prototype.applyOperation = function (op, doc) {
  if (op.type == 'update prop') {
    doc.at([op.guid, 'props', op.key]).set(op.val);
  }
  else if (op.type == 'insert child') {
    doc.at([op.guid, 'children', op.key]).set(1); // 1 is a dummy value
  }
  else if (op.type == 'delete child') {
    doc.at([op.guid, 'children', op.key]).set();
  }
  else if (op.type == 'insert object') {
    doc.at([op.guid, op.key]).set(op.val);
  }
  else if (op.type == 'delete object') {
    doc.at([op.guid, op.key]).set();
  }
}

/**
 * Adds a create specification to the create list in the synchronized document.
 * @param {object} createSpecification - The createSpecification
 */
SharejsAdapter.prototype.addToCreateList = function (createSpecification) {
  var mulwapp_guid = createSpecification.mulwapp_guid;
  this.doc.at(['create', mulwapp_guid]).set(createSpecification);
}
/**
 * Convert ShareJS operations to the standard Mulwapp format
 * An operation has four properties
 *   - type: the type of operation, one of the following
 *     - update prop
 *     - insert child
 *     - delete child
 *     - insert object
 *     - delete object
 *   - guid: The GUID of the object operated on
 *   - key: The prop name or child GUID (undefined on object ops)
 *   - val: The value to insert or update to (undefined on delet and child ops)
 * @param {Array} operations - A list of ShareJS operations
 * @returns {Array} A list of standard Mulwapp operations
 */
SharejsAdapter.prototype.convertOperations = function (operations) {
  var ops = [];

  operations.forEach(function (op) {
    var o = {
      type: 'update prop', 
      guid: op.p[0],
      key: undefined,
      val: undefined
    }

    if (op.oi != void 0 && op.od == void 0) o.type = 'insert';
    else if (op.oi == void 0 && op.od != void 0) o.type = 'delete';

    if (o.type == 'update prop') {
      o.key = op.p[2];
      o.val = op.oi;
    } else if (op.p.length == 3 && op.p[1] == 'children') {
      o.key = op.p[2];
      o.type += ' child';
    } else if (op.p.length == 2) {
      if (o.type == 'insert') o.val = op.oi;
      o.type += ' object';
    }

    ops.push(o);
  });

  return ops;
}

