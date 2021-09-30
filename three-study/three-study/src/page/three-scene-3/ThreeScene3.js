import React from 'react';
import {
  initRenderer,
  initCamera,
  initScene,
  initLight,
  initControls,
  initLoader
} from '../../components/three-init/ThreeInit.js';
import * as THREE from 'three';

class ThreeScene3 extends React.Component {
  constructor() {
    super();
    this.state = {};
    this.init = this.init.bind(this);

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
    this.supportLoader = initLoader();

    this.scene.add(this.camera);
    this.scene.add(ambiLight);
    this.camera.add(directLight);
    this.camera.add(pointLight);

    this.domWrap.appendChild(this.renderer.domElement);
  }

  componentDidUpdate() { }

  componentDidMount() {
    this.init();
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
