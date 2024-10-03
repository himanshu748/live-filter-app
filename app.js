const video = document.getElementById('video');
const photoContainer = document.getElementById('photo-container');

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => {
        console.error("Error accessing media devices.", err);
    });

// Filter buttons
const filters = {
    none: 'none',
    grayscale: 'grayscale(100%)',
    sepia: 'sepia(100%)',
    invert: 'invert(100%)'
};

let currentFilter = filters.none;

document.getElementById('filter-none').onclick = () => applyFilter(filters.none);
document.getElementById('filter-grayscale').onclick = () => applyFilter(filters.grayscale);
document.getElementById('filter-sepia').onclick = () => applyFilter(filters.sepia);
document.getElementById('filter-invert').onclick = () => applyFilter(filters.invert);

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
    img.width = 300; // Set image width for display
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
    // Convert base64 string to binary
    const response = await fetch(imageData);
    const blob = await response.blob();

    const params = {
        Bucket: 'himanshu2004', // Your bucket name
        Key: `captured-image-${Date.now()}.png`, // Unique image name
        Body: blob,
        ContentType: 'image/png',
        ACL: 'public-read', // Make the image publicly readable
    };

    // Configure AWS SDK with environment variables
    AWS.config.update({
        region: 'ap-south-1', // Your AWS region
        accessKeyId: 'YOUR_ACCESS_KEY_ID', // Replace with your actual access key
        secretAccessKey: 'YOUR_SECRET_ACCESS_KEY' // Replace with your actual secret key
    });

    const s3 = new AWS.S3();

    try {
        const result = await s3.upload(params).promise();
        console.log('Upload Success', result);
        alert('Upload Successful! Image URL: ' + result.Location);
    } catch (error) {
        console.error('Upload Error', error);
        alert('Upload failed!');
    }
}
