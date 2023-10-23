const dropArea = document.getElementById('dropArea');
const inputImage = document.getElementById('inputImage');
const canvas = document.getElementById('canvas');
const outputImage = document.getElementById('outputImage');

dropArea.addEventListener('dragover', preventDefault);
dropArea.addEventListener('drop', handleDrop);
dropArea.addEventListener('click', () => inputImage.click());
inputImage.addEventListener('change', handleFileSelect);

function preventDefault(event) {
  event.preventDefault();
}

function handleDrop(event) {
  event.preventDefault();
  const inputImageFile = event.dataTransfer.files[0];
  processImage(inputImageFile);
}

function handleFileSelect(event) {
  const inputImageFile = event.target.files[0];
  processImage(inputImageFile);
}

function processImage(inputImageFile) {
  if (inputImageFile && inputImageFile.type === 'image/webp') {
    convertToPNG(inputImageFile);
  } else {
    alert('WebP画像を選択してください。');
  }
}

function convertToPNG(inputImageFile) {
  const ctx = canvas.getContext('2d');
  
  const img = new Image();
  img.src = URL.createObjectURL(inputImageFile);
  
  img.onload = function() {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    const pngURL = canvas.toDataURL('image/png');
    outputImage.src = pngURL;
    outputImage.style.display = 'block';
  };
}
