const video = document.getElementById('video');
const photoContainer = document.getElementById('photo-container');

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => {
        console.error("Error accessing media devices.", err);
    });

const filters = {
    none: 'none',
    grayscale: 'grayscale(100%)',
    sepia: 'sepia(100%)',
    invert: 'invert(100%)',
    contrast: 'contrast(200%)',
    brightness: 'brightness(150%)'
};

let currentFilter = filters.none;

document.getElementById('filter-none').onclick = () => applyFilter(filters.none);
document.getElementById('filter-grayscale').onclick = () => applyFilter(filters.grayscale);
document.getElementById('filter-sepia').onclick = () => applyFilter(filters.sepia);
document.getElementById('filter-invert').onclick = () => applyFilter(filters.invert);
document.getElementById('filter-contrast').onclick = () => applyFilter(filters.contrast);
document.getElementById('filter-brightness').onclick = () => applyFilter(filters.brightness);

function applyFilter(filter) {
    currentFilter = filter;
    video.style.filter = currentFilter;
}

document.getElementById('capture').onclick = () => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.filter = currentFilter;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.src = canvas.toDataURL('image/png');
    img.width = 300;
    img.alt = 'Captured Image';

    const uploadButton = document.createElement('button');
    uploadButton.textContent = 'Upload to S3';
    uploadButton.onclick = () => uploadToS3(canvas.toDataURL('image/png'));

    const photoDiv = document.createElement('div');
    photoDiv.appendChild(img);
    photoDiv.appendChild(uploadButton);
    photoContainer.appendChild(photoDiv);
};

async function uploadToS3(imageData) {
    const response = await fetch(imageData);
    const blob = await response.blob();

    const params = {
        Bucket: 'himanshu2004',
        Key: `captured-image-${Date.now()}.png`,
        Body: blob,
        ContentType: 'image/png',
        ACL: 'public-read',
    };

    AWS.config.update({
        region: 'ap-south-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });

    const s3 = new AWS.S3();

    try {
        const result = await s3.upload(params).promise();
        console.log('Upload Success', result);
        alert('Upload Successful! Image URL: ' + result.Location);

        const downloadLink = document.createElement('a');
        downloadLink.href = result.Location;
        downloadLink.textContent = 'Download';
        downloadLink.className = 'btn';
        downloadLink.target = '_blank';
        photoContainer.appendChild(downloadLink);
    } catch (error) {
        console.error('Upload Error', error);
        alert('Upload failed!');
    }
}
