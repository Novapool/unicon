document.getElementById('selectFile').addEventListener('click', () => {
    window.electronAPI.selectFile();
});

document.getElementById('selectFolder').addEventListener('click', () => {
    window.electronAPI.selectFolder();
});

document.getElementById('selectOutput').addEventListener('click', () => {
    window.electronAPI.selectOutput();
});

document.getElementById('conversionType').addEventListener('change', (event) => {
    window.electronAPI.setConversionType(event.target.value);
});

document.getElementById('outputFormat').addEventListener('change', (event) => {
    window.electronAPI.setOutputFormat(event.target.value);
});

document.getElementById('convert').addEventListener('click', () => {
    window.electronAPI.convert();
});

window.electronAPI.onUpdateStatus((event, value) => {
    document.getElementById('status').innerHTML = value;
});