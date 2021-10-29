import React from 'react';
import {
  initRenderer,
  initCamera,
  initScene,
  initLight,
  initControls,
  initLoader
} from '../../components/common/Init.js';
import { setContent, ringCircle, pyramid } from '../../components/common/Tool.js';
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

const tok = 30;

let modelList = [
  { name: '1build' },
  { name: '2build' },
  { name: '3build' },
  { name: '5build' },
  { name: '6build' },
  { name: '7build' },
  { name: '8build' },
  { name: '9build' },
  { name: '10build' },
  { name: '11build' },
  { name: '15build' },
  { name: '16build' },
  { name: '17build' },
  { name: '18build' },
  { name: '18cbuild' },
  { name: '19build' },
  { name: '20build' },
  { name: '21build' },
];

const bgModelList = [
  { name: 'bg_floor' },
  { name: 'bg_road' },
  { name: 'bg_build' },
];

const initCircle = (obj) => {
  let ring = ringCircle();

  ring.position.x = 0;
  ring.position.z = 0;
  ring.position.y = 400;
  ring.scale.x *= 254;
  ring.scale.y *= 254;
  ring.scale.z *= 254;
  ring.name = 'signal-circle';
  ring.traverse(o => {
    if (o.isMesh) {
      o.material.visible = true;
    }
  });
  obj.add(ring);
  return ring;
}

const initPyramid = (obj) => {
  let ring = pyramid();

  ring.name = 'signal-pyramid';
  ring.position.x = obj.position.x;
  ring.position.z = obj.position.z;
  ring.traverse(o => {
    if (o.isMesh) {
    }
  });
  obj.add(ring);
}

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

    // controls.addEventListener('change', () => {
    //   renderer.render(scene, camera);
    //   // this.renderPanel();
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
    if (this.xx) {
      this.xx.scale.x += 1;
      this.xx.scale.y += 1;
      this.xx.material.opacity -= 1 / (300);
      if (this.xx.scale.x > 300) {
        this.xx.scale.x = 2;
        this.xx.scale.y = 2;
        this.xx.material.opacity = 1;
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  componentDidUpdate() { }

  componentDidMount() {
    this.init();
    this.initEvent();
    this.draw();

    const { scene, camera, controls, gltfLoader, textureLoader, renderer } = this;

    let radianceMap = null;
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    new RGBELoader()
      .setDataType(THREE.UnsignedByteType)
      // .setDataType( THREE.FloatType )
      // .setPath('textures/equirectangular/')
      .load('/static/texture/equirectangular/pedestrian_overpass_1k.hdr', function (texture) {

        radianceMap = pmremGenerator.fromEquirectangular(texture).texture;
        pmremGenerator.dispose();

        // scene.environment = radianceMap;

      });

    const textureDist = {
      fire: new THREE.Texture()
    };

    // textureLoader.load('/static/modle/color-fire.png', texture => {
    //   texture.encoding = THREE.sRGBEncoding;
    //   texture.wrapS = THREE.RepeatWrapping;
    //   texture.wrapT = THREE.RepeatWrapping;
    //   texture.repeat.set(1, 1);
    //   textureDist.fire = texture;
    // });

    textureDist.fire = textureLoader.load('/static/modle/color-fire.png');
    textureDist.build = textureLoader.load('/static/modle/color0.png');

    const material = new THREE.MeshStandardMaterial({
      map: textureDist.build,
      emissiveMap: textureDist.build,
      emissiveIntensity: 0.1,
      emissive: new THREE.Color('#5285fb'),
      transparent: true,
      opacity: 0.9
    });

    const materialFire = new THREE.MeshStandardMaterial({
      map: textureDist.fire,
      transparent: true
    });

    [
      // { name: 'build1' },
      // { name: 'build2' },
      // { name: 'build3' },
      // { name: 'build4' },
      // { name: 'build5' },
      // { name: 'build6' },
      // { name: 'build7' },
      // { name: 'build8' },
      // { name: 'build9' },
      // { name: 'build10' },
      // { name: 'build11' },
      // { name: 'build12' },
      // { name: 'build15' },
      // { name: 'build16' },
      // { name: 'build16p' },
      // { name: 'build18' },
      // { name: 'build20' },
      // { name: 'build21' },
      // { name: 'C8' },
      {name:'A2-1'},
    ].map(s => {
      gltfLoader.load(`/static/modle/${s.name}.gltf`, object => {
        const obj = object.scene;
        console.log(object, obj);
        obj.traverse(o => {
          if (o.isMesh) {
            o.material.transparent = true;
            switch (o.parent.name) {
              case 'build':
                // const material = new THREE.MeshStandardMaterial({
                //   // map: textureDist.build
                //   color: '#fff'
                // });
                const buildMaterial = material.clone();
                buildMaterial.metalness = 0.1;
                buildMaterial.roughness = 0.9;

                // o.material = buildMaterial

                console.log(o, `---${s.name}---`)
                o.realClick = 'building';

                console.log(o, '---build---');

                this.raycasterList.push(o);
                break;
              case 'fire':
                o.material = materialFire.clone();
                // o.material.color = new THREE.Color('#fff');
                // o.material.emissive = new THREE.Color('#fff');
                // o.material.map = textureDist.fire;
                // o.material.emissiveMap = textureDist.fire;
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
              case 'wall':
                const wallMaterial = material.clone();
                o.material = wallMaterial;
                break;
              case 'floor':
                const floorMaterial = material.clone();
                o.material = floorMaterial;
                break;
              default:
                console.error('未按规则分组命名模型, 无法识别QAQ', o);
                break;
            }
          }
        });

        initPyramid(obj);
        scene.add(obj);
        setContent(camera, controls, obj)
      });
    })

    // const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    // scene.add(light);

    // const directLightX = new THREE.DirectionalLight('#fff', 0.3);
    // directLightX.position.set(1,0,0);
    // directLightX.castShadow = true;
    // scene.add(directLightX);

    // const directLightZ = new THREE.DirectionalLight('#fff', 0.3);
    // directLightZ.position.set(0,0,1);
    // directLightZ.castShadow = true;
    // scene.add(directLightZ);

    this.xx = initCircle(scene);


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
