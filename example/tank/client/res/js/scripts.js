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
        else if (node.type == 'Mesh' || node.type == 'Group') {
          return {
            watch_props: [
              'position.x',
              'position.y',
              'position.z',
              'rotation.x',
              'rotation.y',
              'rotation.z',
            ]
          };
        } 
        else {
          return false;
        }
      },
    },
    sync: {
      documentName: 'abetank2',
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

var geo_tread1 = new THREE.BoxGeometry(1, .8, 6.5);
var geo_tread2 = new THREE.BoxGeometry(1, .8, 6.5);
var geo_base   = new THREE.BoxGeometry(5, 2, 7);
var geo_turret = new THREE.BoxGeometry(3, 1.5, 3.5);
var geo_cannon = new THREE.BoxGeometry(.6, .5, 6);

var mat_treads = new THREE.MeshLambertMaterial({color: '#ffffaa'});
var mat_base   = new THREE.MeshLambertMaterial({color: '#aaaaff'});
var mat_turret = new THREE.MeshLambertMaterial({color: '#ffaaaa'});
var mat_cannon = new THREE.MeshLambertMaterial({color: '#aaffaa'});

var tread1 = new THREE.Mesh(geo_tread1, mat_treads);
var tread2 = new THREE.Mesh(geo_tread2, mat_treads);
var base   = new THREE.Mesh(geo_base,   mat_base);
var turret = new THREE.Mesh(geo_turret, mat_turret);
var cannon = new THREE.Mesh(geo_cannon, mat_cannon);
var tank   = new THREE.Group();
var pivot  = new THREE.Group();

// Establish the hierarchy
pivot.add(cannon);
turret.add(pivot);
base.add(turret);
base.add(tread1);
base.add(tread2);
tank.add(base);

// Offset positions
tread1.position.y -= (geo_tread1.parameters.height / 2) + (geo_base.parameters.height / 2);
tread2.position.y -= (geo_tread2.parameters.height / 2) + (geo_base.parameters.height / 2);
tread1.position.x -= (geo_base.parameters.width / 2) - (geo_tread1.parameters.width / 2) - (geo_base.parameters.width / 30);
tread2.position.x += (geo_base.parameters.width / 2) - (geo_tread2.parameters.width / 2) - (geo_base.parameters.width / 30);
cannon.position.z += (geo_cannon.parameters.depth / 2);
pivot.position.z += (geo_turret.parameters.depth / 2) - (geo_cannon.parameters.height / 2);
turret.position.y += (geo_turret.parameters.height / 2) + (geo_base.parameters.height / 2);

scene.add(tank);

// Camera
// var camera = new THREE.PerspectiveCamera(85, sceneWidth/sceneHeight, 0.1, 1000);
var of = 25;
var camera = new THREE.OrthographicCamera(sceneWidth / -2 / of, sceneWidth / 2 / of, sceneHeight / 2 / of, sceneHeight / -2 / of, 0.1, 1000);
camera.position.set(8, 8, 13);
camera.lookAt(new THREE.Vector3(0, 0, 0));
scene.add(camera);

// Light
var light = new THREE.PointLight(0xffffff);
camera.add(light);

document.body.appendChild(renderer.domElement);

// Action
var keyboard     = new THREEx.KeyboardState(document);
var turretFactor = 0.03;
var cannonFactor = 0.02;
var moveFactor   = 0.2;
var turnFactor   = 0.02;

var handleInput = function () {
  // Cannon
  if (keyboard.pressed('up')) {
    if (pivot.rotation.x > -45 * Math.PI / 180) {
      pivot.rotation.x -= cannonFactor;
    }
  }
  else if (keyboard.pressed('down')) {
    if (pivot.rotation.x < 15 * Math.PI / 180) {
      pivot.rotation.x += cannonFactor;
    }
  }

  // Turret
  if (keyboard.pressed('left')) {
    turret.rotation.y += turretFactor;
  }
  else if (keyboard.pressed('right')) {
    turret.rotation.y -= turretFactor;
  }

  // Base
  if (keyboard.pressed('w')) {
    tank.translateZ(moveFactor);
  }
  else if (keyboard.pressed('s')) {
    tank.translateZ(-moveFactor);
  }
  if (keyboard.pressed('a')) {
    tank.rotation.y += turnFactor;
  }
  else if (keyboard.pressed('d')) {
    tank.rotation.y -= turnFactor;
  }
  
};

(function renderLoop() {
  requestAnimationFrame(renderLoop);
  handleInput();
  mulwapp.animationFrameFn(scene);
  renderer.render(scene, camera);
})();
