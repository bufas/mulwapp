/**
 * Synchronization client
 *
 * The responsibility of the synchronization client is to synchronize the 
 * shared model with the server using ShareJS.
 *
 * It leverages the Library Adaptation Layer (LAL) to compute a filtered and 
 * generic view of the local model. The LAL is also leveraged to udpate
 * the local model given an operation from the server.
 *
 * The synchronization is initialized by the Application Layer (AL) which calls
 * the animation frame function.
 */

/**
 * @param {Function} Lal - A reference to the LAL constructor
 * @param {Function} SyncAdapter - A reference to a synchronization adapter 
 *   constructor
 * @param {object} config - A configuration object. Must contain the two props 
 *   'sync' and 'lal'.
 */
Mulwapp = function (Lal, SyncAdapter, config) {
  var _this = this;

  this.lal = new Lal(config.lal);
  this.lal.initialize();

  this.syncIsReady = false;
  this.syncAdapter = new SyncAdapter(config.sync);
  this.syncAdapter.initialize(this).then(function (doc) {
    _this.syncIsReady = true;
  });
}

/**
 * Function to be called by the AL every animation frame
 * @param {object} root - A reference to the root node of the scene
 */
Mulwapp.prototype.animationFrameFn = function (root) {
  if (!this.syncIsReady) return;
  var diffModel = this.lal.calculateDiffModel(root);
  var syncModel = this.syncAdapter.getSnapshot();
  var diff = this.diff(diffModel, syncModel, root.mulwapp_guid);
  this.syncAdapter.applyOperations(diff);
}

/**
 * Calculates the union of two object's keys
 * @param {object} obj1 - An object
 * @param {object} obj2 - Another object
 * @returns {Array} A list containing the union of the two object's keys
 */
var keyUnion = function (obj1, obj2) {
  var keys1 = Object.keys(obj1);
  var keys2 = Object.keys(obj2);

  var allKeysObj = {}
  keys1.concat(keys2).forEach(function (key) {
    allKeysObj[key] = true;
  });

  return Object.keys(allKeysObj);
}

/**
 * Checks the two nodes for differences, and updates the changeHandler.
 * Assumes that they will always have the same set of properties.
 * @param {Object} oldNode - The old node
 * @param {Object} newNode - The new node
 * @param {Array} path - The path to newNode from the scene root
 */
Mulwapp.prototype.diffNodes = function (diffNode, syncNode, guid) {
  var diff = [];

  // Check props
  Object.keys(diffNode.props).forEach(function (key) {
    if (diffNode.props[key] != syncNode.props[key]) {
      diff.push({
        type: 'update prop',
        guid: guid,
        key: key,
        val: diffNode.props[key]
      });
    }
  }, this);

  // Check children
  var diffChildren = diffNode.children;
  var syncChildren = syncNode.children;
  var allChildren = keyUnion(diffChildren, syncChildren);
  allChildren.forEach(function (child) {
    if (child in diffChildren && child in syncChildren) {
      // Nothing has happened
    } 
    else if (child in diffChildren && !(child in syncChildren)) {
      // Child added
      diff.push({
        type: 'insert child',
        guid: guid,
        key: child
      });
    } 
    else {
      // Child removed
      diff.push({
        type: 'delete child',
        guid: guid,
        key: child
      });
    }
  }, this);

  return diff;
}

/**
 * Calculates the differences between the diff model and the sync model.
 * @param {object} diffModel - 
 * @param {object} syncModel - 
 * @param {string} rootGuid - The GUID of the root node in the scene graph
 * @returns {Array} An array of differences between the two models
 */
Mulwapp.prototype.diff = function (diffModel, syncModel, rootGuid) {
  var diff = [];

  // Run through all keys
  var unprocessedGraphNodes = [rootGuid];
  while (unprocessedGraphNodes.length > 0) {
    var guid = unprocessedGraphNodes.pop();
    if (guid in diffModel && guid in syncModel) {
      // Object exists both in local and sync model, check for updates
      var diffNode = diffModel[guid];
      var syncNode = syncModel[guid];
      diff = diff.concat(this.diffNodes(diffNode, syncNode, guid));

      var children = Object.keys(diffNode.children);
      unprocessedGraphNodes = unprocessedGraphNodes.concat(children);
    }
  }

  var allKeys = keyUnion(diffModel, syncModel);
  allKeys.forEach(function (guid) {
    if (guid in diffModel && !(guid in syncModel)) {
      // Object created
      var diffNode = diffModel[guid];
      diff.push({
        type: 'insert object', 
        guid: guid,
        val: diffNode
      });
    }
    else if (!(guid in diffModel) && guid in syncModel) {
      // Object deleted
      diff.push({
        type: 'delete object', 
        guid: guid
      });
    }
  }, this);

  return diff;
}

/**
 * Mediates remote operations sent by the sync adapter to the LAL
 * @param {Array} operations - An array of operations
 */
Mulwapp.prototype.handleRemoteOperations = function (operations) {
  operations.forEach(this.lal.updateModel);
}
