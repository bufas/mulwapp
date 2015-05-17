// var proxyquire = require('proxyquire');
// var buster = require('buster');
// var assert = buster.referee.assert;
// var refute = buster.referee.refute;

// buster.testCase('SharejsAdapter', {
//   'setUp': function () {
//     var doc = this.doc = {
//       on: function () {},
//       get: function () {},
//       set: function () {},
//       at: function () {},
//     }

//     var SharejsAdapter = proxyquire.noCallThru().load(
//       '../../src/sharejs_adapter', { 
//         share: {
//           client: {
//             open: function (_, _, fn) {
//               fn(undefined, doc);
//             }
//           }
//         }
//       }
//     );

//     this.sjs = new SharejsAdapter(dummy, {documentName: 'abekat'});
//   },

//   /**
//    * Test SharejsAdapter.applyOperations
//    */

//   'test test': function () {
//     assert.equals(this.sjs.docName, 'abekat');
//   }
// });