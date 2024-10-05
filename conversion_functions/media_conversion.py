import os
import magic
import ffmpeg
from collections import defaultdict

def get_file_type(file_path):
    mime = magic.Magic(mime=True)
    file_mime = mime.from_file(file_path)
    
    if file_mime.startswith('video/'):
        return 'video'
    elif file_mime.startswith('audio/'):
        return 'audio'
    elif file_mime.startswith('image/'):
        return 'image'
    else:
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

if __name__ == "__main__":
    # You can add any initialization code here if needed
    pass