// 1. 创建地图实例
var bmapgl = new BMapGL.Map('map_container');
var point = new BMapGL.Point(116.403748, 39.915055);
bmapgl.centerAndZoom(point, 19);
bmapgl.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
bmapgl.setHeading(44.5);
bmapgl.setTilt(73);

bmapgl.setMapStyleV2({
  styleId: 'e1a6fbddbcd0afdd4fbd8277faceb825'
});

var pt = new BMapGL.Point(116.403748, 39.915055);
var myIcon = new BMapGL.Icon('./img/marker.png', new BMapGL.Size(58, 73));
var marker = new BMapGL.Marker(pt, {
  icon: myIcon
});  // 创建标注
bmapgl.addOverlay(marker);
