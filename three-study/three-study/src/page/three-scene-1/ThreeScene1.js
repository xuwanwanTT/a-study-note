import React from 'react';
import { inject, observer } from "mobx-react";
import { onSnapshot } from "mobx-state-tree";

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
import { TDSLoader } from 'three/examples/jsm/loaders/TDSLoader.js';

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
  { name: '2号楼' },
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

/**
 * @author xf
 * @param {object} center {x,y,z} 模型中点 new THREE.Box3(obj) .setFromObject .getCenter()
 * @param {object} size {x,y,z} 建模时的依据尺寸
 * @param {object} site {x,y,z} 以建模时的尺寸为依据的位置坐标
 * @returns {x,y,z}
 */
const countSite = (center, size, site) => {
  const temp = (type) => center[type] * 2 / size[type] * site[type];
  return {
    x: temp('x'),
    y: temp('y'),
    z: temp('z'),
  }
};

@inject("store")
@observer
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
    this.showFloorDevice = this.showFloorDevice.bind(this);

    this.loadObjModel = this.loadObjModel.bind(this);
    this.loadDevices = this.loadDevices.bind(this);
    this.onDeviceLoaded = this.onDeviceLoaded.bind(this);
    this.createDevice = this.createDevice.bind(this);

    this.tick = 0;
    this.tok = 30; // 报警闪烁频率间隔 30表示30帧 即 1/60*30 = 0.5s

    // 主屏摄像机参数
    this.defaultCameraOption = {
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

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.traverse(o => {
      if (o.isMesh) {
        o.layers.set(2)
      }
    })
    this.cube = cube;
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

    // loader
    initLoader();

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
    this.mouse = new THREE.Vector2();

    this.modelCache = {}; // 缓存模型信息
    this.deviceCatch = {} // 缓存设备模型

    this.deviceIconMap = { // 设备url
      ganyan: "/xfy/public/obj/sensor/烟感",
      ganwen: "/xfy/public/obj/sensor/温感",
      huozaibaojing: "/xfy/public/obj/sensor/报警器1",
      xiaohuoshuan: "/xfy/public/obj/sensor/报警器1",
      jianshimokuai: "/xfy/public/obj/sensor/监视模块",
      kongzhimokuai: "/xfy/public/obj/sensor/控制模块",
      shengguangjingbao: "/xfy/public/obj/sensor/警铃",
      xianshiqi: "/xfy/public/obj/sensor/ACU控制箱",
      gateway: "/xfy/public/obj/sensor/接口模块",
      shengguangbaojing: "/xfy/public/obj/sensor/防爆声光",
      yewei: "/xfy/public/obj/sensor/液位",
      shuiya: "/xfy/public/obj/sensor/水压指示器",
      keranqitance: "/xfy/public/obj/sensor/可燃气体探测器",
      hongwai: "/xfy/public/obj/sensor/防爆火焰",
      dianliutance: "/xfy/public/obj/sensor/接口模块",
      cewentance: "/xfy/public/obj/sensor/接口模块",
    };

    initEvent();

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
    const { defaultCameraOption } = this;
    const { position, fov, near, far } = defaultCameraOption;
    const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far);

    const { x, y, z } = position;
    camera.position.set(x, y, z);

    camera.updateProjectionMatrix();
    this.camera = camera;
  }

  setMainCamera() {
    const { camera, defaultCameraOption } = this;
    const { position } = defaultCameraOption;
    const { x, y, z } = position;
    camera.position.set(x, y, z);
    camera.updateProjectionMatrix();
  }

  initControls() {
    const { camera, renderer } = this;
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(
      90.96655011954165,
      1.2312659286837143e-15,
      48.967619727049524,
    );
    controls.enablePan = true; // 右键拖拽
    // controls.enableDamping = true; // damping (阻尼) 缓动效果
    this.controls = controls;
  }

  initLight() {
    const { camera, scene } = this;

    const light1 = new THREE.AmbientLight(0xffffff, 0.3);
    light1.intensity = 10;
    light1.name = 'ambient_light';
    light1.layers.enable(0);
    light1.layers.enable(1);
    light1.layers.enable(2);
    scene.add(light1);

    const light2 = new THREE.DirectionalLight(0xFFFFFF, 0.8 * Math.PI);
    light2.transparent = true;
    light2.opacity = 1;
    light2.intensity = 10;
    light2.position.set(0.5, 0, 0.866); // ~60º
    light2.name = 'main_light';
    camera.add(light2);

    const light3 = new THREE.SpotLight(0xffffff, 1.5);
    light3.position.set(0.5, 0, 0.866);
    light3.intensity = 10;
    camera.add(light3);
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

    // 3ds
    const tdsLoader = new TDSLoader();

    this.supportLoader = {
      gltf: gltfLoader, glb: gltfLoader,
      fbx: fbxLoader,
      obj: objLoader,
      tds: tdsLoader
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
    const { scene, group, raycasterList, supportLoader, modelCache } = this;
    const { url, name, type } = option;

    // init modelCache
    if (!modelCache[name]) modelCache[name] = {
      name, url, type,
      markList: [], fireList: [],
      floorDist: {}
    };

    let optionCache = modelCache[name];

    let loader = supportLoader[type];

    if (!loader) {
      console.error('不支持此模型文件');
      return false;
    }

    loader.load(url,
      (object) => {
        console.log('load building')
        const obj = type === 'gltf' ? object.scene : object;
        optionCache.object = obj;

        obj.traverse((o) => {
          if (!o.isMesh) return;
          o.layers.set(0);

          if (o.parent.name === 'fire') {
            o.material = o.material.clone();
            o.material.visible = false;
          }

          if (o.userData.name === 'fire-mark') {
            o.material = o.material.clone();
            o.material.visible = false;
            optionCache.markObject = o;
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
      }
    );
  }

  loadBgModel(option) {
    const { scene, supportLoader } = this;
    const { url, name, type } = option;

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
      });

      scene.add(obj);
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

  loadDevices(floorDist, callback) {
    const { object, deviceList } = floorDist;

    // 切换图层和视角
    this.camera.layers.disableAll();
    this.camera.layers.toggle(FLOOR_SCENE);
    this.setContent(object);

    // building, floor mock
    let building = 2; let floor = 5;
    let { store } = this.props;
    let fieldApiKeys = `id,status,name,recordType,deviceModel,deviceKey,belongSystem,building,floor,location,locationX,locationY,locationZ,scaleX,scaleY,scaleZ,rotationX,rotationY,inMap `;
    store
      .fetcher({
        url: `/api/data/v1/query`,
        method: "post",
        data: {
          coql: `select ${fieldApiKeys} from device where building = ${building} and floor=${floor}`,
          fieldApiKeys,
          objectApiKey: "device",
        },
      })
      .then((response) => response.data)
      .then((data) => {
        if (data.status === 0) {
          console.log(data.data)
          // store.device.setDevice(
          //   data.data.items,
          //   data.data.count,
          //   buildingMap[building],
          //   floorValue
          // );
          this.onDeviceLoaded(data.data.items, deviceList, callback);
        }
      });
  }

  onDeviceLoaded(devices, deviceList, callback) {
    devices.forEach((device) => {
      //都为空说明没进行过标点，不用创建设备
      if (
        device.locationX != undefined &&
        device.locationY != undefined &&
        device.locationZ != undefined
      ) {
        this.createDevice(device, deviceList, callback);
      }
    });
  }

  createDevice(device, deviceList, callback) {
    let temp = {
      name: device.name,
      device: device,
    };
    const apiKey = device.recordType.apiKey
    let path = this.deviceIconMap[apiKey];
    if (path) {
      if (!this.deviceCatch[apiKey]) {
        this.loadObjModel(path, (obj) => {
          obj.name = "dev_" + device.name;
          obj.device = device;

          obj.traverse(o => {
            if (o.isMesh) {
              o.layers.set(FLOOR_SCENE);
              // o.material.color = new THREE.Color(0xffffff);
              this.raycasterList.push(o);
            }
          })

          // mesh.position.x = device.locationX != undefined ? device.locationX : 0;
          // mesh.position.y = device.locationY != undefined ? device.locationY : 1;
          // mesh.position.z = device.locationZ != undefined ? device.locationZ : 0;
          // if (device.scaleX && device.scaleY && device.scaleZ) {
          //   mesh.scale.set(device.scaleX, device.scaleY, device.scaleZ);
          // }
          // this.layerBuilding.add(obj);
          // this.alarmLayer([device]);
          this.deviceCatch[apiKey] = obj;
          temp.object = obj.clone();
          deviceList.push(temp);

          callback();
        });
      } else if (!deviceList.some(s => s.name === device.name)) {
        temp.object = this.deviceCatch[apiKey].clone();
        this.raycasterList.push(temp.object.children[0]);
        // let mesh = temp.object.children[0];
        // mesh.position.x = device.locationX != undefined ? device.locationX : 0;
        // mesh.position.y = device.locationY != undefined ? device.locationY : 1;
        // mesh.position.z = device.locationZ != undefined ? device.locationZ : 0;
        // if (device.scaleX && device.scaleY && device.scaleZ) {
        //   mesh.scale.set(device.scaleX, device.scaleY, device.scaleZ);
        // }
        deviceList.push(temp);
        callback();
      } else {
        deviceList.filter(s => s.name === device.name)[0].device = device;
        // mesh.position.x = device.locationX != undefined ? device.locationX : 0;
        // mesh.position.y = device.locationY != undefined ? device.locationY : 1;
        // mesh.position.z = device.locationZ != undefined ? device.locationZ : 0;
        // if (device.scaleX && device.scaleY && device.scaleZ) {
        //   mesh.scale.set(device.scaleX, device.scaleY, device.scaleZ);
        // }
        callback();
      }
    }
  }

  loadObjModel(path, callback) {
    const loader = new OBJLoader2();
    const mtlLoader = new MTLLoader();
    mtlLoader.load(`${path}.mtl`, (mtlParseResult) => {
      const materials = MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult);
      loader.addMaterials(materials);
      loader.load(`${path}.obj`, (root) => {
        // root.omaterial = root.children[0].material;
        console.log(root, '------------')
        if (callback) {
          callback(root);
        }
      });
    });
  }

  /**
   * @param {THREE.Object3D} object
   * @param {Array<THREE.AnimationClip} clips
   * 设置 camera 将模型展示到中心
   */
  setContent(object, clips) {
    // this.clear();
    const { camera, controls } = this;
    const caniuse = object.caniuse;

    if (!caniuse.center) {
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3()).length();
      const center = box.getCenter(new THREE.Vector3());
      caniuse.center = center;
      caniuse.size = size;
    }

    const { size, center } = caniuse;

    object.position.x = -center.x;
    object.position.y = -center.y;
    object.position.z = -center.z;

    // controls.maxDistance = size * 10;
    camera.near = size / 100;
    camera.far = size * 100;
    camera.position.x = size;
    camera.position.y = size;
    camera.position.z = size;
    camera.lookAt(center);
    camera.updateProjectionMatrix();

    controls.reset();
    controls.saveState();
    controls.reset();
  }

  onPointerDown(event) {
    const { camera, raycasterList, mouse, raycaster, modelCache } = this;

    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(raycasterList);

    console.log(intersects, raycasterList)

    if (intersects.length > 0) {
      const object = intersects[0].object;
      if (this.camera.layers.test(object.layers) && object.realClick) {
        const caniuse = object.caniuse;
        const { building, floor } = caniuse;

        caniuse.url = `/xfy/public/obj/langyuan/floor/${building}-${floor}.gltf`;
        caniuse.name = `${building}-${floor}`;
        caniuse.type = 'gltf';

        // init 单层对象
        if (!modelCache[building].floorDist[floor]) modelCache[building].floorDist[floor] = {
          deviceList: []
        };

        this.showFloorModel(caniuse, modelCache[building].floorDist[floor]);
      }
    }

  }

  draw() {
    this.tick++;
    requestAnimationFrame(this.draw);

    const { stats, renderer, camera, scene, controls, modelCache, tok } = this;

    // drawBloom(true);
    // this.bloomComposer.render();
    // finalComposer.render();
    controls.update();
    renderer.render(scene, camera);

    // 报警闪烁动画
    if (this.tick > tok) {
      this.tick = 0;
      for (let n in modelCache) {
        const { fireList } = modelCache[n];
        fireList.forEach(o => {
          if (o) {
            o.material.opacity = o.material.opacity === 0.5 ? 1 : 0.5;
          }
        });
      }
    }

    // 报警 mark 动画
    for (let n in modelCache) {
      const { markList } = modelCache[n];
      markList.forEach(o => {
        if (o) {
          o.rotation.y += 0.05;
        }
      });
    }

    // 指示器
    // stats && stats.update();
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
    const { camera, controls } = this;
    camera.layers.enableAll();
    camera.layers.disable(2);
    this.setMainCamera();

    controls.reset();

    controls.target.set(
      90.96655011954165,
      1.2312659286837143e-15,
      48.967619727049524,
    );
  }

  showFloorModel(option, floorDist) {
    const { scene, supportLoader, showFloorDevice, loadDevices } = this;
    const { url, name, type, building, floor } = option;

    if (floorDist.object) {
      if (this.currentFloorDist !== floorDist) {
        this.currentFloorDist.object.visible = false;
        this.currentFloorDist.deviceList.forEach(s => s.object.visible = false);
        this.currentFloorObject.visible = false;
        floorDist.object.visible = true;
        floorDist.deviceList.forEach(s => s.object.visible = false);
        this.currentFloorObject = floorDist;
      }
      loadDevices(floorDist, () => { showFloorDevice(floorDist); });

      return false;
    }

    let loader = supportLoader[type];

    if (!loader) {
      console.error('不支持此模型文件');
      return false;
    }

    loader.load(url,
      (object) => {
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

        });

        scene.add(obj);
        floorDist.object = obj;
        floorDist.name = name;
        floorDist.building = building;
        floorDist.floor = floor;
        this.currentFloorObject = obj;
        this.currentFloorDist = floorDist;
        option.obj = obj;

        // init 存储数据对象
        obj.caniuse = {};

        loadDevices(floorDist, () => { showFloorDevice(floorDist); });

      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error) => {
        throw error;
      }
    );
  }

  showFloorDevice(floorDist) {
    const { object, deviceList, building, floor } = floorDist;

    // 添加或修改设备
    deviceList.forEach(s => {
      const { device } = s;
      s.object.traverse(o => {
        if (o.isMesh) {
          // o.position.x = device.locationX != undefined ? device.locationX : 0;
          // o.position.y = device.locationY != undefined ? device.locationY : 1;
          // o.position.z = device.locationZ != undefined ? device.locationZ : 0;
          // if (device.scaleX && device.scaleY && device.scaleZ) {
          //   o.scale.set(device.scaleX, device.scaleY, device.scaleZ);
          // }
          console.log(o)
        }
      });
      s.object.position.set(20, 10, 20);
      object.add(s.object);

    });

    const cube = this.cube.clone();
    object.add(cube);
    // this.controls.reset();
    cube.traverse(o => {
      if (o.isMesh) {
        this.raycasterList.push(o);
      }
    })
    const center = object.caniuse.center;
    const size = { x: 61435, y: 3000, z: 16645 };
    const site = { x: 10625, y: 1500, z: 2284 };
    const { x, y, z } = countSite(center, size, site);
    console.log(x, y, z, center, '---------------');
    cube.position.set(x, y, z);

  }

  mock() {
    setTimeout(() => {
      this.setState({
        data: [
          {
            building: '2号楼',
            floor: 200,
            status: 2,
          },
          {
            building: '3号楼',
            floor: 400,
            status: 2,
          }
        ]
      }, () => {
        const { raycasterList, modelCache } = this;

        this.state.data.forEach(data => {
          const { building, floor, status } = data;
          let currentBuilding = modelCache[building];
          const { object, markObject, markList, fireList } = currentBuilding;

          object.traverse(o => {
            if (o.isMesh) {
              if (+o.userData.name === +floor) {
                if (!fireList.some(s => s === o) && +status === 2) { // 报警
                  raycasterList.push(o);
                  fireList.push(o);
                  o.material.visible = true;
                  o.realClick = true; // 避免和主楼点击透视冲突
                  o.caniuse = data; // 将数据传给模型
                } else if (+status === 8) { // 恢复
                  // 先隐藏
                  o.material.visible = false;

                  // 然后从数组中移除
                  let index = fireList.indexOf(o);
                  fireList.splice(index, 1);
                  raycasterList.splice(index, 1);
                }
              }
            }
          });

          let markLength = markList.length;
          if (fireList.length && !markLength) { // 添加钻石动画
            markList.push(markObject);
            markObject.material.visible = true;
          } else if (!fireList.length && markLength) { // 移除钻石动画
            let index = markList.indexOf(markObject)
            markList.splice(index, 1);
            markObject.material.visible = false;
          }
        })

      });
    }, 1000 * 2);
  }

  componentDidMount() {
    this.init();
    this.draw();
    // this.initGui();
    const bloomLayer = new THREE.Layers();
    bloomLayer.set(0);
    this.bloomLayer = bloomLayer;

    // this.loadTexture();

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

    this.linkSocket();

    this.mock();

    this.loadObjModel('/xfy/public/obj/sensor/烟感', (obj) => {

      obj.traverse(o => {
        if (o.isMesh) {
          o.layers.set(0);
          // o.material.color = new THREE.Color(0xffffff);
          this.raycasterList.push(o);
        }
      })
      this.scene.add(obj)
    });
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
