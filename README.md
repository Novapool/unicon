# Media Converter

This project provides a set of Python functions for converting various media files (audio, video, and images) using the ffmpeg-python library. It allows for easy conversion between different formats and optional resizing for videos and images.

## Features

- Convert audio files between different formats (e.g., mp3, wav, ogg, flac)
- Convert video files between different formats (e.g., mp4, avi, mov, mkv) with optional resizing
- Convert image files between different formats (e.g., jpg, png, bmp, tiff) with optional resizing
- Batch processing for folders containing multiple files

## Requirements

- Python 3.6+
- ffmpeg-python
- FFmpeg (must be installed and accessible in your system's PATH)

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/media-converter.git
   cd media-converter
   ```

2. Install the required Python package:
   ```
   pip install ffmpeg-python
   ```

3. Ensure FFmpeg is installed on your system and accessible via the command line.

## Usage

### Converting Audio

```python
from media_conversion import convert_audio

# Convert a single audio file
convert_audio("/path/to/audio.mp3", "ogg", "/path/to/output/folder")

# Convert all audio files in a folder
convert_audio("/path/to/audio/folder", "wav", "/path/to/output/folder")
```

### Converting Video

```python
from media_conversion import convert_video

# Convert a single video file and resize to 720p
convert_video("/path/to/video.mp4", "avi", "/path/to/output/folder", resolution=(1280, 720))

# Convert all video files in a folder
convert_video("/path/to/video/folder", "mp4", "/path/to/output/folder")
```

### Converting Images

```python
from media_conversion import convert_image

# Convert a single image file and resize to 800x600
convert_image("/path/to/image.jpg", "png", "/path/to/output/folder", resize=(800, 600))

# Convert all image files in a folder
convert_image("/path/to/image/folder", "webp", "/path/to/output/folder")
```

## Error Handling

The script includes basic error handling. If an error occurs during conversion, it will be printed to the console, and the script will continue with the next file (if processing multiple files).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- This project uses the [ffmpeg-python](https://github.com/kkroening/ffmpeg-python) library, which provides Python bindings for FFmpeg.
