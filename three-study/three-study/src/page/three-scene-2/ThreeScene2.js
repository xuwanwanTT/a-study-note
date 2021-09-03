import React from 'react';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

class ThreeScene2 extends React.Component {
  constructor() {
    super();
    this.init = this.init.bind(this);
    this.initRenderer = this.initRenderer.bind(this);
    this.initCamera = this.initCamera.bind(this);
    this.initControls = this.initControls.bind(this);
    this.initLight = this.initLight.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.initEvent = this.initEvent.bind(this);
    this.initLoader = this.initLoader.bind(this);
    this.draw = this.draw.bind(this);

    this.supportLoader = {};
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
  }

  init() {
    this.initRenderer();

    const scene = new THREE.Scene();
    this.scene = scene;

    this.initCamera();

    this.initControls();

    this.initLight();

    this.raycaster = new THREE.Raycaster();
    this.raycasterList = []; // 允许点击的物体
    this.mouse = new THREE.Vector2();

    this.initEvent();

    this.initLoader();
  }

  initRenderer() {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.toneMapping = THREE.ReinhardToneMapping;
    // 设置渲染器的像素比例 window.devicePixelRatio 浏览器的像素比例
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 设置色彩空间，确保 web 呈现和模型一致
    renderer.outputEncoding = THREE.sRGBEncoding;

    renderer.physicallyCorrectLights = true;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.renderer = renderer;
  }

  initCamera() {
    const { defaultCameraOption } = this;
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
    scene.add(light1);

    const light2 = new THREE.DirectionalLight(0xFFFFFF, 0.8 * Math.PI);
    light2.transparent = true;
    light2.opacity = 0.1;
    light2.position.set(0.5, 0, 0.866); // ~60º
    light2.name = 'main_light';
    camera.add(light2);

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
      // vignette.style({ aspect: camera.aspect });

      renderer.setSize(width, height);

      // bloomComposer.setSize(width, height);
      // finalComposer.setSize(width, height);

    };
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

    this.supportLoader = {
      gltf: gltfLoader, glb: gltfLoader,
      fbx: fbxLoader,
    };

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

      }
    }

  }

  setMainCamera() {
    const { camera, controls, defaultCameraOption } = this;
    const { position, rotation, fov, near, far } = defaultCameraOption;
    const { x, y, z } = position;
    camera.position.set(x, y, z);
    const { _x, _y, _z } = rotation;
    camera.rotation.set(_x, _y, _z);

    camera.updateProjectionMatrix();
    controls.reset();
  }

  draw() {
    requestAnimationFrame(this.draw);

    const { stats, renderer, camera, scene, alarmList, tok } = this;

    renderer.render(scene, camera);
  }

  componentDidMount() {
    this.init();
    this.draw();
    const { renderer, camera, scene, } = this;

    // this.pmremGenerator = new THREE.PMREMGenerator(renderer);
    // this.pmremGenerator.compileEquirectangularShader();

    scene.add(camera);

    // append
    this.domWrap.appendChild(renderer.domElement);

    this.gltfLoader.load('/static/modle/最终导出模型.gltf', (object) => {
      const obj = object.scene;
      obj.traverse((o) => {
        if (!o.isMesh) return;
        // o.material.transparent = true;
        // o.material.color = new THREE.Color('red');
      });
      scene.add(obj);
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
        }} onClick={() => {
          this.setMainCamera()
        }} >back</div>
      </>
    )
  }
};

export default ThreeScene2;
