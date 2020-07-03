function Arrow(radius, color) {
  this.x = 0;
  this.y = 0;
  this.vx = 0;
  this.vy = 0;
  this.rotation = 0;
  this.color = color || 'green';
  this.radius = radius || 10;

}

Arrow.prototype.draw = function (ctx) {
  ctx.save();
  ctx.translate(this.x, this.y);
  ctx.rotate(this.rotation);
  ctx.lineWidth = 2;
  ctx.fillStyle = this.color;
  ctx.beginPath();
  ctx.arc(0, 0, this.radius, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};