//
// INITIALIZE MULWAPP
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
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
            ]
          };
        } 
        else {
          return false;
        }
      },
    },
    sync: {
      documentName: 'abekat2',
    }
  }
);

//
// NORMAL STUFF
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
var sceneWidth = 500;
var sceneHeight = 500;

var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(sceneWidth, sceneHeight);
renderer.setClearColor(0xdddddd, 1);

var boxgeom = new THREE.BoxGeometry(1.2, 1.2, 1.2);
var lambmat = new THREE.MeshLambertMaterial({color: '#ff0000'});
var cube = new THREE.Mesh(boxgeom, lambmat);
scene.add(cube);

// Camera
var camera = new THREE.PerspectiveCamera(85, sceneWidth/sceneHeight, 0.1, 1000);
camera.position.set(1, 2, 1.5);
camera.lookAt(new THREE.Vector3(0, 0, 0));
scene.add(camera);

// Light
var light = new THREE.PointLight(0xffffff);
camera.add(light);

document.body.appendChild(renderer.domElement);

// Action
renderer.domElement.addEventListener('click', function() {
  cube.material.color.r = Math.random();
  cube.material.color.g = Math.random();
  cube.material.color.b = Math.random();
}, false);

(function renderLoop() {
  requestAnimationFrame(renderLoop);
  mulwapp.animationFrameFn(scene);
  renderer.render(scene, camera);
})();
