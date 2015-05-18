/**
 * A Library Adapter Layer for ThreeJS 
 */

/**
 * Constructor for the ThreeJS Library Adapter Layer.
 * @param {object} config - A configuration object. Must contain a 'shareConf' 
 *   function.
 */
ThreeAdapter = function (config) {
  this.config = config;
  this.allLocalObjects = {};
}

/**
 *
 */
ThreeAdapter.prototype.initialize = function (mulwapp) {
  this.addGuidProperty();
  this.setupConstructorInterceptors(mulwapp, this.getConstructors());
}

/**
 *
 */
ThreeAdapter.prototype.addGuidProperty = function () {
  if ('mulwapp_guid' in THREE.Object3D.prototype) {
    return;
  }
  var propobj = {
    get: function () {
      if (this._mulwapp_guid == undefined) {
        this._mulwapp_guid = '' + Math.random();
      }
      return this._mulwapp_guid;
    },
    set: function (x) { this._mulwapp_guid = x; } 
  };

  Object.defineProperty(THREE.Object3D.prototype, 'mulwapp_guid', propobj);
  Object.defineProperty(THREE.Geometry.prototype, 'mulwapp_guid', propobj);
  Object.defineProperty(THREE.Material.prototype, 'mulwapp_guid', propobj);
}

/**
 * Calculates the diff model
 * @param {THREE.Scene} root - The scene graph root
 * @returns The diff model of the current scene graph
 */
ThreeAdapter.prototype.calculateDiffModel = function (root) {
  var doc = {};

  (function aux (node, path, parentNode) {
    var docNode = {
      'create_spec': node.mulwapp_create_spec,
      'props': {}, 
      'children': {}
    };

    if (node instanceof THREE.Object3D) {
      var conf = this.config.shareConf(node, path, root);

      // Return if this object is not to be synchronized
      if (!conf) return;

      // If called by a parent, set the relation
      if (parentNode) {
        parentNode.children[node.mulwapp_guid] = true;
      }

      // Set properties in the doc node
      if (conf.watch_props) {
        conf.watch_props.forEach(function (prop) {
          var val = node;
          prop.split('.').forEach(function (step) {
            val = val[step];
          });
          docNode.props[prop] = val;
        });
      }

      // Recurse on children
      node.children.forEach(function (child, idx) {
        var childPath = path.splice();
        childPath.push(idx);
        aux.call(this, child, childPath, docNode);
      }, this);
    }

    // Recurse on dependencies from create spec
    node.mulwapp_create_spec.args.forEach(function (arg) {
      if (!arg.primitive) {
        aux.call(this, this.lookupNodeByGuid(arg.value), undefined, undefined);
      }
    }, this)

    doc[node.mulwapp_guid] = docNode;
  }).call(this, root, [], undefined);

  return doc;
}

/**
 * Intercepts constructor calls to create a create specification before 
 * creating the object.
 * @param {Mulwapp} mulwapp - A reference to a Mulwapp object
 * @param {Array} constructors - A list of constructors to intercept
 */
