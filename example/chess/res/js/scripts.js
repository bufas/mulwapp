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
        if (node.type == 'Group') {
          return {
            watch_props : [
              'position.x',
              'position.y',
              'position.z',
            ]
          };
        }

        return false;
      },
    },
    sync: {
      documentName: window.location.hash || 'defaultdoc',
    }
  }
);

//
// HANDLE ALL DRAGGING EVENTS
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
var DragHandler = function(canvas, draggables, plane) {
  this.canvas        = canvas;
  this.canvasWidth   = canvas.attr('width');
  this.canvasHeight  = canvas.attr('height');
  this.draggables    = draggables;
  this.plane         = plane;

  canvas.on('mousedown', this.onMouseDown.bind(this));
  canvas.on('mouseup', this.onMouseUp.bind(this));
}

DragHandler.prototype.getRelativeMousePosition = function(e) {
  return {
    'x' : ((e.pageX - $(e.target).offset().left) / this.canvasWidth) * 2 - 1,
    'y' : - ((e.pageY - $(e.target).offset().top) / this.canvasHeight) * 2 + 1
  };
}

DragHandler.prototype.getRay = function(e) {
  var mousePos = this.getRelativeMousePosition(e);
  var vector = new THREE.Vector3(mousePos.x, mousePos.y, 0.5).unproject(camera);
  return new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
}

DragHandler.prototype.onMouseDown = function(e) {
  e.preventDefault();

  var ray = this.getRay(e);
  var intersects = ray.intersectObjects(this.draggables, true);

  // Select the first element that the ray intersects
  if (intersects.length > 0) {
    var target = intersects[0];
    while (!('chess_draggable' in target.object)) {
      target.object = target.object.parent;
    }
    this.plane.position.setY(target.point.y);
    this.planeOffset = target.point.sub(target.object.position);
    this.canvas.on('mousemove', this.onMouseMove.bind(this, target.object));
  }
}

DragHandler.prototype.onMouseMove = function(piece, e) {
  e.preventDefault();

  var intersectionPoint = this.getRay(e).intersectObjects([this.plane])[0].point;
  piece.position.setX(intersectionPoint.x - this.planeOffset.x);
  piece.position.setZ(intersectionPoint.z - this.planeOffset.z);
}

DragHandler.prototype.onMouseUp = function(e) {
  event.preventDefault();
  this.canvas.off('mousemove');
}

//
// INITIALIZE AND INSERT STATS MODULE
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
var createStatsModule = function() {
  var stats = new Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild( stats.domElement );
  return stats;
}

//
// BUILD THE SCENE
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
var pieces = [];
var placement = [
  {type : 'rook',   x : 1, z : 1, color : 0xffffff},
  {type : 'knight', x : 2, z : 1, color : 0xffffff, rotate: 0.5*Math.PI, scale: 0.8},
  {type : 'bishop', x : 3, z : 1, color : 0xffffff},
  {type : 'king',   x : 4, z : 1, color : 0xffffff, scale: 0.8},
  {type : 'queen',  x : 5, z : 1, color : 0xffffff},
  {type : 'bishop', x : 6, z : 1, color : 0xffffff},
  {type : 'knight', x : 7, z : 1, color : 0xffffff, rotate: 0.5*Math.PI, scale: 0.8},
  {type : 'rook',   x : 8, z : 1, color : 0xffffff},
  {type : 'pawn',   x : 1, z : 2, color : 0xffffff},
  {type : 'pawn',   x : 2, z : 2, color : 0xffffff},
  {type : 'pawn',   x : 3, z : 2, color : 0xffffff},
  {type : 'pawn',   x : 4, z : 2, color : 0xffffff},
  {type : 'pawn',   x : 5, z : 2, color : 0xffffff},
  {type : 'pawn',   x : 6, z : 2, color : 0xffffff},
  {type : 'pawn',   x : 7, z : 2, color : 0xffffff},
  {type : 'pawn',   x : 8, z : 2, color : 0xffffff},

  {type : 'rook',   x : 1, z : 8, color : 0x333333},
  {type : 'knight', x : 2, z : 8, color : 0x333333, rotate: 1.5*Math.PI, scale: 0.8},
  {type : 'bishop', x : 3, z : 8, color : 0x333333},
  {type : 'king',   x : 4, z : 8, color : 0x333333, scale: 0.8},
  {type : 'queen',  x : 5, z : 8, color : 0x333333},
  {type : 'bishop', x : 6, z : 8, color : 0x333333},
  {type : 'knight', x : 7, z : 8, color : 0x333333, rotate: 1.5*Math.PI, scale: 0.8},
  {type : 'rook',   x : 8, z : 8, color : 0x333333},
  {type : 'pawn',   x : 1, z : 7, color : 0x333333},
  {type : 'pawn',   x : 2, z : 7, color : 0x333333},
  {type : 'pawn',   x : 3, z : 7, color : 0x333333},
  {type : 'pawn',   x : 4, z : 7, color : 0x333333},
  {type : 'pawn',   x : 5, z : 7, color : 0x333333},
  {type : 'pawn',   x : 6, z : 7, color : 0x333333},
  {type : 'pawn',   x : 7, z : 7, color : 0x333333},
  {type : 'pawn',   x : 8, z : 7, color : 0x333333}
];

