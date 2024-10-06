import os
import magic
import ffmpeg
import logging
import subprocess
import time
from collections import defaultdict

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def get_file_type(file_path):
    try:
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
    except Exception as e:
        logger.error(f"Error determining file type for {file_path}: {str(e)}")
        return 'unknown'

def get_possible_formats(file_type):
    formats = {
        'video': ['mp4', 'avi', 'mkv', 'mov', 'webm'],
        'audio': ['mp3', 'wav', 'ogg', 'flac', 'm4a'],
        'image': ['jpg', 'png', 'gif', 'bmp', 'webp']
    }
    return formats.get(file_type, [])

def get_media_duration(input_path):
    try:
        probe = ffmpeg.probe(input_path)
        # Look for duration in both container and stream metadata
        duration = next(
            (
                float(format_or_stream.get('duration', 0))
                for format_or_stream in (probe.get('format', {}), *probe.get('streams', []))
                if 'duration' in format_or_stream
            ),
            None
        )
        if duration is not None:
            return duration
        logger.warning(f"Could not determine duration for {input_path}")
        return 1  # Return 1 if duration can't be determined to avoid division by zero
    except ffmpeg.Error as e:
        logger.error(f"Error probing file duration for {input_path}: {e.stderr.decode()}")
        return 1

def convert_file(input_path, output_path, progress_callback=None):
    try:
        total_duration = get_media_duration(input_path)
        
        cmd = [
            'ffmpeg',
            '-i', input_path,
            '-progress', 'pipe:1',
            '-nostats',
            output_path
        ]
        
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True
        )
        
        start_time = time.time()
        last_progress = 0
        
        while True:
            output = process.stdout.readline()
            if output == '' and process.poll() is not None:
                break
            if output:
                if 'out_time_ms=' in output:
                    time_ms = int(output.split('=')[1])
                    progress = min((time_ms / 1000000) / total_duration, 1) if total_duration > 0 else 0
                    if progress > last_progress:
                        last_progress = progress
                        if progress_callback:
                            progress_callback(progress)
            
            # Ensure we're not stuck in an infinite loop
            if time.time() - start_time > 30:  # Timeout after 30 seconds
                process.kill()
                logger.error(f"Conversion timed out for {input_path}")
                return False
        
        process.wait()  # Wait for the process to finish
        
        if process.returncode != 0:
            stderr_output = process.stderr.read()
            logger.error(f"Error converting {input_path}: FFmpeg process returned {process.returncode}. stderr: {stderr_output}")
            return False
        
        logger.info(f"Converted {input_path} to {output_path}")
        return True
    except Exception as e:
        logger.exception(f"Unexpected error converting {input_path}: {str(e)}")
        return False

def batch_convert(input_folder, output_folder, output_format, progress_callback=None):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    success_count = 0
    total_count = 0
    file_types = defaultdict(int)
    
    try:
        files = [f for f in os.listdir(input_folder) if os.path.isfile(os.path.join(input_folder, f))]
        total_files = len(files)
        
        for i, filename in enumerate(files):
            input_path = os.path.join(input_folder, filename)
            file_type = get_file_type(input_path)
            file_types[file_type] += 1
            
            if file_type != 'unknown':
                output_filename = os.path.splitext(filename)[0] + '.' + output_format
                output_path = os.path.join(output_folder, output_filename)
                
                def file_progress_callback(file_progress):
                    if progress_callback:
                        overall_progress = (i + file_progress) / total_files
                        progress_callback(overall_progress)
                
                if convert_file(input_path, output_path, file_progress_callback):
                    success_count += 1
                total_count += 1
            else:
                logger.warning(f"Skipping file {filename}: Unsupported file type")
        
        logger.info(f"Batch conversion complete. Successfully converted {success_count} out of {total_count} files.")
        logger.info(f"File types in folder: {dict(file_types)}")
    except Exception as e:
        logger.error(f"Error during batch conversion: {str(e)}")

if __name__ == "__main__":
    # Example usage
    def print_progress(progress):
        print(f"Conversion progress: {progress:.2%}")
    
    input_folder = "path/to/input/folder"
    output_folder = "path/to/output/folder"
    output_format = "mp4"
    
    batch_convert(input_folder, output_folder, output_format, print_progress)