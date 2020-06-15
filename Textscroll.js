class Text {
  constructor(ctx, ySite, height, isRotate) {
    this.step = 0.01;
    this.stepV = .5 + Math.random() * .5;
    this.angle = 0;
    this.ySite = ySite;
    this.ctx = ctx;
    this.height = height;
    this.isRotate = isRotate;
    this.data = '' + ~~(2 * Math.random());
    let len = height / 20 - 1;
    let temp = ['学习使我快乐 ', '我爱学习 我爱学习 ', '沉迷学习 无法自拔 ', '沉迷学习 日渐消瘦 ', '想学习 想得睡不着 ', '我爱学习 学习使我快乐 ', '我的心里只有一件事 就是学习 ', '不让我学习 不如让我去死 ', '谁也阻止不了我学习 ']
    let textTemp = temp[~~(Math.random() * temp.length)];
    for (let i = 0; i < ~~((height / 20 - 1) / textTemp.length) + 1; i++) {
      textTemp += textTemp;
    }
    textTemp += textTemp.slice(0, (height / 20 - 1) % textTemp);
    this.data = textTemp;
    for (let i = 0; i < height / 20 - 1; i++) {
      // this.data += ~~(2 * Math.random());
    }
    this.speed = Math.random() * 10 + 10;
  }
  draw() {
    let data = this.data;
    let step = this.step;
    let angle = this.angle;
    let ySite = this.ySite;
    let ctx = this.ctx;
    if (step > data.length * 20 + this.height) { this.step = this.height; }
    for (let i = 0; i < data.length; i++) {
      let text = data[i];
      ctx.save();
      ctx.globalAlpha = .8 * Math.abs(Math.sin(angle + Math.PI / 2 - (i * Math.PI / 2 / (data.length - 1)))) + .1;
      let y = -data.length * 20 + 20 * i + step;
      if (y > this.height) { y = -data.length * 20 + 20 * i + step - this.height; }
      if (this.isRotate) {
        ctx.translate(ySite, y);
        ctx.rotate(-Math.PI / 2);
        ctx.translate(-ySite, -y);
      }
      ctx.fillText(text, ySite, y);
      ctx.restore();
      this.angle += Math.PI / 180 / this.speed;
    }
    this.step += this.stepV;
  }
}

class Textscroll {
  constructor(options) {
    this.textArr = [];
    this.init(options);
    this.createText();
  }

  init(options) {
    this.width = options.width;
    this.height = options.height;
    this.top = options.top;
    this.left = options.left;
    this.textColor = options.textColor;
    this.isRotate = options.isRotate;
    this.domElement = document.createElement('canvas');
    this.domElement.setAttribute('width', this.width);
    this.domElement.setAttribute('height', this.height);
    this.domElement.style.position = 'absolute';
    this.domElement.style.top = this.top + 'px';
    this.domElement.style.left = this.left + 'px';
    this.ctx = this.domElement.getContext('2d');
  }

  createText() {
    for (let i = 0; i < this.width / 30; i++) {
      this.textArr.push(new Text(this.ctx, 30 * i + 5, this.height, this.isRotate));
    }
  }

  draw() {
    const me = this;
    const ctx = me.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.beginPath();
    ctx.fillStyle = 'rebeccapurple';
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.fillStyle = me.textColor;
    ctx.font = `${18}px MicrosoftYaHei`;
    for (let k = 0; k < this.width / 30; k++) {
      me.textArr[k].draw();
    }
    me.timer = window.requestAnimationFrame(me.draw.bind(me));
  }

  stop() {
    cancelAnimationFrame(this.timer);
  }
}