/* eslint-disable no-use-before-define */
/* eslint-disable no-undef */

let facemesh;
const container = document.querySelector('.preview');
const videoElement = document.querySelector('.input_video');
const guideCanvas = document.querySelector('canvas.guides');
const flipButton = document.querySelector('#flipper');
const otherIframe = document.querySelector('iframe#other')
const selfIframe = document.querySelector('iframe#self')

// start camera using mediapipe camera utils
const startCamera = () => {
  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await facemesh.send({ image: videoElement });
    },
    width: 640,
    height: 480,
  });
  camera.start().then(asd => {
    if (PRODUCTION) container.style.display = 'none'
  });
};

// draw connectors and landmarks on output canvas
const drawResults = (points) => {
  if (!guideCanvas || !videoElement || !points) return;
  guideCanvas.width = videoElement.videoWidth;
  guideCanvas.height = videoElement.videoHeight;
  const canvasCtx = guideCanvas.getContext('2d');
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, guideCanvas.width, guideCanvas.height);
  // Use `Mediapipe` drawing functions
  drawConnectors(canvasCtx, points, FACEMESH_TESSELATION, {
    color: '#C0C0C070',
    lineWidth: 1,
  });
  if (points && points.length === 478) {
    // draw pupils
    drawLandmarks(canvasCtx, [points[468], points[468 + 5]], {
      color: '#ffe603',
      lineWidth: 2,
    });
  }
};

const onResults = (results) => {
  drawResults(results.multiFaceLandmarks[0]);
  sendAnimation(results.multiFaceLandmarks[0]);
};

const sendAnimation = (points) => {
  if (!points) return;

  console.debug(`Publish animation with totalPoints=${points.length} sample=${JSON.stringify(points[0])}`)

  if (otherIframe) {
    const { contentWindow: otherContentWindow } = otherIframe
    otherContentWindow.postMessage({ points, timestamp: new Date().getTime() })
  }

  if (selfIframe) {
    const { contentWindow: selfContentWindow } = selfIframe
    selfContentWindow.postMessage({ points, timestamp: new Date().getTime() })
  }
};

(async function main() {
  console.log(`Is Production: ${PRODUCTION}`);

  flipButton.addEventListener('click', () => {
    console.log('clicked!')
  })

  // create media pipe facemesh instance
  facemesh = new FaceMesh({
    locateFile: (file) => `libs/@mediapipe/face_mesh/${file}`,
  });

  // set facemesh config
  facemesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  // pass facemesh callback function
  facemesh.onResults(onResults);

  startCamera()
}());
