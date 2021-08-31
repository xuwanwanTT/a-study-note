import React from 'react';

import * as THREE from 'three';
import { OBJLoader2 } from 'three/examples/jsm/loaders/OBJLoader2.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { MtlObjBridge } from 'three/examples/jsm/loaders/obj2/bridge/MtlObjBridge.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

import { GUI } from 'three/examples/jsm/libs/dat.gui.module';
import Stats from 'three/examples/jsm/libs/stats.module.js';

import { createBackground } from '../lib/three-vignette.js';

const vertexShader = `varying vec2 vUv;

void main() {

  vUv = uv;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}`;

const fragmentShader = `uniform sampler2D baseTexture;
uniform sampler2D bloomTexture;

varying vec2 vUv;

void main() {

  gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );

}`;

const ENTIRE_SCENE = 0;
const BLOOM_SCENE = 1;

const FLOOR_SCENE = 2;

const modelList = [
  { name: '1号楼' },
  { name: '隐藏' },
  { name: '3号楼' },
  { name: '3号楼d' },
  { name: '5号楼' },
  { name: '6号楼' },
  { name: '7号楼' },
  { name: '8号楼' },
  { name: '9号楼' },
  { name: '10号楼' },
  { name: '11号楼' },
  { name: '15号楼' },
  { name: '16号楼' },
  { name: '17号楼' },
  { name: '18号楼' },
  { name: '18c号楼' },
  { name: '19号楼' },
  { name: '20号楼' },
  { name: '21号楼' },
  // { name: '最终导出模型' }
];

const bgModelList = [
  { name: '地板' },
  { name: '道路' },
  { name: '建筑物' },
];

const floorModelList = [
  { name: '2-2' }
];

const alarmDist = {
  '2号楼': [{ name: '2号楼-报警层' }, { name: '2号楼-报警夹层' }]
};

class Langyuan3D extends React.Component {
  constructor() {
    super();
    this.state = {};
    this.initRenderer = this.initRenderer.bind(this);
    this.initCamera = this.initCamera.bind(this);
    this.initControls = this.initControls.bind(this);
    this.initHalo = this.initHalo.bind(this);
    this.initMaterial = this.initMaterial.bind(this);
    this.initEvent = this.initEvent.bind(this);
    this.initLoader = this.initLoader.bind(this);

    this.draw = this.draw.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.loadBuildingModel = this.loadBuildingModel.bind(this);
    this.loadBgModel = this.loadBgModel.bind(this);

    this.backMainCamera = this.backMainCamera.bind(this);

    this.floorList = [];

    this.tick = 0;
    this.tok = 30; // 报警闪烁频率间隔 30表示30帧 即 1/60*30 = 0.5s
  }

  init() {
    const { initRenderer, initCamera, initControls, initHalo, initMaterial, initEvent, initLoader } = this;
    // new renderer
    initRenderer();
    const renderer = this.renderer;

    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.pmremGenerator.compileEquirectangularShader();

    // append
    this.domWrap.appendChild(renderer.domElement);

    // new scene
    const scene = new THREE.Scene();
    this.scene = scene;

    // new camera
    initCamera();
    const camera = this.camera;
    scene.add(camera);

    this.vignette = createBackground({
      aspect: camera.aspect,
      grainScale: 0.001, // mattdesl/three-vignette-background#1
      colors: [0x000000, 0x0000000]
    });
    this.vignette.name = 'Vignette';
    this.vignette.renderOrder = -1;

    new RGBELoader()
      .setDataType(THREE.UnsignedByteType)
      .load('/xfy/public/obj/langyuan/venice_sunset_1k.hdr', (texture) => {
        const envMap = this.pmremGenerator.fromEquirectangular(texture).texture;
        this.pmremGenerator.dispose();

        scene.add(this.vignette);
        scene.environment = envMap;
        // scene.background = '';
      });

    // new controls
    initControls();

    // new light
    this.initLight();

    //
    this.renderScene = new RenderPass(scene, camera);

    this.raycaster = new THREE.Raycaster();
    this.raycasterList = []; // 允许点击的物体
    this.darkModleList = [];
    this.alarmList = [] // 报警的平层

    this.mouse = new THREE.Vector2();

    this.materials = {};

    initHalo();

    initMaterial();

    initEvent();

    initLoader();
  }

