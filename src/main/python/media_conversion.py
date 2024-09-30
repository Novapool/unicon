import sys
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

def main(input_path, output_folder, conversion_type, output_format, resolution=None, resize=None):
    if conversion_type == 'audio':
        convert_audio(input_path, output_format, output_folder)
    elif conversion_type == 'video':
        convert_video(input_path, output_format, output_folder, resolution)
    elif conversion_type == 'image':
        convert_image(input_path, output_format, output_folder, resize)
    else:
        print(f"Unsupported conversion type: {conversion_type}")

if __name__ == "__main__":
    if len(sys.argv) < 5:
        print("Usage: python media_conversions.py <input_path> <output_folder> <conversion_type> <output_format> [resolution_width resolution_height]")
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_folder = sys.argv[2]
    conversion_type = sys.argv[3]
    output_format = sys.argv[4]
    
    resolution = None
    if len(sys.argv) == 7:
        resolution = (int(sys.argv[5]), int(sys.argv[6]))
    
    main(input_path, output_folder, conversion_type, output_format, resolution)