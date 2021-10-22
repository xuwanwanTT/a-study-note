import * as THREE from 'three';

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

const toScreenPosition = (obj, camera) => {
  const widthHalf = 0.5 * window.innerWidth;
  const heightHalf = 0.5 * window.innerHeight;

  const box = new THREE.Box3().setFromObject(obj);
  const center = box.getCenter(new THREE.Vector3());
  this.panelCenter = center;

  // 1.5 表示距离模型顶部高度为 0.5 倍的模型高度
  const vector = new THREE.Vector3(center.x, center.y * 1.5, center.z);
  vector.project(camera);

  vector.x = (vector.x * widthHalf) + widthHalf;
  vector.y = - (vector.y * heightHalf) + heightHalf;

  return {
    x: vector.x,
    y: vector.y
  };

};

const setContent = (camera, controls, object, clips) => {

  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3()).length();
  const center = box.getCenter(new THREE.Vector3());
  controls.reset();

  object.position.x = -center.x;
  object.position.y = -center.y;
  object.position.z = -center.z;

  console.log(size, 'size')

  // controls.maxDistance = size * 10;
  camera.near = size / 1000;
  camera.far = size * 1000;
  camera.position.x = size;
  camera.position.y = size;
  camera.position.z = size;
  camera.lookAt(camera.position);
  camera.updateProjectionMatrix();

  controls.saveState();
  controls.reset();

}

const ringCircle = () => {
  const geometry = new THREE.RingBufferGeometry(0.1, 0.5, 20);
  const material = new THREE.MeshBasicMaterial({
    color: "#ad2317",
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.7
  });

  const obj = new THREE.Mesh(geometry, material);
  obj.renderOrder = 2;

  obj.rotation.x = Math.PI / 2;
  obj.position.y = 1;
  obj.isAlarm = true; //表示是报警
  return obj;
}

function transparentObject(geometry, material) {
  var obj = new THREE.Object3D();
  var mesh = new THREE.Mesh(geometry, material);
  mesh.material.side = THREE.BackSide; // back faces
  mesh.renderOrder = 0;
  obj.add(mesh);

  mesh = new THREE.Mesh(geometry, material.clone());
  mesh.material.side = THREE.FrontSide; // front faces
  mesh.renderOrder = 1;
  obj.add(mesh);
  return obj;
}

/**
 * 四棱锥
 * */
function pyramid() {
  let shader = {};
  shader.vs =
    "varying vec2 vUv;\n" +
    "void main(){\n" +
    "vUv = uv;\n" +
    "gl_Position = projectionMatrix*viewMatrix*modelMatrix*vec4( position, 1.0 );\n" +
    "}\n";

  shader.fs =
    "uniform float time;\n" +
    "varying vec2 vUv;\n" +
    "uniform sampler2D dtPyramidTexture;\n" +
    "uniform vec3 uColor;\n" +
    "void main() {\n" +
    " vec2 st = vUv;\n" +
    " vec4 colorImage = texture2D(dtPyramidTexture, vec2(vUv.x,fract(vUv.y-time)));\n" +
    //'float alpha=mix(0.1,1.0,clamp((1.0-vUv.y) * uColor.a,0.0,1.0)) +(1.0-sign(vUv.y-time*0.001))*0.2*(1.0-colorImage.r);\n'+
    "vec3 diffuse =(1.0-colorImage.a)*vec3(0.9,0.9,0.0)+colorImage.rgb*vec3(0.8,1.0,0);\n" +
    "gl_FragColor = vec4(diffuse,0.5);\n" +
    "}\n";

  let _uniforms = {
    dtPyramidTexture: {
      value: null,
    },
    time: {
      value: 0.0,
    },
    uColor: {
      value: new THREE.Color("#808000"),
    },
  };

  let shaderMaterial = new THREE.ShaderMaterial({
    uniforms: _uniforms,
    vertexShader: shader.vs,
    fragmentShader: shader.fs,
    side: THREE.DoubleSide,
    transparent: true,
  });
  /**
   * radiusTop - 顶部圆柱的半径。默认值为1。
    radiusBottom - 底部圆柱的半径。默认值为1。
    height - 圆柱体的高度。默认值为1。
    radialSegments - 圆柱体圆周周围的分割面数。默认值为8。
    heightSegments - 沿圆柱高度的面的行数。默认值为1。
    openEnded - 一个布尔值，指示圆柱的末端是打开还是加盖。默认值为false，表示上限。
    thetaStart - 第一段的起始角度，默认值为0（三点钟位置）。
    thetaLength - 圆形扇区的中心角，通常称为theta。默认值为2 * Pi，这样可以获得完整的柱面。
   */
  let geo = new THREE.CylinderBufferGeometry(0, 1, 1.5, 4, 1, false, 0, 6.3);
  geo.computeBoundingSphere();
  geo.translate(0, -5, 0);
  geo.rotateZ(Math.PI);
  let renderObject = transparentObject(geo, shaderMaterial);
  renderObject.isAlarm = true; //表示是报警
  return renderObject;
}


export {
  countSite,
  toScreenPosition,
  setContent,
  ringCircle,
  pyramid,
};
