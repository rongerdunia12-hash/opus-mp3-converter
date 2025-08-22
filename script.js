// Import necessary functions from the FFmpeg library
const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({
    log: true, // Shows process in console, good for debugging
    corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js',
});

// Select HTML elements
const uploader = document.getElementById('uploader');
const uploadBtn = document.getElementById('upload-btn');
const status = document.getElementById('status');
const fileNameDisplay = document.getElementById('file-name');

// When the upload button is clicked, trigger the file input
uploadBtn.addEventListener('click', () => {
    uploader.click();
});

// When a file is selected, start the conversion
uploader.addEventListener('change', async (event) => {
    // This allows selecting multiple files, but we'll process one by one for now.
    // In future updates, we can add a loop here to handle all selected files.
    const file = event.target.files[0]; 
    if (file) {
        fileNameDisplay.textContent = `Selected file: ${file.name}`;
        await convertToMp3(file);
    }
});

const convertToMp3 = async (inputFile) => {
    status.textContent = 'Loading FFmpeg... Please wait.';
    
    // Load FFmpeg (only takes time on the first run)
    if (!ffmpeg.isLoaded()) {
        await ffmpeg.load();
    }

    status.textContent = 'Starting conversion...';
    
    // Write the file to FFmpeg's virtual file system
    ffmpeg.FS('writeFile', inputFile.name, await fetchFile(inputFile));

    // Run the FFmpeg command (create output.mp3 from the input file)
    await ffmpeg.run('-i', inputFile.name, 'output.mp3');

    status.textContent = 'Conversion complete! Starting download...';
    
    // Read the converted file from memory
    const data = ffmpeg.FS('readFile', 'output.mp3');

    // Create a link and click it to trigger the download
    const blob = new Blob([data.buffer], { type: 'audio/mp3' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    a.href = url;
    a.download = inputFile.name.replace(/\.[^/.]+$/, "") + '.mp3'; // Replace .opus with .mp3
    a.click();
    
    // Clean up the link
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    status.textContent = 'Download finished!';
    setTimeout(() => {
        status.textContent = '';
        fileNameDisplay.textContent = '';
    }, 5000); // Clear the message after 5 seconds
};