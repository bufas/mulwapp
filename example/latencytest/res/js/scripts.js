//
// INITIALIZE MULWAPP
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
var mulwapp = new Mulwapp(
  ThreeAdapter, 
  SharejsAdapter, 
  {
    lal: {
      shareConf: function(node, path, root) {
        if (node.type == 'Scene') {
          return {};
        } 
        else if (node.type == 'Mesh') {
          return {
            watch_props: [
              'material.color.r',
              'material.color.g',
              'material.color.b',
              'position.x',
              'position.y',
              'position.z',
            ]
          };
        } 
        else {
          return false;
        }
      },
    },
    sync: {
      documentName: window.location.hash || 'defaultdoc',
    }
  }
);

//
// NORMAL STUFF
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
var sceneWidth = 500;
var sceneHeight = 500;

var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(sceneWidth, sceneHeight);
renderer.setClearColor(0xffffff, 1);

// Create some boxes!
var boxcount = 100;
for (var i = 0; i < boxcount; i++) {
  var boxgeom = new THREE.BoxGeometry(1, 1, 1);
  var cube = new THREE.Mesh(boxgeom);
  cube.position.set(Math.random() * 20 - 16, 0, Math.random() * 10 - 5);
  scene.add(cube);
}

// Camera
var camera = new THREE.PerspectiveCamera(85, sceneWidth/sceneHeight, 0.1, 1000);
camera.position.set(6, 5, 0);
camera.lookAt(new THREE.Vector3(0, 0, 0));
scene.add(camera);

// Light
var light = new THREE.PointLight(0xffffff);
camera.add(light);

document.getElementById('canvasdiv').appendChild(renderer.domElement);

var moveBoxes = function () {
  console.profile('Hansi');
  var n = Math.min(boxcount, parseInt($('#nodecnt').val()));

  for (var i = 0; i < n; i++) {
    var box = scene.children[i];
    box.position.set(Math.random() * 20 - 16, 0, Math.random() * 10 - 5);
  }

  var ts = Date.now();
  $('#timestamp_sent').append($('<div>').text(ts + ' ' + n + ' ' + boxcount));
}

// Action
$('#move_box').on('click', moveBoxes);

mulwapp.setInitialized(scene);

var stats = (function() {
  var stats = new Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);
  return stats;
})();

(function renderLoop() {
  stats.begin();
  requestAnimationFrame(renderLoop);
  mulwapp.animationFrameFn(scene);
  renderer.render(scene, camera);
  stats.end();
  console.profileEnd();
})();
