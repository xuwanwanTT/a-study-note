import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { TDSLoader } from 'three/examples/jsm/loaders/TDSLoader.js';

const initRenderer = () => {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  // 设置渲染器的像素比例 window.devicePixelRatio 浏览器的像素比例
  renderer.setPixelRatio(1 || window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  // 设置色彩空间，确保 web 呈现和模型一致
  // renderer.outputEncoding = THREE.sRGBEncoding;
  // renderer.gammaOutput = false;

  // // renderer.setClearColor(0xcccccc);
  // renderer.physicallyCorrectLights = true;

  // renderer.toneMapping = THREE.CineonToneMapping;
  // renderer.toneMappingExposure = 1;

  // renderer.shadowMap.enabled = true;
  // renderer.shadowMap.type = THREE.BasicShadowMap;

  return renderer;
}

const initCamera = (option = {}) => {
  const { position = { x: 0, y: 0, z: 0 }, fov = 75, near = 0.01, far = 7500 } = option;
  const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far);
  const { x, y, z } = position;
  camera.position.set(x, y, z);

  camera.updateProjectionMatrix();

  return camera;
}

const initScene = (option = {}) => {
  const { background = '#050f1c' } = option;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(background);
  return scene;
};

const initLight = () => {
  const light = {};

  const ambiLight = new THREE.AmbientLight('#fff', 0.65);
  ambiLight.name = 'ambient_light';
  ambiLight.layers.enable(0);
  ambiLight.layers.enable(1);
  ambiLight.layers.enable(2);
  light.ambiLight = ambiLight;

  const directLight = new THREE.DirectionalLight('#fff', 0.65);
  directLight.layers.enable(0);
  directLight.layers.enable(1);
  directLight.layers.enable(2);
  // directLight.intensity = 4;
  directLight.position.set(0.5, 10, 0.866); // ~60º
  directLight.name = 'main_light';
  // directLight.castShadow = true;
  light.directLight = directLight;

  // const pointLight = new THREE.PointLight(0xffffff, 0.8);
  const pointLight = new THREE.SpotLight(0xffffff, 3);
  pointLight.position.set(200, 1500, 200);
  // pointLight.layers.enable(0);
  // pointLight.layers.enable(1);
  pointLight.layers.enable(2);
  light.pointLight = pointLight;

  return light;
};

const initControls = (renderer, camera, option = {
  enablePan: true, // 右键拖拽
  enableDamping: false // damping (阻尼) 缓动效果
}) => {
  const controls = new OrbitControls(camera, renderer.domElement);
  // controls.target.set(
  //   90.96655011954165,
  //   1.2312659286837143e-15,
  //   48.967619727049524,
  // );
  controls.enablePan = option.enablePan;
  controls.enableDamping = option.enableDamping;

  return controls;
}

const initLoader = () => {
  // gltf glb
  const gltfLoader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setCrossOrigin('anonymous');
  dracoLoader.setDecoderPath('three/examples/js/libs/draco');
  gltfLoader.setDRACOLoader(dracoLoader);

  // fbx
  const fbxLoader = new FBXLoader();

  const textureLoader = new THREE.TextureLoader();

  // obj
  // const objLoader = new OBJLoader2();

  // 3ds
  const tdsLoader = new TDSLoader();

  return {
    gltf: gltfLoader, glb: gltfLoader,
    fbx: fbxLoader,
    // obj: objLoader,
    tds: tdsLoader,
    texture: textureLoader,
  };

}

export { initRenderer, initCamera, initScene, initLight, initControls, initLoader };
