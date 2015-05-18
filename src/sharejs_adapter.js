/**
 * ShareJS Adapter for Mulwapp
 */

/**
 * @param {Mulwapp} mulwapp - A reference to a Mulwapp object
 * @param {object} config - A configuration object
 */
SharejsAdapter = function (config) {
  this.docName = config.documentName;
}

/**
 *
 */
SharejsAdapter.prototype.initialize = function (mulwapp) {
  var _this = this;
  return new Promise(function (resolve, reject) {
    // Open a connection to the server
    sharejs.open(_this.docName, 'json', function (_, doc) {
      // Bind Mulwapp handler to remote operation events
      doc.on('remoteop', function (ops) {
        var mulwappOps = _this.convertOperations(ops);
        mulwapp.handleRemoteOperations(mulwappOps);
      });

      if (doc.get() == null) {
        // Initialize document (i.e. I'm the first client)
        doc.set({});
      }

      _this.doc = doc;
      resolve(doc);
    });
  });
}

/**
 * Applies a list of operations to the synchronized model
 * @param {Array} operations - A list of operations
 */
SharejsAdapter.prototype.applyOperations = function (operations) {
  if (!this.doc) throw 'applyOperations called before doc is ready';

  operations.forEach(function (op) {
    this.applyOperation(op, this.doc);
  }, this);
}

/**
 *
 */
SharejsAdapter.prototype.applyOperation = function (op, doc) {
  console.log(op);
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
    doc.at([op.guid]).set(op.val);
  }
  else if (op.type == 'delete object') {
    doc.at([op.guid]).set();
  }
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

SharejsAdapter.prototype.getSnapshot = function () {
  if (!this.doc) throw 'getSnapshot called before doc is ready';
  return this.doc.get();
}