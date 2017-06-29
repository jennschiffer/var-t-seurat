(function() {

  var uploadInput = document.getElementById('upload-image');
  var frameContainer = document.getElementById('frame-container');
  var canvas = document.getElementById('frame-canvas');
  var imgCanvas = document.getElementById('image-canvas');
  var ctx = canvas.getContext('2d');
  var imgCtx = imgCanvas.getContext('2d');

  var buttonClear = document.getElementById('clear');
  var buttonSave = document.getElementById('save');

  var pixelSize = 5;
  var framePixelCount = 0;
  var colorIndex = 0;
  var colorPointer = 0;
  var frameSize, colorArray, img;

  imgCanvas.style.display = 'none';
  
  
  /** HELPER FUNCTIONS **/

  var calculateFrameSize = function(dimension) {
    // returns computer-pixel width of frame
    var size = pixelSize * Math.ceil((dimension * .1) / pixelSize);
    return size;
  };

  var generateColorArray = function() {
    var colors = [];

    // for now, grab random pixels for framePixelCount # of colors
    for (var i = 0; i < (img.width - 1) * (img.height - 1); i++) {
      var randX = (Math.floor(Math.random() * (img.width)));
      var randY = (Math.floor(Math.random() * (img.height)));
      var d = imgCtx.getImageData(randX, randY, 1, 1).data;
      var rgb = 'rgb(' + d[0] + ',' + d[1] + ',' + d[2] + ')';

      if ( colors.indexOf(rgb) === -1 && d) {
        colors.push(rgb);
        colorPointer++;
      }

    }
    return colors;
  };

  var drawFrameDiagonal = function(x, y) {
    // only draw if pixel is outside of image
    if (
      x < frameSize ||
      y < frameSize ||
      x >= canvas.width - frameSize - 1 ||
      y >= canvas.height - frameSize - 1
    ) {
      ctx.fillStyle = colorArray[colorIndex];
      ctx.fillRect(x, y, pixelSize, pixelSize);
      framePixelCount++;

      if (colorIndex === colorArray.length) {
        colorIndex = 0;
      } else {
        colorIndex++;
      }
    }

    x = x + pixelSize;
    y = y - pixelSize;

    if (x >= 0 && y >= 0) {
      drawFrameDiagonal(x, y);
    }
  };

  var drawFrame = function() {
    for (var y = 0; y <= canvas.height; y = y + pixelSize) {
      drawFrameDiagonal(0, y);
    }

    for (var x = pixelSize; x <= canvas.width; x = x + pixelSize) {
      drawFrameDiagonal(x, canvas.height - pixelSize);
    }
  };

  /** EVENTS **/

  // when uploading an image, embed it onto canvas and show it
  uploadInput.onchange = function() {

    // embed image onto canvas
    var uploadedImage = uploadInput.files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
      img = new Image();
      img.onload = function() {

        // resize image to fit grid
        img.width = img.width - (img.width % pixelSize);
        img.height = img.height - (img.height % pixelSize);

        imgCanvas.width = img.width;
        imgCanvas.height = img.height;
        imgCtx.drawImage(img, 0, 0);

        // calculate frame width off of smallest dimension
        frameSize = calculateFrameSize(Math.min(img.width, img.height));

        canvas.width = img.width + 2 * frameSize;
        canvas.height = img.height + 2 * frameSize;
        ctx.drawImage(img, frameSize, frameSize);

        // generate color array and draw frame when array is ready
        
        var whenColorArrayGenerated = new Promise(function(resolve, reject) {
          var generatedColorArray = generateColorArray();
          
          if (generatedColorArray) {
            resolve(generatedColorArray);
          }
          else {
            reject('generateColorArray() call failed');
          }
        });
        
        whenColorArrayGenerated.then(function(res){
          colorArray = res;
          drawFrame();
        });

      };

      img.src = e.target.result;
    };
    reader.readAsDataURL(uploadedImage);

    // show sketch container
    frameContainer.style.display = 'block';
  }

  // clear canvas when clear button clicked
  buttonClear.onclick = function() {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    frameContainer.style.display = 'none';
  };

  // open png in new window when save button clicked
  buttonSave.onclick = function() {
    window.open(canvas.toDataURL('image/png'));
  };

}());