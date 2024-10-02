import os
import subprocess
import json
from collections import defaultdict
import ffmpeg

def get_file_type(file_path):
    try:
        result = subprocess.run(['ffprobe', '-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', file_path], 
                                capture_output=True, text=True, check=True)
        info = json.loads(result.stdout)
        
        if 'streams' in info:
            for stream in info['streams']:
                if stream['codec_type'] == 'video':
                    return 'video'
                elif stream['codec_type'] == 'audio':
                    return 'audio'
            if info['format']['format_name'] == 'image2':
                return 'image'
        
        return 'unknown'
    except subprocess.CalledProcessError:
        return 'unknown'

def get_possible_formats(file_type):
    formats = {
        'video': ['mp4', 'avi', 'mkv', 'mov', 'webm'],
        'audio': ['mp3', 'wav', 'ogg', 'flac', 'm4a'],
        'image': ['jpg', 'png', 'gif', 'bmp', 'webp']
    }
    return formats.get(file_type, [])

def convert_file(input_path, output_path):
    try:
        (
            ffmpeg
            .input(input_path)
            .output(output_path)
            .overwrite_output()
            .run(capture_stdout=True, capture_stderr=True)
        )
        print(f"Converted {input_path} to {output_path}")
        return True
    except ffmpeg.Error as e:
        print(f"Error converting {input_path}: {e.stderr.decode()}")
        return False

def batch_convert(input_folder, output_folder, output_format):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    success_count = 0
    total_count = 0
    file_types = defaultdict(int)
    
    for filename in os.listdir(input_folder):
        input_path = os.path.join(input_folder, filename)
        if os.path.isfile(input_path):
            file_type = get_file_type(input_path)
            file_types[file_type] += 1
            
            if file_type != 'unknown' and output_format in get_possible_formats(file_type):
                output_filename = os.path.splitext(filename)[0] + '.' + output_format
                output_path = os.path.join(output_folder, output_filename)
                
                if convert_file(input_path, output_path):
                    success_count += 1
                total_count += 1
    
    print(f"Batch conversion complete. Successfully converted {success_count} out of {total_count} files.")
    print("File types in folder:", dict(file_types))

# Test functions
def test_file_type_detection():
    test_files = {
        'test_image.jpg': 'image',
        'test_video.mp4': 'video',
        'test_audio.mp3': 'audio'
    }
    for file, expected_type in test_files.items():
        detected_type = get_file_type(file)
        print(f"File: {file}, Detected Type: {detected_type}, Expected Type: {expected_type}")
        print(f"Possible formats: {get_possible_formats(detected_type)}")

def test_batch_conversion():
    input_folder = 'test_batch_input'
    output_folder = 'test_batch_output'
    output_format = 'mp4'  # You can change this to any desired output format
    batch_convert(input_folder, output_folder, output_format)
    print("Batch conversion test completed")

if __name__ == "__main__":
    test_file_type_detection()
    test_batch_conversion()