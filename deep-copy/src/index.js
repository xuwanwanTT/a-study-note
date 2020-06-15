function deepClone(source) {
  let dist;
  if (source instanceof Array) {
    dist = new Array();
    for (let i = 0; i < source.length; i++) {
      dist[i] = deepClone(source[i]);
    }
  } else if (source instanceof Function) {
    dist = new Function();
    dist = deepClone(dist.bind(source))
  } else if (source instanceof Object) {
    dist = new Object();
    for (let key in source) {
      dist[key] = deepClone(source[key]);
    }
  } else {
    dist = source;
  }
  console.log(dist)
  return dist;
};

module.exports = deepClone;
