let canvas = document.querySelector('canvas');
let context = canvas.getContext('2d');

let size = (window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth);
let vSize = window.innerHeight;
let dpr = window.devicePixelRatio;
canvas.width = size * dpr;
canvas.height = size * dpr;
context.scale(dpr, dpr);
canvas.width = size;
canvas.height = size;
context.lineWidth = 2;

let step = size / 128; //10px between points

let lines = [];


function drawLines(buffer) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  // Create lines in array
  let bufferIndex = 127;
  for(let i = 0; i <= size - step; i+= step){
    let line = [];

    for(let j = 0; j <= size - step; j+= step){
      var distanceToCenter = Math.abs(j - size / 2);
      var variance = Math.max(size / 2 - 50 - distanceToCenter, 0);

      let normalized = (buffer[bufferIndex] - 0) / 255 - 0;
      // console.log(normalized);
      var random = (normalized * variance / 2 * -1);
      let point = {x: j, y: i + random}
      line.push(point);
    }
    lines.push(line);
    bufferIndex--;
  }

  // Print lines :O 
  for(let i = 5; i < lines.length; i++){
    context.beginPath();
    context.moveTo(lines[i][0].x, lines[i][0].y);

    for(var j = 0; j < lines[i].length - 2; j++){
      var xc = (lines[i][j].x + lines[i][j + 1].x) / 2;
      var yc = (lines[i][j].y + lines[i][j + 1].y) / 2;
      context.quadraticCurveTo(lines[i][j].x, lines[i][j].y, xc, yc);
      //context.lineTo(lines[i][j].x, lines[i][j].y);
    }

    context.quadraticCurveTo(lines[i][j].x, lines[i][j].y, lines[i][j + 1].x, lines[i][j + 1].y);
    context.save();
    context.globalCompositeOperation = 'destination-out';
    context.fill();
    context.restore();
    context.stroke();
  }
}

const audioElement = document.getElementById('wanted');

const bodyElement = document.getElementsByTagName('body');

bodyElement[0].addEventListener('click', () => {
  beginPlaying();
});

audioElement.load();

function beginPlaying(){
  console.log('clicky');
  audioElement.play();

  const audioCtx = new AudioContext();
  const analyser = audioCtx.createAnalyser();
  const source = audioCtx.createMediaElementSource(audioElement);

  console.log(`Sample rate: ${audioCtx.sampleRate}`);

  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  console.log(`fftSize = ${analyser.fftSize}`);
  console.log(`bufferLength = ${bufferLength}`);
  let dataArray = new Uint8Array(bufferLength);

  console.log(`Capturing frequency between 0-${audioCtx.sampleRate / 2}Hz`);
  console.log(`Each bucket covers a range of ${(audioCtx.sampleRate / 2) / bufferLength}`);

  setInterval(() => {
    analyser.getByteFrequencyData(dataArray);
    console.log(dataArray);
    lines = [];
    drawLines(dataArray);
    // console.log(lines);
  }, 10);
}