  initRenderer() {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.toneMapping = THREE.ReinhardToneMapping;
    // 设置渲染器的像素比例 window.devicePixelRatio 浏览器的像素比例
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 设置色彩空间，确保 web 呈现和模型一致
    // renderer.outputEncoding = THREE.sRGBEncoding;

    // renderer.setClearColor(0xcccccc);
    renderer.physicallyCorrectLights = true;

    renderer.toneMappingExposure = 1;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.renderer = renderer;
  }

  initCamera() {
    const defaultCameraOption = {
      position: {
        x: -138.82116928960033,
        y: 118.22094728609966,
        z: 351.27854548130074,
      },
      rotation: {
        _x: -0.3847749811487621,
        _y: -0.5798434927102718,
        _z: -0.21833784872882453,
      },
      fov: 45.83662361046586,
      near: 16.38915786065848,
      far: 163891.57860658478
    };
    const { position, rotation, fov, near, far } = defaultCameraOption;
    const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far);
    const { x, y, z } = position;
    camera.position.set(x, y, z);
    const { _x, _y, _z } = rotation;
    camera.rotation.set(_x, _y, _z);
    camera.lookAt(0, 0, 0);
    this.camera = camera;
  }

  initControls() {
    const { camera, renderer } = this;
    const controls = new OrbitControls(camera, renderer.domElement);
    // controls.target.set(0, 0.5, 0);
    controls.update();
    controls.enablePan = true; // 右键拖拽
    // controls.enableDamping = true; // damping (阻尼) 缓动效果
    this.controls = controls;
  }

  initLight() {
    const { camera, scene } = this;

    const light1 = new THREE.AmbientLight(0xffffff, 0.3);
    light1.name = 'ambient_light';
    light1.layers.enable(0);
    light1.layers.enable(1);
    light1.layers.enable(2);
    scene.add(light1);

    const light2 = new THREE.DirectionalLight(0xFFFFFF, 0.8 * Math.PI);
    light2.transparent = true;
    light2.opacity = 0.1;
    light2.position.set(0.5, 0, 0.866); // ~60º
    light2.name = 'main_light';
    camera.add(light2);

  }

  initMaterial() {

    this.faceNormalMaterial = new THREE.MeshBasicMaterial({ color: 0x269be8 });

    this.buildingActiveMaterial = new THREE.MeshPhongMaterial({
      transparent: 0,
      color: 'red',
      opacity: 1,
    });

    this.buildingNormalMaterial = new THREE.MeshPhongMaterial({
      transparent: 0,
      color: 'red',
      opacity: 1
    });

    const color1 = 'red';
    // const materialNormal1 = new THREE.MeshPhongMaterial({
    //   color: color1,
    //   emissive: color1,
    //   transparent: true,
    //   opacity: 0.7,
    //   needsUpdate: true,
    //   blending: THREE.MultiplyBlending
    // });
    // this.materialNormal1 = materialNormal1;

  }

  initHalo() {
    const { renderScene, renderer } = this;
    const params = {
      exposure: 1,
      bloomStrength: 1,
      bloomThreshold: 0,
      bloomRadius: 0
    };

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = params.bloomThreshold;
    bloomPass.strength = params.bloomStrength;
    bloomPass.radius = params.bloomRadius;
    this.bloomPass = bloomPass;

    const bloomComposer = new EffectComposer(renderer);
    bloomComposer.renderToScreen = false;
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloomPass);
    this.bloomComposer = bloomComposer;

    const finalPass = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: { value: bloomComposer.renderTarget2.texture }
        },
        vertexShader,
        fragmentShader,
        defines: {}
      }), 'baseTexture'
    );
    finalPass.needsSwap = true;

    const finalComposer = new EffectComposer(renderer);
    finalComposer.addPass(renderScene);
    finalComposer.addPass(finalPass);
    this.finalComposer = finalComposer;

    const bloomLayer = new THREE.Layers();
    bloomLayer.set(BLOOM_SCENE);
    this.bloomLayer = bloomLayer;

  }

  initLoader() {
    // gltf glb
    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setCrossOrigin('anonymous');
    dracoLoader.setDecoderPath('three/examples/js/libs/draco');
    gltfLoader.setDRACOLoader(dracoLoader);
    this.gltfLoader = gltfLoader;

    // fbx
    const fbxLoader = new FBXLoader();


    this.textureLoader = new THREE.TextureLoader();

    // obj
    const objLoader = new OBJLoader2();

    this.supportLoader = {
      gltf: gltfLoader, glb: gltfLoader,
      fbx: fbxLoader,
      obj: objLoader
    };

  }

  initEvent() {
    const { onPointerDown, draw, controls, camera, renderer, vignette, bloomComposer, finalComposer } = this;

    window.addEventListener('click', onPointerDown, false);

    // controls.addEventListener('change', () => {
    //   renderer.render(scene, camera);
    // });

    window.onresize = () => {

      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      vignette.style({ aspect: camera.aspect });

      renderer.setSize(width, height);

      bloomComposer.setSize(width, height);
      finalComposer.setSize(width, height);

    };
  }

  initGui() {
    const stats = new Stats();
    this.stats = stats;
    this.domWrap.appendChild(stats.dom);

    const gui = new GUI({ width: 450 });
    let { scene, spotLightHelper1, cameraHelper, camera } = this;
    var params = {
      "点光源助手开启": false,
      "相机助手开启": false,
      "初始视野角(值大楼小)": 2.5, // fov
      "离物体最远距离": 75000, // far
      x: 0,
      y: 0,
      z: 0,
      'r-x': 0
    };

    gui.addFolder("相机设置（只影响建筑外立面，楼内先不要改）");
    gui.add(params, "相机助手开启").onChange((val) => {
      if (val) {
        scene.add(cameraHelper);
      } else {
        scene.remove(cameraHelper);
      }
    });

    gui
      .add(params, "初始视野角(值大楼小)", 0.0, 100)
      .step(1)
      .onChange((val) => {
        this.camera.fov = val;
        this.camera.updateProjectionMatrix();
      });
    gui
      .add(params, "离物体最远距离", 0.0, 75000 * 5)
      .step(100)
      .onChange((val) => {
        this.camera.far = val;
        this.camera.updateProjectionMatrix();
      });
    gui
      .add(params, "x", 0.0, 500)
      .step(1)
      .onChange((val) => {
        params.x = val;
        const { x, y, z } = params;
        this.camera.position.set(x, y, z);
        this.camera.updateProjectionMatrix();
      });
    gui
      .add(params, "y", 0.0, 500)
      .step(1)
      .onChange((val) => {
        params.y = val;
        const { x, y, z } = params;
        this.camera.position.set(x, y, z);
        this.camera.updateProjectionMatrix();
      });
    gui
      .add(params, "z", 0.0, 5000)
      .step(1)
      .onChange((val) => {
        params.z = val;
        const { x, y, z } = params;
        this.camera.position.set(x, y, z);
        this.camera.updateProjectionMatrix();
      });
    gui
      .add(params, "r-x", Math.PI * 0, Math.PI * 2)
      .step(Math.PI / 180 / 100)
      .onChange((val) => {
        let newPositon = {
          x: params.x,
          y: params.y,
          z: val,
        };
        this.camera.rotateY(val);
        this.camera.updateProjectionMatrix();
      });

    const layers = {

      'toggle red': function () {

        camera.layers.toggle(0);

      },

      'toggle green': function () {

        camera.layers.toggle(1);

      },

      'toggle blue': function () {

        camera.layers.toggle(2);

      },

      'enable all': function () {

        camera.layers.enableAll();

      },

      'disable all': function () {

        camera.layers.disableAll();

      }

    };

    //
    // Init gui
    gui.add(layers, 'toggle red');
    gui.add(layers, 'toggle green');
    gui.add(layers, 'toggle blue');
    gui.add(layers, 'enable all');
    gui.add(layers, 'disable all');

  }

  loadBuildingModel(option) {
    const { scene, group, raycasterList, supportLoader, materialNormal1 } = this;
    const { url, name, texture, type } = option;

    let loader = supportLoader[type];

    if (!loader) {
      console.error('不支持此模型文件');
      return false;
    }

    loader.load(url, (object) => {
      const obj = type === 'gltf' ? object.scene : object;
      obj.traverse((o) => {
        if (!o.isMesh) return;
        o.layers.set(0);

        if (o.parent.name === '空白') {
          o.material = o.material.clone();
          o.material.visible = false;
        }

        // const lineMaterial = new THREE.LineBasicMaterial({
        //   // 线的颜色
        //   color: 0x00ffff,
        //   transparent: true,
        //   linewidth: 5,
        //   opacity: 0.2,
        //   depthTest: false,
        // });
        // //解决z-flighting
        // lineMaterial.polygonOffset = true;
        // lineMaterial.depthTest = true;
        // lineMaterial.polygonOffsetFactor = 1;
        // lineMaterial.polygonOffsetUnits = 1.0;

        o.geometry.computeTangents();

        // o.material = materialNormal1;
        o.material.transparent = true;
        o.material.opacity = 0.9;
        // o.material.color.setHex(0x3390dd);
        // o.material.emissive.setHex(0x077bb5);
        o.material.roughness = 0.1;
        o.material.metalness = 1;

        const wireframe = new THREE.WireframeGeometry(o.geometry);
        const lineMaterial = new THREE.LineBasicMaterial({
          // 线的颜色
          color: 0x00ffff,
          transparent: true,
          linewidth: 5,
          opacity: 1,
          depthTest: false,
        });
        let line = new THREE.LineSegments(wireframe, lineMaterial);

        // o.add(line);

        const edges = new THREE.EdgesGeometry(o.geometry);
        line = new THREE.Line(edges);
        line.material.depthTest = false;
        line.material.opacity = 0.25;
        line.material.transparent = true;
        line.position.x = - 4;
        // o.add(line);

        o.name = name;

        const color = new THREE.Color('#2877d3');
        // const xx = new THREE.MeshBasicMaterial({
        //   transparent: true,
        //   color: 'red',
        //   opacity: 0.9
        // });
        // o.material = xx;
        // o.material.color = color;

        // o.material.emissive = o.material.color;
        // o.material.emissiveMap = o.material.map;

        // o.material.opacity = 1;
        // o.material.normalMap = this.buildTexture;
        // o.material = buildingNormalMaterial;
        // o.material.map = this.buildTexture
        // raycasterList.push(o);
      });
      scene.add(obj);
      option.obj = obj;
      if (name === '隐藏') { console.log(obj) }
    });
  }

  loadBgModel(option) {
    const { scene, group, raycasterList, supportLoader } = this;
    const { url, name, texture, type } = option;

    let loader = supportLoader[type];

    if (!loader) {
      console.error('不支持此模型文件');
      return false;
    }

    loader.load(url, (object) => {
      const obj = object.scene;

      obj.traverse((o) => {
        if (!o.isMesh) return;
        o.layers.set(0);

        o.name = name;
        if (name === '地板') {
          o.material.transparent = true;
          o.material.depthWrite = false;
          o.material.opacity = 0.9;
          o.material.side = THREE.DoubleSide;
        }
        this.darkModleList.push(o);
      });
      if (name === '地板') {
        // this.setContent(obj);
      }
      scene.add(obj);
    });
  }

  loadFloorModel(option) {
    const { scene, group, floorList, supportLoader, materialNormal1 } = this;
    const { url, name, texture, type } = option;

    let loader = supportLoader[type];

    if (!loader) {
      console.error('不支持此模型文件');
      return false;
    }

    loader.load(url, (object) => {
      const obj = type === 'gltf' ? object.scene : object;
      obj.traverse((o) => {
        if (!o.isMesh) return;
        o.layers.set(2);

        o.material.transparent = true;
        o.material.opacity = 0.9;
        // o.material.color.setHex(0x3390dd);
        // o.material.emissive.setHex(0x077bb5);
        o.material.roughness = 0.1;
        o.material.metalness = 1;

        o.name = name;

        const color = new THREE.Color('#2877d3');

      });
      floorList.push(obj);
      scene.add(obj);

      option.obj = obj;

    });
  }

  loadAlarmModel(option) {
    const { scene, group, floorList, supportLoader, materialNormal1 } = this;
    const { url, name, texture, type } = option;

    let loader = supportLoader[type];

    if (!loader) {
      console.error('不支持此模型文件');
      return false;
    }

    loader.load(url, (object) => {
      const obj = type === 'gltf' ? object.scene : object;
      obj.traverse((o) => {
        if (!o.isMesh) return;

        o.material.transparent = true;
        o.material.opacity = 0.9;
        // o.material.color.setHex(0x3390dd);
        // o.material.emissive.setHex(0x077bb5);
        o.material.roughness = 0.1;
        o.material.metalness = 1;

        o.name = name;

      });

      option.obj = obj;

    });
  }

  loadTexture() {
    // this.textureLoader.load('/xfy/public/obj/langyuan/矩形1.png', (texture) => {
    //   texture.encoding = THREE.sRGBEncoding;
    //   texture.wrapS = THREE.RepeatWrapping;
    //   texture.wrapT = THREE.RepeatWrapping;
    //   texture.repeat.set(1, 1);
    //   this.buildTexture = texture;
    // });
  }

  /**
   * @param {THREE.Object3D} object
   * @param {Array<THREE.AnimationClip} clips
   */
  setContent(object, clips) {
    // this.clear();
    const { camera, controls } = this;

    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());

    object.position.x += (object.position.x - center.x);
    object.position.y += (object.position.y - center.y);
    object.position.z += (object.position.z - center.z);

    controls.reset();

    // controls.maxDistance = size * 10;
    camera.near = size / 100;
    camera.far = size * 100;
    camera.updateProjectionMatrix();

    if (this.cameraPosition) {

      camera.position.fromArray(this.cameraPosition);
      camera.lookAt(new THREE.Vector3());

    } else {
      // camera.position.copy(center);
      camera.position.x += size / 2.0;
      camera.position.y += size / 5.0;
      camera.position.z += size / 2.0;
      camera.lookAt(center);
      camera.updateProjectionMatrix();
    }

    // this.setCamera(DEFAULT_CAMERA);

    // this.axesCamera.position.copy(camera.position)
    // this.axesCamera.lookAt(this.axesScene.position)
    // this.axesCamera.near = size / 100;
    // this.axesCamera.far = size * 100;
    // this.axesCamera.updateProjectionMatrix();
    // this.axesCorner.scale.set(size, size, size);

    // this.controls.saveState();

    // this.setClips(clips);

    // this.updateLights();
    // this.updateGUI();
    // this.updateEnvironment();
    // this.updateTextureEncoding();
    // this.updateDisplay();

    // window.content = this.content;
    // console.info('[glTF Viewer] THREE.Scene exported as `window.content`.');
    // this.printGraph(this.content);

  }

  onPointerDown(event) {
    const { draw, scene, raycasterList, camera, mouse, raycaster } = this;

    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(raycasterList);
    console.log('点击', raycasterList, intersects, (camera))

    if (intersects.length > 0) {
      const object = intersects[0].object;
      console.log(object, '---点击啦---');
      if (this.camera.layers.test(object.layers) && object.realClick) {
        console.log('change');
        this.camera.layers.disableAll();
        this.camera.layers.toggle(FLOOR_SCENE);
        this.setContent(this.floorList[0]);
      }
    }

  }

  draw() {
    requestAnimationFrame(this.draw);

    const { stats, renderer, camera, scene, alarmList, tok } = this;
    this.tick++;

    // drawBloom(true);
    // this.bloomComposer.render();
    // finalComposer.render();
    renderer.render(scene, camera);

    // 报警闪烁动画
    if (this.tick > tok) {
      this.tick = 0;
      alarmList.forEach(s => {
        s.material.opacity = s.material.opacity === 0.5 ? 1 : 0.5;
      });
    }

    // 指示器
    stats && stats.update();
  }

  linkSocket() {
    const { raycasterList } = this;
    const socket = new WebSocket('ws://localhost:8090', 'xf');
    console.log(socket)
    socket.addEventListener('open', function (event) {
      socket.send('3d linked');
    });
    socket.onopen = () => { console.log('open'); };
    socket.onmessage = (event) => {
      console.log('socket: ', event.data);
      console.log(raycasterList)
    };
  }

  backMainCamera() {
    const { camera } = this;
    camera.layers.enableAll();
    camera.layers.disable(2);
  }

  mock() {
    setTimeout(() => {
      this.setState({
        data: [
          {
            building: '2号楼',
            floor: 8,
            status: 2,
          },
          {
            building: '2号楼',
            floor: 4,
            status: 2,
          },
          {
            building: '2号楼',
            floor: 1,
            status: 2,
          },
          {
            building: '2号楼',
            floor: 5,
            status: 2,
          }
        ]
      }, () => {

        const { raycasterList, alarmList } = this;

        this.state.data.forEach(data => {
          const { building, floor, status } = data;
          const buildingObj = modelList.filter(s => s.name === '隐藏')[0].obj;
          buildingObj.traverse(o => {
            if (o.isMesh) {
              if (+o.userData.name === +floor) {
                console.log(o, '---o---')
                if (!alarmList.some(s => s === o) && +status === 2) { // 报警
                  raycasterList.push(o);
                  alarmList.push(o);
                  o.material.visible = true;
                  o.realClick = true;
                } else if (+status === 8) { // 恢复
                  // 先隐藏
                  o.material.visible = false;

                  // 然后从数组中移除
                  let index = alarmList.indexOf(o);
                  alarmList.splice(index, 1);
                  raycasterList.splice(index, 1);
                }
              }
            }
          });
        })

      });
    }, 1000 * 5);
  }

  componentDidMount() {
    this.init();
    this.draw();
    this.initGui();
    const bloomLayer = new THREE.Layers();
    bloomLayer.set(0);
    this.bloomLayer = bloomLayer;

    this.loadTexture();

    bgModelList.forEach(s => {
      let type = s.type ? s.type : 'gltf';
      s.url = `/xfy/public/obj/langyuan/${s.name}.${type}`;
      s.type = type;
      this.loadBgModel(s);
    });

    modelList.forEach(s => {
      let type = s.type ? s.type : 'gltf';
      s.url = `/xfy/public/obj/langyuan/${s.name}.${type}`;
      s.type = type;
      this.loadBuildingModel(s);
    });

    floorModelList.forEach(s => {
      let type = s.type ? s.type : 'gltf';
      s.url = `/xfy/public/obj/langyuan/floor/${s.name}.${type}`;
      s.type = type;
      this.loadFloorModel(s);
    });

    for (let n in alarmDist) {
      let arr = alarmDist[n];
      arr.forEach(s => {
        let type = s.type ? s.type : 'gltf';
        s.url = `/xfy/public/obj/langyuan/${s.name}.${type}`;
        s.type = type;
        this.loadAlarmModel(s);
      })
    }

    this.linkSocket();

    this.mock();
  }

  render() {
    return (
      <>

        <div ref={refs => this.domWrap = refs} />

        <div style={{
          color: 'red',
          fontSize: 32,
          position: 'absolute',
          left: '50%',
          top: 0,
        }} onClick={this.backMainCamera}>back</div>

      </>
    );
  }
};

export default Langyuan3D;
