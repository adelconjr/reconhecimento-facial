let image = null;

const distanceParam = 0.6;

const overlay = document.querySelector('.overlay');
const equal = document.querySelector('.equal');
const different = document.querySelector('.different');

const constraints = {
    video: {
        width: {
            min: 500,
            ideal: 500,
            max: 500,
        },
        height: {
            min: 600,
            ideal: 600,
            max: 600,
        },
    },
}

async function loadModels() {
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/js/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/js/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/js/models');

    console.log('sim');

    toggleOverlay(false);
}

async function startsCamera() {
    const videoStream = await navigator.mediaDevices.getUserMedia(constraints)

    const video = document.getElementById('camera');
    video.srcObject = videoStream;
}


function toggleOverlay(s) {
    s ? overlay.classList.add('show') : overlay.classList.remove('show');                
}


function showBtnReset() {
    const btnTakePic = document.getElementById('btnTakePic');
    const btnReset = document.getElementById('btnRefazer');

    btnTakePic.classList.remove('show');
    btnReset.classList.add('show');
}


async function takePic() {
    const video = document.getElementById('camera');
    video.pause();

    const canvas = document.createElement('canvas');
    const sizes = await video.getBoundingClientRect();

    if(sizes) {
        canvas.width = sizes.width;
        canvas.height = sizes.height;

        canvas.getContext('2d').drawImage(video, 0, 0);
        const img = canvas.toDataURL('image/png');

        document.getElementById('thumb').src = img;

        if(img) {

            image = img;
    
            toggleOverlay(true);
    
            const distance = await calculateResemblance();
    
            toggleOverlay(false);
    
            distance > distanceParam ? 
                different.classList.add('show') : equal.classList.add('show');    


            showBtnReset();
        }
    }
}

async function calculateResemblance() {
    const mainImgSrc = "/img/kingo.jpg";
    //const srcTeste2 = "/img/teste2.jpg";
    const mainImgData = await faceapi.fetchImage(mainImgSrc);
    const mainImgData2 = await faceapi.fetchImage(image);

    const fullFaceDescriptor = await faceapi.detectSingleFace(mainImgData).withFaceLandmarks().withFaceDescriptor();
    const fullFaceDescriptor2 = await faceapi.detectSingleFace(mainImgData2).withFaceLandmarks().withFaceDescriptor();

    const distance = faceapi.utils.round(await faceapi.euclideanDistance(fullFaceDescriptor.descriptor, fullFaceDescriptor2.descriptor));

    console.log('Distance: ', distance);

    return distance; 
}

function addEventsListeners() {
    console.log('Document loaded');

    const btnTakePic = document.getElementById('btnTakePic');
    btnTakePic.addEventListener('click', takePic);


    const btnReset = document.getElementById('btnRefazer');
    btnReset.addEventListener('click', function() {
        location.reload();
    });


    /* const btnReset = document.getElementById('btnReset');
    btnReset.addEventListener('click', function() {
        images.photo1 = null;
        images.photo2 = null;

        different.classList.remove('show');
        equal.classList.remove('show');

        hideThumb('img1');
        hideThumb('img2');
    }); */

    toggleOverlay(true);

    loadModels();

    startsCamera();
}


window.addEventListener('load', addEventsListeners);