document.addEventListener('DOMContentLoaded', function () {
    var canvas = document.getElementById('signature-pad');
    var ctx = canvas.getContext('2d');
    var drawing = false;
    var strokeStyle = 'pen';
    var signatureData = null;

    function resizeCanvas() {
        if (signatureData) {
            var img = new Image();
            img.src = signatureData;
            img.onload = function () {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                setStrokeStyle();
            };
        } else {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            setStrokeStyle();
        }
    }

    function setStrokeStyle() {
        if (strokeStyle === 'pen') {
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
        } else if (strokeStyle === 'brush') {
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
        }
    }

    function startDrawing(e) {
        drawing = true;
        ctx.beginPath();
        ctx.moveTo(e.offsetX || e.touches[0].clientX - canvas.offsetLeft, e.offsetY || e.touches[0].clientY - canvas.offsetTop);
    }

    function draw(e) {
        if (drawing) {
            ctx.lineTo(e.offsetX || e.touches[0].clientX - canvas.offsetLeft, e.offsetY || e.touches[0].clientY - canvas.offsetTop);
            ctx.stroke();
        }
    }

    function stopDrawing() {
        drawing = false;
        signatureData = canvas.toDataURL();
    }

    function exportCanvas(format) {
        var exportCanvas = document.createElement('canvas');
        exportCanvas.width = canvas.width;
        exportCanvas.height = canvas.height;
        var exportCtx = exportCanvas.getContext('2d');

        // Fill the background with white
        exportCtx.fillStyle = '#fff';
        exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        // Draw the signature
        exportCtx.drawImage(canvas, 0, 0);

        // Export the canvas
        var dataURL = exportCanvas.toDataURL(`image/${format}`);
        var link = document.createElement('a');
        link.href = dataURL;
        link.download = `signature.${format}`;
        link.click();
    }

    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);

    document.getElementById('clear').addEventListener('click', function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        signatureData = null;
    });

    document.getElementById('stroke-style').addEventListener('change', function (e) {
        strokeStyle = e.target.value;
        setStrokeStyle();
    });

    document.getElementById('export-png').addEventListener('click', function () {
        exportCanvas('png');
    });

    document.getElementById('export-jpeg').addEventListener('click', function () {
        exportCanvas('jpeg');
    });

    // Initial canvas setup
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
});