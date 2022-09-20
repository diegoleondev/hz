const $button = {
  susres: document.getElementById("susresBtn"),
  captureSample: document.getElementById("captureSampleBtn"),
};

const canvas = document.getElementById("canvasWiewer");
const canvasCtx = canvas.getContext("2d");

/* VARIABLES */
let audioCtx = null;
let analyserCtx = null;
let bufferLength = null;
let dataArray = null;
let idAnimation = null;

/* FUNCTIONS */
const handleStart = () => {
  audioCtx = new AudioContext();
  analyserCtx = audioCtx.createAnalyser();

  analyserCtx.fftSize = 2048;

  bufferLength = analyserCtx.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);

  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyserCtx);
  });

  $button.captureSample.disabled = false;
  $button.susres.innerHTML = "Cerrar Escucha";

  console.log("AudioCtx created");
};

const handleClose = () => {
  audioCtx.close();
  audioCtx = null;
  console.log("AudioCtx Closed");

  $button.captureSample.disabled = true;
  $button.susres.innerHTML = "Iniciar Escucha";

  if (idAnimation) {
    cancelAnimationFrame(idAnimation);
    idAnimation = null;

    $button.captureSample.innerHTML = "Iniciar Osciloscopio";
  }
};

const handleSamples = () => {
  if (!audioCtx) return console.error("AudioCtx not created");
  if (!analyserCtx) return console.error("AnalyserCtx not created");

  function draw() {
    idAnimation = requestAnimationFrame(draw);

    console.log("draw");

    analyserCtx.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = "rgb(250, 250, 250)";
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "rgb(0, 0, 0)";

    canvasCtx.beginPath();

    const sliceWidth = (canvas.width * 1.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
  }

  if (!idAnimation) {
    requestAnimationFrame(draw);

    $button.captureSample.innerHTML = "Pausar Osciloscopio";
  } else if (idAnimation) {
    cancelAnimationFrame(idAnimation);
    idAnimation = null;

    $button.captureSample.innerHTML = "Reanudar Osciloscopio";
  }
};

/* LISTENERS */
$button.susres.addEventListener("click", () => {
  if (audioCtx === null) handleStart();
  else if (audioCtx !== null) handleClose();
});

$button.captureSample.addEventListener("click", () => {
  handleSamples();
});
