const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const capturedImagesContainer = document.getElementById('captured-images');
const startRecordingBtn = document.getElementById('start-recording');
const constraints = { video: true };

let isRecording = false;

navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => {
        video.srcObject = stream;
    })
    .catch((error) => {
        console.error('Error accessing the camera: ', error);
    });

startRecordingBtn.onclick = () => {
    isRecording = !isRecording;
    startRecordingBtn.textContent = isRecording ? 'Stop Recording' : 'Start Recording';
    startRecordingBtn.classList.toggle('recording');
};

const filters = ['filter1', 'filter2', 'filter3', 'filter4'];
filters.forEach(filter => {
    document.getElementById(filter).onclick = () => applyFilter(filter);
});

document.getElementById('capture').onclick = () => {
    if (!isRecording) {
        alert('Please start recording first!');
        return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataUrl = canvas.toDataURL('image/png');
    const imgContainer = document.createElement('div');
    imgContainer.className = 'image-container';
    const img = document.createElement('img');
    img.src = imageDataUrl;
    imgContainer.appendChild(img);
    createUploadButton(imgContainer, imageDataUrl);
    capturedImagesContainer.appendChild(imgContainer);
};

function applyFilter(filter) {
    // Apply filter logic here (this is just an example)
    console.log(`Applying ${filter}`);
    video.style.filter = getComputedStyle(document.getElementById(filter)).getPropertyValue('filter');
}

function createUploadButton(container, imageDataUrl) {
    const uploadButton = document.createElement('button');
    uploadButton.className = 'btn';
    uploadButton.innerText = 'Upload';
    uploadButton.onclick = () => uploadToS3(imageDataUrl);
    container.appendChild(uploadButton);
}

function uploadToS3(imageDataUrl) {
    // Note: This is not secure and should not be used in a production environment
    AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: 'ap-south-1'
    });

    const s3 = new AWS.S3();
    const bucketName = 'himanshu2004';

    const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, "");
    const params = {
        Bucket: bucketName,
        Key: `photos/${Date.now()}.png`,
        Body: Buffer.from(base64Data, 'base64'),
        ContentEncoding: 'base64',
        ContentType: 'image/png'
    };

    s3.upload(params, (err, data) => {
        if (err) {
            console.error('Error uploading photo:', err);
            alert('Error uploading photo.');
        } else {
            console.log('Successfully uploaded photo to:', data.Location);
            alert('Photo uploaded successfully!');
            // Create download link
            createDownloadLink(data.Location);
        }
    });
}

function createDownloadLink(url) {
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.textContent = 'Download';
    downloadLink.className = 'btn';
    downloadLink.target = '_blank';
    capturedImagesContainer.appendChild(downloadLink);
}