var insertPieces = function(loader) {
  var nextPieceIndex = 0;
  var insertPiece = function () {
    if (nextPieceIndex == placement.length) {
      renderLoop();
      return;
    }
    var pos = placement[nextPieceIndex];
    nextPieceIndex++;

    loader.load('res/img/' + pos.type + '.obj', function (piece) {
      if (pos.scale) {
        piece.scale.set(pos.scale, pos.scale, pos.scale);
      } else {
        piece.scale.set(0.9, 0.9, 0.9);
      }
      piece.position.set(pos.x - 4.5, 0, pos.z - 4.5);
      if (pos.rotate) {
        piece.rotateOnAxis(new THREE.Vector3(0, 1, 0), pos.rotate);
      }
      piece.chess_draggable = true;
      piece.traverse(function (c) {
        if (c instanceof THREE.Mesh) {
          c.material.setValues({ color: pos.color });
        }
      });
      scene.add(piece);
      pieces.push(piece);

      insertPiece();
    });
  }
  insertPiece();
}

// Constants
var sceneWidth  = 800;
var sceneHeight = 600;

// Set up the scene #boilerplate
var scene    = new THREE.Scene();
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(sceneWidth, sceneHeight);
renderer.setClearColor(0xdddddd, 1);

// Create the chessboard with the center of the top surface at the origin
var board = new THREE.Mesh(
  new THREE.PlaneGeometry(8, 8, 1, 1),
  new THREE.MeshLambertMaterial({
    map : THREE.ImageUtils.loadTexture('res/img/chessboard.jpg')
  })
);
board.rotation.x -= THREE.Math.degToRad(90);
scene.add(board);

// Create a huge invisible plane (for dragging)
var plane = new THREE.Mesh(
  new THREE.PlaneGeometry(2000, 2000, 10, 10),
  new THREE.MeshBasicMaterial({ 
    color       : 0x000000, 
    opacity     : 0.25, 
    transparent : true 
  })
);
plane.rotation.x -= THREE.Math.degToRad(90);
plane.visible = false;
scene.add(plane);

// Setup camera
var camera = new THREE.PerspectiveCamera(85, sceneWidth/sceneHeight, 0.1, 1000);
camera.position.set(0, 6, 0);
camera.lookAt(new THREE.Vector3(0, 0, 0));
scene.add(camera);

// Insert a light source
var light = new THREE.PointLight(0xdfdfdf);
camera.add(light);

// Add canvas to the DOM
jqRendererElement = $(renderer.domElement);
$(document.body).prepend(jqRendererElement);

// Add the drag handler
var dragHandler = new DragHandler(jqRendererElement, pieces, plane);

// Insert the stats module (counts fps)
var stats = createStatsModule();

// Set button actions
$('#black').on('click', function() { 
  camera.position.set(0, 6, 5);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
});
$('#white').on('click', function() {
  camera.position.set(0, 6, -5);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
});
$('#spectate').on('click', function() {
  camera.position.set(-5, 6, 0);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
});

insertPieces(new THREE.OBJLoader());

// Create and start the render loop
function renderLoop() {
  requestAnimationFrame(renderLoop);
  stats.begin();
  mulwapp.animationFrameFn(scene);
  renderer.render(scene, camera);
  stats.end();
};
