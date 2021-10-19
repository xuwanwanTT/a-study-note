import React from 'react';
import {
  initRenderer,
  initCamera,
  initScene,
  initLight,
  initControls,
  initLoader
} from '../../components/common/Init.js';
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

const tok = 30;

let modelList = [
  { name: '1号楼' },
  { name: '2号楼' },
  { name: '3号楼' },
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
];

const bgModelList = [
  { name: 'bg_floor' },
  { name: 'bg_road' },
  { name: 'bg_build' },
];

class ThreeScene3 extends React.Component {
  constructor() {
    super();
    this.state = {};
    this.init = this.init.bind(this);

    this.draw = this.draw.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);

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
  }

  init() {
    this.renderer = initRenderer();
    this.camera = initCamera(this.defaultCameraOption);
    this.controls = initControls(this.renderer, this.camera);
    const { ambiLight, directLight, pointLight } = initLight();
    this.scene = initScene();
    const supportLoader = initLoader();
    this.gltfLoader = supportLoader.gltf;
    this.textureLoader = supportLoader.texture;

    this.scene.add(this.camera);
    this.scene.add(ambiLight);
    this.camera.add(directLight);
    // this.camera.add(pointLight);

    this.raycaster = new THREE.Raycaster();
    this.raycasterList = []; // 允许点击的物体
    this.raycasterHoverList = []; // 允许鼠标 hover 的物体
    this.mouse = new THREE.Vector2();

    this.fireList = [];

    this.domWrap.appendChild(this.renderer.domElement);
  }

  initEvent() {
    const { onPointerDown, controls, scene, camera, renderer, vignette } = this;

    window.addEventListener('click', onPointerDown, false);

    // window.addEventListener('mousemove', onMousemove, false);

    controls.addEventListener('change', () => {
      renderer.render(scene, camera);
      // this.renderPanel();
    });

    window.onresize = () => {

      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      vignette.style({ aspect: camera.aspect });

      renderer.setSize(width, height);

      // bloomComposer.setSize(width, height);
      // finalComposer.setSize(width, height);

    };
  }

  onPointerDown(event) {
    const { camera, renderer, raycasterList, raycasterHoverList, mouse, raycaster } = this;

    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(raycasterList);

    if (intersects.length > 0) {
      const object = intersects[0].object;
      if (this.camera.layers.test(object.layers) && object.realClick) {
        switch (object.realClick) {
          case 'building':
            console.log('点击了大楼: ', object);
            const fireObject = 1 || object.fireList[0];
            if (fireObject && +fireObject.name === 0) {
              // const { building, floor, path } = fireObject.caniuse;
              // this.changeFloor({ value: building, name: path }, { value: floor });
            } else {
              raycasterHoverList.forEach(o => {
                if (object === o && !o.hovered) {
                  // 此处需要获取 object3D 用来计算楼层位置
                  // const buildObject = this.modelCache[object.buildInfo.building].object.children[0];
                  // buildObject.buildInfo = object.buildInfo;
                  // buildObject.isShow = true;
                  // this.panelBuildObject = buildObject;
                  // const site = this.toScreenPosition(buildObject, camera, renderer);
                  // this.chartControlRef.setBuild({ ...object.buildInfo, ...site });
                } else if (object === o && o.hovered) {
                  // this.panelBuildObject.isShow = false;
                  // this.chartControlRef.setBuild({ ...object.buildInfo, x: -500, y: -500 });
                } else if (object !== o && o.hovered) {
                  // o.hovered = !o.hovered;
                  // this.changeHighLight(o);
                }
              });
              object.traverse(o => {
                if (o.isMesh) {
                  // o.hovered = !o.hovered;
                  // this.changeHighLight(o);
                }
              });
            }
            break;
          case 'floor':
            console.log('点击了报警层: ', object);
            // const { building, floor, path } = object.caniuse;
            // this.changeFloor({ value: building, name: path }, { value: floor });
            break;
          case 'device':
            console.log('点击了设备: ', object);
            // this.props.store.device.checkIn3d(object.parent.device.id);
            // this.outlinePass.selectedObjects = [object];
            break;
          default:
            console.log('点击了未标示物体', intersects);
        }
      }
    }

    // console.log('controls: ', this.controls);
    // console.log('camera: ', camera);

  }

  tick = 0;
  draw() {
    requestAnimationFrame(this.draw);
    this.tick++;
    if (this.tick > tok) {
      this.tick = 0;
      this.fireList.forEach(o => {
        if (o) {
          o.material.opacity = o.material.opacity === 0.5 ? 1 : 0.5;
        }
      });
    }

    this.renderer.render(this.scene, this.camera);
  }

  componentDidUpdate() { }

  componentDidMount() {
    this.init();
    this.initEvent();
    this.draw();

    const { scene, gltfLoader, textureLoader, renderer } = this;

    let radianceMap = null;
    // const pmremGenerator = new THREE.PMREMGenerator(renderer);
    // pmremGenerator.compileEquirectangularShader();

    new RGBELoader()
      .setDataType(THREE.UnsignedByteType)
      // .setDataType( THREE.FloatType )
      // .setPath('textures/equirectangular/')
      .load('/static/texture/equirectangular/venice_sunset_1k.hdr', function (texture) {

        // radianceMap = pmremGenerator.fromEquirectangular(texture).texture;
        // pmremGenerator.dispose();

        // scene.environment = radianceMap;

      });

    const textureDist = {
      fire: new THREE.Texture()
    };

    textureLoader.load('/static/modle/color-fire.png', texture => {
      texture.encoding = THREE.sRGBEncoding;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 1);
      textureDist.fire = texture;
    });

    textureLoader.load('/static/modle/color1.png', texture => {
      texture.encoding = THREE.sRGBEncoding;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 1);
      textureDist.build = texture;

      const geometry = new THREE.BoxGeometry(50, 50, 50);
      const material = new THREE.MeshStandardMaterial({ color: 0x69c3fd });
      // material.emissiveMap = textureDist.build;
      // material.map = textureDist.build
      material.emissive = new THREE.Color(0x69c3fd)
      console.log(material, '--material--');
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);
    });

    gltfLoader.load('/static/modle/build2.gltf', object => {
      const obj = object.scene;
      console.log(object, obj);
      obj.traverse(o => {
        if (o.isMesh) {
          o.material.transparent = true;
          switch (o.parent.name) {
            case 'build':
              // o.material.opacity = 0.9;
              o.material.color.set('#fff');
              o.material.emissive.set('#fff');
              o.material.map = textureDist.build;
              o.material.emissiveMap = textureDist.build;
              o.material.metalness = 0.1;
              o.material.roughness = 0.9;

              o.realClick = 'building';

              this.raycasterList.push(o);
              break;
            case 'fire':
              o.material = o.material.clone();
              o.material.color = new THREE.Color('#fff');
              o.material.emissive = new THREE.Color('#fff');
              o.material.map = textureDist.fire;
              o.material.emissiveMap = textureDist.fire;
              o.material.metalness = 0.1;
              o.material.roughness = 0.9;
              o.material.visible = false;
              o.realClick = 'floor';
              o.shadowSide = THREE.BackSide;

              if (+o.name === 300) {
                o.material.visible = true;
                this.fireList.push(o);
                this.raycasterList.push(o);
              }
              break;
            case 'mark':
              // console.log('mark: ', o)
              if (o.userData.name === 'fire-mark') {
                o.material = o.material.clone();
                o.material.visible = false;
                o.realClick = 'mark';
              }
              break;
            default:
              console.error('未按规则分组命名模型, 无法识别QAQ', o);
              break;
          }
        }
      });
      scene.add(obj);
    });

  }

  render() {
    return (
      <>
        <div ref={refs => this.domWrap = refs} />
      </>
    );
  }

  componentWillUnmount() { }

};

export default ThreeScene3;
