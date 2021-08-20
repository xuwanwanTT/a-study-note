let myWorker = new Worker('worker.js');

const render = (index, data) => {
  let text1 = document.querySelector('#text1');
  text1.innerText = index;

  let text2 = document.querySelector('#text2');
  text2.innerText = JSON.stringify(data);

  let text3 = document.querySelector('#text3');
  text3.innerText = new Date();
};

myWorker.onmessage = function (res) {
  try {
    const { index, data } = JSON.parse(res.data);
    render(index, data)
  } catch {
    console.log(res.data)
  }

};

myWorker.postMessage('ali');