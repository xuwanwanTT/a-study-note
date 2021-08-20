importScripts('https://unpkg.com/axios/dist/axios.min.js');

postMessage("I\'m working before postMessage(\'ali\').");

onmessage = function (oEvent) {
  postMessage('Hi ' + oEvent.data);
};

let index = 0;

const getData = () => {
  axios.post('http://192.168.10.9:7001/xfy/api/register/caniuse').then(res => {
    return res.data
  }).then(res => {
    index++;
    postMessage(JSON.stringify({ index, data: res }));
    timer = setTimeout(() => {
      getData();
    }, 1000);
  }).catch(err => {
    timer = setTimeout(() => {
      getData();
    }, 1000);
  })
};

getData();