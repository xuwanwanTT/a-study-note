var map = new BMap.Map("container");
map.centerAndZoom(new BMap.Point(118.454, 32.955), 6);
map.enableScrollWheelZoom();
var beijingPosition = new BMap.Point(116.432045, 39.910683),
  hangzhouPosition = new BMap.Point(120.129721, 30.314429),
  taiwanPosition = new BMap.Point(121.491121, 25.127053);
var points = [beijingPosition, hangzhouPosition, taiwanPosition];

var curve = new BMapLib.CurveLine(points, { strokeColor: "blue", strokeWeight: 3, strokeOpacity: 0.5 }); //创建弧线对象
map.addOverlay(curve); //添加到地图中

var pt = new BMap.Point(116.403748, 39.915055);
var myIcon = new BMap.Icon('./img/light.png', new BMap.Size(60, 60));
myIcon.setAnchor(new BMap.Size(30, 30))
var marker = new BMap.Marker(pt, {
  icon: myIcon
});  // 创建标注
map.addOverlay(marker);
let siteArr = curve.ka;
let diff = 0;
setInterval(() => {
  if (diff > siteArr.length - 1) diff = 0;
  let site = siteArr[diff];
  marker.setPosition(new BMap.Point(site.lng, site.lat));
  diff++
}, 1000 / 25)

