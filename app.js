// Configure AWS SDK
AWS.config.update({
    region: 'us-east-1', // Update to your region
    credentials: new AWS.Credentials({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    })
});

const s3 = new AWS.S3();

const video = document.getElementById('video');
const photoContainer = document.getElementById('photo-container');

const constraints = {
    video: true
};

// Start video streaming
navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => {
        video.srcObject = stream;
    })
    .catch((error) => {
        console.error('Error accessing media devices.', error);
    });

// Filters
const filters = {
    none: 'none',
    grayscale: 'grayscale(100%)',
    sepia: 'sepia(100%)',
    invert: 'invert(100%)'
};

document.getElementById('filter-none').onclick = () => applyFilter('none');
document.getElementById('filter-grayscale').onclick = () => applyFilter('grayscale');
document.getElementById('filter-sepia').onclick = () => applyFilter('sepia');
document.getElementById('filter-invert').onclick = () => applyFilter('invert');

function applyFilter(filter) {
    video.style.filter = filters[filter];
}

// Capture image
document.getElementById('capture').onclick = () => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    const imageDataUrl = canvas.toDataURL('image/png');
    const img = document.createElement('img');
    img.src = imageDataUrl;
    photoContainer.appendChild(img);

    const uploadButton = document.createElement('button');
    uploadButton.innerText = 'Upload to S3';
    uploadButton.onclick = () => uploadImage(imageDataUrl);
    photoContainer.appendChild(uploadButton);
};

// Upload to S3
function uploadImage(imageDataUrl) {
    const blob = dataURLtoBlob(imageDataUrl);
    const params = {
        Bucket: 'himanshu2004', // Your S3 bucket name
        Key: `images/${Date.now()}.png`, // Unique file name
        Body: blob,
        ContentType: 'image/png',
        ACL: 'public-read' // Set permissions
    };

    s3.upload(params, (err, data) => {
        if (err) {
            console.error('Error uploading data: ', err);
            alert('Upload failed, please try again.');
        } else {
            console.log('Upload succeeded:', data);
            alert('Image uploaded successfully! You can see it at: ' + data.Location);
        }
    });
}

// Convert data URL to Blob
function dataURLtoBlob(dataURL) {
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}
