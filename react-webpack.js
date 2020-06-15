//批量 import
const requireContext = require.context("./image/", true, /(.+)\.(jpg||jpeg)$/);
const images = requireContext.keys().map(requireContext);
const indexArr = images.map((s, i) => {
  let reg = /\/static\/media\/(.+)\./;
  let name = s.match(reg)[1].split('.')[0]; //文件名
});