// var threeadaptercreatecounter = 0; // TODO ONLY FOR TESTING PURPOSES REMOVE AFTER
// var threeadaptercreatenames = ['scene', 'renderer', 'boxgeom', 'lambmat', 'cube', 'camera', 'light']; // TODO ONLY FOR TESTING PURPOSES REMOVE AFTER
var nextIncrementalGuid = 0;
ThreeAdapter.prototype.setupConstructorInterceptors = function (mulwapp, constructors) {
  var _this = this;

  constructors.forEach(function (name) {
    var backupName = '_' + name;

    // Backup the original constructor somewhere
    THREE[backupName] = THREE[name];

    // Override with your own, then call the original
    THREE[name] = function () {
      // Decorate constructor
      if (!this._mulwapp_remote_create) {

        if (mulwapp.applicationInitializationOngoing) {
          this.mulwapp_guid = 'guid' + nextIncrementalGuid;
          nextIncrementalGuid++;
        }

        // TODO ONLY FOR TESTING PURPOSES REMOVE AFTER
        // if (threeadaptercreatecounter < threeadaptercreatenames.length) {
        //   this.mulwapp_guid = threeadaptercreatenames[threeadaptercreatecounter];
        //   threeadaptercreatecounter++;
        // }

        var spec = _this.generateCreateSpec(name, this.mulwapp_guid, arguments);
        this.mulwapp_create_spec = spec;
        _this.allLocalObjects[this.mulwapp_guid] = this;
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
 * @param {string} name - The name of the object type
 * @param {string} guid - The mulwapp_guid of the object
 * @param {Array} argum - The arguments given to the local constructor
 */
ThreeAdapter.prototype.generateCreateSpec = function (name, guid, argum) {
  var args = [];

  // Argum is not an Array, but function parameters which is 'array like'
  for (var i = 0; i < argum.length; i++) {
    var arg = argum[i];
    if ((typeof arg) == 'object' && arg.mulwapp_guid != undefined) {
      args.push({primitive: false, value: arg.mulwapp_guid});
    } else {
      args.push({primitive: true, value: arg});
    }
  }

  return {type: name, mulwapp_guid: guid, args: args}
}

/**
 * Constructs an object from a specification made by Mulwapp.generateCreateSpec
 * @param {Object} spec Specification needed to create the object.
 * @return {Object} The object created
 */
ThreeAdapter.prototype.constructorReplayer = function (spec) {
  function F(args) {
    this._mulwapp_remote_create = true;
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
    var createSpec = op.val.create_spec;
    this.constructorReplayer(createSpec);
  }
  else if (op.type == 'delete object') {
    delete this.allLocalObjects[op.guid];
  }
}

/**
 *
 */
ThreeAdapter.prototype.lookupNodeByGuid = function (guid) {
  return this.allLocalObjects[guid];
}

ThreeAdapter.prototype.getConstructors = function () {
  return [
    // "REVISION",
    // "log",
    // "warn",
    // "error",
    // "MOUSE",
    // "CullFaceNone",
    // "CullFaceBack",
    // "CullFaceFront",
    // "CullFaceFrontBack",
    // "FrontFaceDirectionCW",
    // "FrontFaceDirectionCCW",
    // "BasicShadowMap",
    // "PCFShadowMap",
    // "PCFSoftShadowMap",
    // "FrontSide",
    // "BackSide",
    // "DoubleSide",
    // "NoShading",
    // "FlatShading",
    // "SmoothShading",
    // "NoColors",
    // "FaceColors",
    // "VertexColors",
    // "NoBlending",
    // "NormalBlending",
    // "AdditiveBlending",
    // "SubtractiveBlending",
    // "MultiplyBlending",
    // "CustomBlending",
    // "AddEquation",
    // "SubtractEquation",
    // "ReverseSubtractEquation",
    // "MinEquation",
    // "MaxEquation",
    // "ZeroFactor",
    // "OneFactor",
    // "SrcColorFactor",
    // "OneMinusSrcColorFactor",
    // "SrcAlphaFactor",
    // "OneMinusSrcAlphaFactor",
    // "DstAlphaFactor",
    // "OneMinusDstAlphaFactor",
    // "DstColorFactor",
    // "OneMinusDstColorFactor",
    // "SrcAlphaSaturateFactor",
    // "MultiplyOperation",
    // "MixOperation",
    // "AddOperation",
    // "UVMapping",
    // "CubeReflectionMapping",
    // "CubeRefractionMapping",
    // "EquirectangularReflectionMapping",
    // "EquirectangularRefractionMapping",
    // "SphericalReflectionMapping",
    // "RepeatWrapping",
    // "ClampToEdgeWrapping",
    // "MirroredRepeatWrapping",
    // "NearestFilter",
    // "NearestMipMapNearestFilter",
    // "NearestMipMapLinearFilter",
    // "LinearFilter",
    // "LinearMipMapNearestFilter",
    // "LinearMipMapLinearFilter",
    // "UnsignedByteType",
    // "ByteType",
    // "ShortType",
    // "UnsignedShortType",
    // "IntType",
    // "UnsignedIntType",
    // "FloatType",
    // "HalfFloatType",
    // "UnsignedShort4444Type",
    // "UnsignedShort5551Type",
    // "UnsignedShort565Type",
    // "AlphaFormat",
    // "RGBFormat",
    // "RGBAFormat",
    // "LuminanceFormat",
    // "LuminanceAlphaFormat",
    // "RGBEFormat",
    // "RGB_S3TC_DXT1_Format",
    // "RGBA_S3TC_DXT1_Format",
    // "RGBA_S3TC_DXT3_Format",
    // "RGBA_S3TC_DXT5_Format",
    // "RGB_PVRTC_4BPPV1_Format",
    // "RGB_PVRTC_2BPPV1_Format",
    // "RGBA_PVRTC_4BPPV1_Format",
    // "RGBA_PVRTC_2BPPV1_Format",
    // "Projector",
    // "CanvasRenderer",
    // "Color",
    // "ColorKeywords",
    // "Quaternion",
    // "Vector2",
    // "Vector3",
    // "Vector4",
    // "Euler",
    // "Line3",
    // "Box2",
    // "Box3",
    // "Matrix3",
    // "Matrix4",
    // "Ray",
    // "Sphere",
    // "Frustum",
    // "Plane",
    // "Math",
    // "Spline",
    // "Triangle",
    // "Clock",
    // "EventDispatcher",
    // "Raycaster",
    // "Object3D",
    // "Object3DIdCount",
    // "Face3",
    // "Face4",
    // "BufferAttribute",
    // "Int8Attribute",
    // "Uint8Attribute",
    // "Uint8ClampedAttribute",
    // "Int16Attribute",
    // "Uint16Attribute",
    // "Int32Attribute",
    // "Uint32Attribute",
    // "Float32Attribute",
    // "Float64Attribute",
    // "DynamicBufferAttribute",
    "BufferGeometry",
    // "Geometry",
    // "GeometryIdCount",
    // "Camera",
    // "CubeCamera",
    // "OrthographicCamera",
    "PerspectiveCamera",
    // "Light",
    // "AmbientLight",
    // "AreaLight",
    // "DirectionalLight",
    // "HemisphereLight",
    "PointLight",
    // "SpotLight",
    // "Cache",
    // "Loader",
    // "XHRLoader",
    // "ImageLoader",
    // "JSONLoader",
    // "LoadingManager",
    // "DefaultLoadingManager",
    // "BufferGeometryLoader",
    // "MaterialLoader",
    // "ObjectLoader",
    // "TextureLoader",
    // "BinaryTextureLoader",
    // "DataTextureLoader",
    // "CompressedTextureLoader",
    // "Material",
    // "MaterialIdCount",
    // "LineBasicMaterial",
    // "LineDashedMaterial",
    // "MeshBasicMaterial",
    "MeshLambertMaterial",
    // "MeshPhongMaterial",
    // "MeshDepthMaterial",
    // "MeshNormalMaterial",
    // "MeshFaceMaterial",
    // "PointCloudMaterial",
    // "ParticleBasicMaterial",
    // "ParticleSystemMaterial",
    // "ShaderMaterial",
    // "RawShaderMaterial",
    // "SpriteMaterial",
    // "Texture",
    // "TextureIdCount",
    // "CubeTexture",
    // "CompressedTexture",
    // "DataTexture",
    // "VideoTexture",
    // "Group",
    // "PointCloud",
    // "ParticleSystem",
    // "Line",
    // "LineStrip",
    // "LinePieces",
    "Mesh",
    // "Bone",
    // "Skeleton",
    // "SkinnedMesh",
    // "MorphAnimMesh",
    // "LOD",
    // "Sprite",
    // "Particle",
    // "LensFlare",
    "Scene",
    // "Fog",
    // "FogExp2",
    // "ShaderChunk",
    // "UniformsUtils",
    // "UniformsLib",
    // "ShaderLib",
    // "WebGLRenderer",
    // "WebGLRenderTarget",
    // "WebGLRenderTargetCube",
    // "WebGLExtensions",
    // "WebGLProgram",
    // "WebGLShader",
    // "WebGLState",
    // "LensFlarePlugin",
    // "ShadowMapPlugin",
    // "SpritePlugin",
    // "GeometryUtils",
    // "ImageUtils",
    // "SceneUtils",
    // "FontUtils",
    // "typeface_js",
    // "Audio",
    // "AudioListener",
    // "Curve",
    // "CurvePath",
    // "Gyroscope",
    // "Path",
    // "PathActions",
    // "Shape",
    // "LineCurve",
    // "QuadraticBezierCurve",
    // "CubicBezierCurve",
    // "SplineCurve",
    // "EllipseCurve",
    // "ArcCurve",
    // "LineCurve3",
    // "QuadraticBezierCurve3",
    // "CubicBezierCurve3",
    // "SplineCurve3",
    // "ClosedSplineCurve3",
    // "AnimationHandler",
    // "Animation",
    // "KeyFrameAnimation",
    // "MorphAnimation",
    "BoxGeometry",
    // "CircleGeometry",
    // "CubeGeometry",
    // "CylinderGeometry",
    // "ExtrudeGeometry",
    // "ShapeGeometry",
    // "LatheGeometry",
    // "PlaneGeometry",
    // "PlaneBufferGeometry",
    // "RingGeometry",
    // "SphereGeometry",
    // "TextGeometry",
    // "TorusGeometry",
    // "TorusKnotGeometry",
    // "TubeGeometry",
    // "PolyhedronGeometry",
    // "DodecahedronGeometry",
    // "IcosahedronGeometry",
    // "OctahedronGeometry",
    // "TetrahedronGeometry",
    // "ParametricGeometry",
    // "AxisHelper",
    // "ArrowHelper",
    // "BoxHelper",
    // "BoundingBoxHelper",
    // "CameraHelper",
    // "DirectionalLightHelper",
    // "EdgesHelper",
    // "FaceNormalsHelper",
    // "GridHelper",
    // "HemisphereLightHelper",
    // "PointLightHelper",
    // "SkeletonHelper",
    // "SpotLightHelper",
    // "VertexNormalsHelper",
    // "VertexTangentsHelper",
    // "WireframeHelper",
    // "ImmediateRenderObject",
    // "MorphBlendMesh"
  ];
}