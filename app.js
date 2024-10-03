const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const capturedImagesContainer = document.getElementById('captured-images');
const constraints = { video: true };

navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => {
        video.srcObject = stream;
    })
    .catch((error) => {
        console.error('Error accessing the camera: ', error);
    });

document.getElementById('start-recording').onclick = () => {
    console.log('Recording started');
};

document.getElementById('filter1').onclick = () => applyFilter('filter1');
document.getElementById('filter2').onclick = () => applyFilter('filter2');
document.getElementById('filter3').onclick = () => applyFilter('filter3');
document.getElementById('filter4').onclick = () => applyFilter('filter4');

document.getElementById('capture').onclick = () => {
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataUrl = canvas.toDataURL('image/png');
    const img = document.createElement('img');
    img.src = imageDataUrl;
    capturedImagesContainer.appendChild(img);
    createUploadButton(imageDataUrl);
};

function applyFilter(filter) {
    // Apply filter logic here (this is just an example)
    console.log(`Applying ${filter}`);
}

function createUploadButton(imageDataUrl) {
    const uploadButton = document.createElement('button');
    uploadButton.innerText = 'Upload';
    uploadButton.onclick = () => uploadToS3(imageDataUrl);
    capturedImagesContainer.appendChild(uploadButton);
}

function uploadToS3(imageDataUrl) {
    AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: 'ap-south-1'
    });

    const s3 = new AWS.S3();
    const bucketName = 'himanshu2004';

    const base64Data = Buffer.from(imageDataUrl.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    const params = {
        Bucket: bucketName,
        Key: `photos/${Date.now()}.png`,
        Body: base64Data,
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
        }
    });
}
