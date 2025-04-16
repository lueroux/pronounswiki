// HTML structure using Bootstrap
document.body.innerHTML = `
  <div class="container mt-5">
    <h1 class="text-center">Collage Creator</h1>
    <div class="mb-3">
      <label for="deviceSize" class="form-label">Select Device Size</label>
      <select class="form-select" id="deviceSize">
        <option value="1920x1080">1920x1080 (Desktop)</option>
        <option value="1366x768">1366x768 (Desktop)</option>
        <option value="375x667">375x667 (iPhone 8)</option>
        <option value="414x896">414x896 (iPhone XR)</option>
        <option value="360x640">360x640 (Android)</option>
      </select>
    </div>
    <div class="mb-3">
      <label for="imageUpload" class="form-label">Upload Images</label>
      <input class="form-control" type="file" id="imageUpload" multiple accept="image/*">
    </div>
    <button class="btn btn-primary" id="createCollage">Create Collage</button>
    <canvas id="collageCanvas" class="mt-3 d-block mx-auto border" style="display: none;"></canvas>
    <a id="downloadLink" class="btn btn-success mt-3 d-none" download="collage.jpg">Download Collage</a>
  </div>
`;

// JavaScript functionality
const deviceSize = document.getElementById('deviceSize');
const imageUpload = document.getElementById('imageUpload');
const createCollage = document.getElementById('createCollage');
const collageCanvas = document.getElementById('collageCanvas');
const downloadLink = document.getElementById('downloadLink');

createCollage.addEventListener('click', () => {
  const size = deviceSize.value.split('x');
  const width = parseInt(size[0]);
  const height = parseInt(size[1]);

  collageCanvas.width = width;
  collageCanvas.height = height;
  collageCanvas.style.display = 'block';

  const ctx = collageCanvas.getContext('2d');
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);

  const files = Array.from(imageUpload.files);
  if (files.length === 0) {
    alert('Please upload at least one image.');
    return;
  }

  let loadedImages = 0;
  files.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const x = Math.random() * (width - img.width / 2);
        const y = Math.random() * (height - img.height / 2);
        const scale = Math.random() * 0.5 + 0.5; // Random scale between 0.5 and 1
        const imgWidth = img.width * scale;
        const imgHeight = img.height * scale;

        ctx.globalAlpha = Math.random() * 0.5 + 0.5; // Random opacity between 0.5 and 1
        ctx.drawImage(img, x, y, imgWidth, imgHeight);

        loadedImages++;
        if (loadedImages === files.length) {
          downloadLink.href = collageCanvas.toDataURL('image/jpeg');
          downloadLink.classList.remove('d-none');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
});
