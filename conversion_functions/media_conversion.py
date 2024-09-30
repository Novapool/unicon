import os
import ffmpeg

def convert_audio(input_path, output_format, output_folder):
    """
    Convert audio files to the specified format.
    """
    if os.path.isfile(input_path):
        _convert_single_audio(input_path, output_format, output_folder)
    elif os.path.isdir(input_path):
        for file in os.listdir(input_path):
            if file.lower().endswith(('.mp3', '.wav', '.ogg', '.flac')):
                _convert_single_audio(os.path.join(input_path, file), output_format, output_folder)
    else:
        print(f"Invalid input path: {input_path}")

def _convert_single_audio(input_file, output_format, output_folder):
    try:
        output_file = os.path.join(output_folder, os.path.splitext(os.path.basename(input_file))[0] + '.' + output_format)
        stream = ffmpeg.input(input_file)
        stream = ffmpeg.output(stream, output_file, acodec=output_format)
        ffmpeg.run(stream, overwrite_output=True)
        print(f"Converted {input_file} to {output_file}")
    except ffmpeg.Error as e:
        print(f"Error converting {input_file}: {e.stderr.decode()}")

def convert_video(input_path, output_format, output_folder, resolution=None):
    """
    Convert video files to the specified format and optionally resize.
    """
    if os.path.isfile(input_path):
        _convert_single_video(input_path, output_format, output_folder, resolution)
    elif os.path.isdir(input_path):
        for file in os.listdir(input_path):
            if file.lower().endswith(('.mp4', '.avi', '.mov', '.mkv')):
                _convert_single_video(os.path.join(input_path, file), output_format, output_folder, resolution)
    else:
        print(f"Invalid input path: {input_path}")

def _convert_single_video(input_file, output_format, output_folder, resolution=None):
    try:
        output_file = os.path.join(output_folder, os.path.splitext(os.path.basename(input_file))[0] + '.' + output_format)
        stream = ffmpeg.input(input_file)
        if resolution:
            stream = ffmpeg.filter(stream, 'scale', width=resolution[0], height=resolution[1])
        stream = ffmpeg.output(stream, output_file, vcodec=output_format)
        ffmpeg.run(stream, overwrite_output=True)
        print(f"Converted {input_file} to {output_file}")
    except ffmpeg.Error as e:
        print(f"Error converting {input_file}: {e.stderr.decode()}")

def convert_image(input_path, output_format, output_folder, resize=None):
    """
    Convert image files to the specified format and optionally resize.
    """
    if os.path.isfile(input_path):
        _convert_single_image(input_path, output_format, output_folder, resize)
    elif os.path.isdir(input_path):
        for file in os.listdir(input_path):
            if file.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp', '.tiff')):
                _convert_single_image(os.path.join(input_path, file), output_format, output_folder, resize)
    else:
        print(f"Invalid input path: {input_path}")

def _convert_single_image(input_file, output_format, output_folder, resize=None):
    try:
        output_file = os.path.join(output_folder, os.path.splitext(os.path.basename(input_file))[0] + '.' + output_format)
        stream = ffmpeg.input(input_file)
        if resize:
            stream = ffmpeg.filter(stream, 'scale', width=resize[0], height=resize[1])
        stream = ffmpeg.output(stream, output_file, format=output_format)
        ffmpeg.run(stream, overwrite_output=True)
        print(f"Converted {input_file} to {output_file}")
    except ffmpeg.Error as e:
        print(f"Error converting {input_file}: {e.stderr.decode()}")

# Example usage
if __name__ == "__main__":
    # Convert audio files in a folder from mp3 to ogg
    convert_audio("/path/to/audio/folder", "ogg", "/path/to/output/folder")

    # Convert a single video file from mp4 to avi and resize to 720p
    convert_video("/path/to/video.mp4", "avi", "/path/to/output/folder", resolution=(1280, 720))

    # Convert all images in a folder from jpg to png and resize to 800x600
    convert_image("/path/to/image/folder", "png", "/path/to/output/folder", resize=(800, 600))