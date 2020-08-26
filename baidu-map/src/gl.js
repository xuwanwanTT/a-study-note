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

var pt = new BMapGL.Point(116.399373,39.915606);
var myIcon = new BMapGL.Icon('./img/marker.png', new BMapGL.Size(58, 73));
var marker = new BMapGL.Marker(pt, {
  icon: myIcon
});  // 创建标注
bmapgl.addOverlay(marker);

var point = new BMapGL.Point(116.399373,39.915606);
var content = 'XXX停车场';
var label = new BMapGL.Label(content, {       // 创建文本标注
    position: point,
    offset: new BMapGL.Size(10, 20)
})
bmapgl.addOverlay(label);                        // 将标注添加到地图中
label.setStyle({                              // 设置label的样式
    color: '#fff',
    fontSize: '30px',
    transform:'translate(-50%,-100px)',
    background:'none',
    border:'none'
})

var point = new BMapGL.Point(116.399373,39.915606);
var content = 'XXX停车场';
var label = new BMapGL.Label(content, {       // 创建文本标注
    position: point,
    offset: new BMapGL.Size(10, 20)
})
bmapgl.addOverlay(label);                        // 将标注添加到地图中
label.setStyle({                              // 设置label的样式
    color: '#fff',
    fontSize: '30px',
    transform:'translate(-50%,-100px)',
    background:'none',
    border:'none'
})
