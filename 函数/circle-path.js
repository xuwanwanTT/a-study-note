// 生成圆path
creatArc(R, r, start, end) {
  let path = this.arc()
    .cornerRadius(50)
    .innerRadius(r)
    .outerRadius(R)
    .startAngle(start)
    .endAngle(end);
  return path();
}