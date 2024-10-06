# Media Converter

This project provides a set of Python functions for converting various media files (audio, video, and images) using the ffmpeg-python library. It allows for easy conversion between different formats and includes batch processing capabilities.

## Features

- Convert audio files between different formats (e.g., mp3, wav, ogg, flac, m4a)
- Convert video files between different formats (e.g., mp4, avi, mov, mkv, webm)
- Convert image files between different formats (e.g., jpg, png, gif, bmp, webp)
- Batch processing for folders containing multiple files
- Real-time progress tracking for individual and batch conversions
- Asynchronous processing for improved performance
- Generate waveform images from audio files
- Extract first frame from video files as an image

## Supported File Types

- Image: jpg, png, gif, bmp, webp
- Audio: mp3, wav, ogg, flac, m4a
- Video: mp4, avi, mkv, mov, webm

## Requirements

- Python 3.6+
- ffmpeg-python
- FFmpeg (must be installed and accessible in your system's PATH)
- Pillow (PIL)

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/media-converter.git
   cd media-converter
   ```

2. Install the required Python packages:
   ```
   pip install ffmpeg-python Pillow
   ```

3. Ensure FFmpeg is installed on your system and accessible via the command line.

## Usage

### Converting Files

```python
import asyncio
from media_conversion import convert_file, batch_convert

# Convert a single file
asyncio.run(convert_file("/path/to/input.mp3", "/path/to/output.ogg", "ogg"))

# Batch convert files in a folder
asyncio.run(batch_convert("/path/to/input/folder", "/path/to/output/folder", "png"))
```

### Progress Tracking

```python
import asyncio
from media_conversion import convert_file

async def progress_callback(progress):
    print(f"Conversion progress: {progress:.2%}")

asyncio.run(convert_file("/path/to/input.mp4", "/path/to/output.avi", "avi", progress_callback))
```

## Special Conversions

- Audio to Image: Generates a waveform visualization as a PNG image
- Video to Image: Extracts the first frame of the video as a PNG image

## Error Handling

The script includes error handling and logging. If an error occurs during conversion, it will be logged, and the script will continue with the next file (if processing multiple files).

## Limitations

- Direct conversions between fundamentally different media types (e.g., image to audio) are not supported
- Some advanced conversion options (e.g., video quality settings, audio bitrate) are not currently implemented

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- This project uses the [ffmpeg-python](https://github.com/kkroening/ffmpeg-python) library, which provides Python bindings for FFmpeg.
- [Pillow (PIL)](https://python-pillow.org/) is used for some image processing tasks.