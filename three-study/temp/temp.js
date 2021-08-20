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
import { GUI } from 'three/examples/jsm/libs/dat.gui.module';
import Stats from 'three/examples/jsm/libs/stats.module.js';

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

class Langyuan3D extends React.Component {
  constructor() {
    super();
    this.state = {};
    this.loadModel = this.loadModel.bind(this);
    this.draw = this.draw.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.drawBloom = this.drawBloom.bind(this);
    this.darkenNonBloomed = this.darkenNonBloomed.bind(this);
    this.restoreMaterial = this.restoreMaterial.bind(this);
    this.initLoader = this.initLoader.bind(this);
  }

  init() {
    // new renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.toneMapping = THREE.ReinhardToneMapping;
    // 设置渲染器的像素比例 window.devicePixelRatio 浏览器的像素比例
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // 设置色彩空间，确保 web 呈现和模型一致
    renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer = renderer;

    // append
    this.domWrap.appendChild(renderer.domElement);

    // new scene
    const scene = new THREE.Scene();
    this.scene = scene;

    // new camera
    const camera = new THREE.PerspectiveCamera(2.5, window.innerWidth / window.innerHeight, 1, 7500);
    camera.position.set(0, 0, 20);
    camera.lookAt(0, 0, 0);
    this.camera = camera;

    scene.add(camera);

    // new controls
    const controls = new OrbitControls(camera, renderer.domElement);
    // controls.target.set(0, 0.5, 0);
    // controls.update();
    controls.enablePan = true; // 右键拖拽
    // controls.enableDamping = true; // damping (阻尼) 缓动效果
    this.controls = controls;

    // new light
    scene.add(new THREE.AmbientLight(0x404040));
    const pointLight = new THREE.PointLight(0xffffff, 1);
    camera.add(pointLight);

    //
    this.renderScene = new RenderPass(scene, camera);

    this.raycaster = new THREE.Raycaster();
    this.raycasterList = []; // 允许点击的物体

    this.mouse = new THREE.Vector2();

    this.materials = {};

    this.initHalo();

    this.initMaterial();

    this.initEvent();

    this.initLoader();
  }

  initMaterial() {
    this.faceNormalMaterial = new THREE.MeshBasicMaterial({ color: "black" });

    this.darkMaterial = new THREE.MeshPhongMaterial({
      transparent: 0,
      color: '#00ffff',
      opacity: 0.1
    });

  }

  initHalo() {
    const { renderScene, renderer } = this;
    const params = {
      exposure: 1,
      bloomStrength: 1.2,
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
    dracoLoader.setDecoderPath('three/examples/js/libs/draco');
    gltfLoader.setDRACOLoader(dracoLoader);
    this.gltfLoader = gltfLoader;

    // fbx
    const fbxLoader = new FBXLoader();

    this.supportLoader = { gltf: gltfLoader, glb: gltfLoader, fbx: fbxLoader };

  }

  initEvent() {
    const { onPointerDown, draw, controls, camera, renderer, bloomComposer, finalComposer } = this;

    controls.addEventListener('change', draw);

    window.addEventListener('click', onPointerDown, false);

    window.onresize = () => {

      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);

      bloomComposer.setSize(width, height);
      finalComposer.setSize(width, height);

      this.draw();

    };
  }

  loadModel(option) {
    const { draw, scene, raycasterList, supportLoader } = this;
    const { url } = option;

    let loaderType = url.match(/.+\.(.+)/)[1];

    if (!loaderType) {
      console.error('不支持此模型文件');
      return false;
    }

    let loader = supportLoader[loaderType];

    loader.load(url, (object) => {
      const obj = object.scene;

      obj.traverse((o) => {
        if (!o.isMesh) return;
        const lineMaterial = new THREE.LineBasicMaterial({
          // 线的颜色
          color: '#00ffff',
          transparent: true,
          linewidth: 1,
          opacity: 1.0,
          //depthTest: true,
        });
        //解决z-flighting
        lineMaterial.polygonOffset = true;
        lineMaterial.depthTest = true;
        lineMaterial.polygonOffsetFactor = 1;
        lineMaterial.polygonOffsetUnits = 1.0;

        let edges = new THREE.EdgesGeometry(o.geometry);
        // edges.scale(1, 1, 1)
        let lineS = new THREE.LineSegments(edges, lineMaterial);
        // lineS.rotateY(Math.PI / 4);
        // lineS.rotateX(Math.PI / 2);
        o.add(lineS);
        raycasterList.push(o);
      });

      obj.name = 'xxx'

      scene.add(obj);

      draw();

    });
  }

  onPointerDown(event) {
    const { draw, scene, raycasterList, camera, mouse, raycaster } = this;

    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    console.log(raycasterList, mouse, '---raycasterList---')

    const intersects = raycaster.intersectObjects(raycasterList);

    console.log(intersects, intersects.length, '---点击啦~');
    if (intersects.length > 0) {
      const object = intersects[0].object;
      object.layers.toggle(BLOOM_SCENE);
      draw();
    }

  }

  draw() {
    console.log('重绘啦~')
    const { renderer, scene, camera, drawBloom, finalComposer } = this;
    // renderer.render(scene, camera);

    drawBloom(true);
    finalComposer.render();
  }

  drawBloom(mask) {

    const { scene, camera, bloomComposer, restoreMaterial, darkenNonBloomed } = this;

    if (mask === true) {
      console.log('what is it')
      scene.traverse(darkenNonBloomed);
      bloomComposer.render();
      scene.traverse(restoreMaterial);

    } else {
      console.log('这是个啥？')
      camera.layers.set(BLOOM_SCENE);
      bloomComposer.render();
      camera.layers.set(ENTIRE_SCENE);

    }

  }

  darkenNonBloomed(obj) {

    const { bloomLayer, materials, darkMaterial } = this;
    console.log(bloomLayer.test(obj.layers))
    if (obj.isMesh && bloomLayer.test(obj.layers) === false) {

      materials[obj.uuid] = obj.material;
      obj.material = darkMaterial;

    }

  }

  restoreMaterial(obj) {

    const { materials } = this;

    if (materials[obj.uuid]) {
      console.log('restore 啦~', materials)

      obj.material = this.darkMaterial;

      obj.material = materials[obj.uuid];
      delete materials[obj.uuid];

    }

  }

  linkSocket() {
    const socket = new WebSocket('ws://localhost:8090', 'xf');
    console.log(socket)
    socket.addEventListener('open', function (event) {
      socket.send('3d linked');
    });
    socket.onopen = () => { console.log('open'); };
    socket.onmessage = (event) => { console.log('socket: ', event.data); };
  }

  componentDidMount() {
    this.init();

    const url = '/xfy/public/obj/0_14.gltf'
    this.loadModel({ url });

    this.linkSocket();
  }

  render() {
    return (
      <>

        <div ref={refs => this.domWrap = refs} />

      </>
    );
  }
};

export default Langyuan3D;
