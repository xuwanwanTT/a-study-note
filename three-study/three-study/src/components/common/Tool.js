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

export const ringCircle = () => {
  const geometry = new THREE.RingBufferGeometry(0.1, 0.5, 20);
  const material = new THREE.MeshPhysicalMaterial({
    color: "#ad2317",
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.7
  });

  const obj = new THREE.Mesh(geometry, material);

  obj.rotation.x = Math.PI / 2;
  obj.position.y = 1;
  obj.isAlarm = true; //表示是报警
  return obj;
}


export {
  countSite,
  toScreenPosition,
};
