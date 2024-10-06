import os
import magic
import ffmpeg
import logging
import asyncio
import time
import sys
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

async def get_media_duration(input_path):
    try:
        file_type = get_file_type(input_path)
        if file_type == 'image':
            return 1  # Return 1 for images as they don't have a duration
        
        probe = await asyncio.to_thread(ffmpeg.probe, input_path)
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

async def convert_file(input_path, output_path, output_format, progress_callback=None):
    try:
        total_duration = await get_media_duration(input_path)
        
        file_type = get_file_type(input_path)
        
        if file_type == 'image' and output_format == 'png':
            # For image to PNG conversion, use PIL instead of FFmpeg
            from PIL import Image
            with Image.open(input_path) as img:
                img.save(output_path, 'PNG')
            logger.info(f"Converted {input_path} to {output_path}")
            if progress_callback:
                await progress_callback(1.0)
            return True
        
        cmd = [
            'ffmpeg',
            '-i', input_path,
            '-progress', 'pipe:1',
            '-nostats'
        ]
        
        if file_type == 'video' and output_format == 'png':
            # For video to PNG, extract the first frame
            cmd.extend(['-vframes', '1'])
        elif file_type == 'audio' and output_format == 'png':
            # For audio to PNG, generate a waveform image
            cmd.extend(['-filter_complex', 'showwavespic=s=640x120'])
        
        cmd.append(output_path)
        
        logger.debug(f"Running FFmpeg command: {' '.join(cmd)}")
        
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        start_time = time.time()
        last_progress = 0
        
        while True:
            line = await process.stdout.readline()
            if not line:
                break
            line = line.decode('utf-8').strip()
            logger.debug(f"FFmpeg output: {line}")
            if 'out_time_ms=' in line:
                time_ms = int(line.split('=')[1])
                progress = min((time_ms / 1000000) / total_duration, 1) if total_duration > 0 else 0
                if progress > last_progress:
                    last_progress = progress
                    if progress_callback:
                        await progress_callback(progress)
            
            if time.time() - start_time > 30:  # Timeout after 30 seconds
                process.kill()
                logger.error(f"Conversion timed out for {input_path}")
                return False
        
        await process.wait()
        
        if process.returncode != 0:
            stderr_output = await process.stderr.read()
            logger.error(f"Error converting {input_path}: FFmpeg process returned {process.returncode}. stderr: {stderr_output.decode('utf-8')}")
            return False
        
        logger.info(f"Converted {input_path} to {output_path}")
        return True
    except Exception as e:
        logger.exception(f"Unexpected error converting {input_path}: {str(e)}")
        return False

async def batch_convert(input_folder, output_folder, output_format, progress_callback=None):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    success_count = 0
    total_count = 0
    file_types = defaultdict(int)
    
    try:
        files = [f for f in os.listdir(input_folder) if os.path.isfile(os.path.join(input_folder, f))]
        total_files = len(files)
        
        async def convert_single_file(i, filename):
            input_path = os.path.join(input_folder, filename)
            file_type = get_file_type(input_path)
            file_types[file_type] += 1
            
            output_filename = os.path.splitext(filename)[0] + '.' + output_format
            output_path = os.path.join(output_folder, output_filename)
            
            async def file_progress_callback(file_progress):
                if progress_callback:
                    overall_progress = (i + file_progress) / total_files
                    await progress_callback(overall_progress)
            
            return await convert_file(input_path, output_path, output_format, file_progress_callback)
        
        tasks = [convert_single_file(i, filename) for i, filename in enumerate(files)]
        results = await asyncio.gather(*tasks)
        
        success_count = sum(1 for result in results if result)
        total_count = len(results)
        
        logger.info(f"Batch conversion complete. Successfully converted {success_count} out of {total_count} files.")
        logger.info(f"File types in folder: {dict(file_types)}")
    except Exception as e:
        logger.error(f"Error during batch conversion: {str(e)}")
    
    return success_count, total_count

async def main(input_path, output_format):
    try:
        file_type = get_file_type(input_path)
        if file_type == 'unknown':
            print(f"Error: Unable to determine file type for {input_path}")
            return False

        if output_format not in get_possible_formats(file_type):
            print(f"Error: Invalid output format {output_format} for {file_type} file")
            return False

        output_filename = f"{os.path.splitext(os.path.basename(input_path))[0]}.{output_format}"
        output_path = os.path.join(os.path.dirname(input_path), output_filename)

        async def progress_callback(progress):
            print(f"Conversion progress: {progress:.2%}")

        result = await convert_file(input_path, output_path, output_format, progress_callback)
        
        if result:
            print(f"Successfully converted {input_path} to {output_path}")
            return True
        else:
            print(f"Failed to convert {input_path} to {output_format}")
            return False

    except Exception as e:
        logger.exception(f"Error during conversion: {str(e)}")
        print(f"Error during conversion: {str(e)}")
        return False

# Update the if __name__ == "__main__" block at the end of the file
if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python media_conversion.py <input_file> <output_format>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_format = sys.argv[2]

    if not os.path.exists(input_file):
        print(f"Error: Input file {input_file} does not exist")
        sys.exit(1)

    success = asyncio.run(main(input_file, output_format))
    sys.exit(0 if success else 1)