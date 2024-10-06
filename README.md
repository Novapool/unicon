# Unicon: Universal File Converter

Unicon is a versatile file conversion tool that combines a powerful Python backend with a user-friendly Electron frontend. It provides a set of functions for converting various media files (audio, video, and images) using the ffmpeg-python library, allowing for easy conversion between different formats and including batch processing capabilities.

## Features

- Convert audio files between different formats (e.g., mp3, wav, ogg, flac, m4a)
- Convert video files between different formats (e.g., mp4, avi, mov, mkv, webm)
- Convert image files between different formats (e.g., jpg, png, gif, bmp, webp)
- Batch processing for folders containing multiple files
- Real-time progress tracking for individual and batch conversions
- Asynchronous processing for improved performance
- Generate waveform images from audio files
- Extract first frame from video files as an image
- User-friendly Electron-based desktop application

## Supported File Types

- Image: jpg, png, gif, bmp, webp
- Audio: mp3, wav, ogg, flac, m4a
- Video: mp4, avi, mkv, mov, webm

## Requirements

- Node.js 14+
- Python 3.6+
- ffmpeg-python
- FFmpeg (must be installed and accessible in your system's PATH)
- Pillow (PIL)

## Installation

1. Clone this repository:
   git clone https://github.com/yourusername/unicon.git
   cd unicon

2. Install the required Node.js packages:
   npm install

3. Install the required Python packages:
   pip install ffmpeg-python Pillow

4. Ensure FFmpeg is installed on your system and accessible via the command line.

## Usage

### Running the Desktop Application

To start the Electron application:

npm start

### Using the Python Backend Directly

If you want to use the Python backend directly:

import asyncio
from conversion_functions.media_conversion import convert_file, batch_convert

# Convert a single file
asyncio.run(convert_file("/path/to/input.mp3", "/path/to/output.ogg", "ogg"))

# Batch convert files in a folder
asyncio.run(batch_convert("/path/to/input/folder", "/path/to/output/folder", "png"))

## Development

- Backend: The Python backend code is located in the `conversion_functions` directory.
- Frontend: The Electron frontend code is in the `src` directory.

To run the application in development mode:

npm run dev

## Building

To build the desktop application:

npm run package

## Testing

Run the test suite:

npm test

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- This project uses the [ffmpeg-python](https://github.com/kkroening/ffmpeg-python) library for media conversions.
- [Electron React Boilerplate](https://electron-react-boilerplate.js.org/) was used as a starting point for the desktop application.
- [Pillow (PIL)](https://python-pillow.org/) is used for some image processing tasks.