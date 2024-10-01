import os
import ffmpeg

def convert_image(input_path, output_path, output_format):
    try:
        (
            ffmpeg
            .input(input_path)
            .output(output_path, format=output_format)
            .overwrite_output()
            .run(capture_stdout=True, capture_stderr=True)
        )
        print(f"Converted {input_path} to {output_path}")
        return True
    except ffmpeg.Error as e:
        print(f"Error converting {input_path}: {e.stderr.decode()}")
        return False

def convert_video(input_path, output_path, output_format):
    try:
        (
            ffmpeg
            .input(input_path)
            .output(output_path, format=output_format)
            .overwrite_output()
            .run(capture_stdout=True, capture_stderr=True)
        )
        print(f"Converted {input_path} to {output_path}")
        return True
    except ffmpeg.Error as e:
        print(f"Error converting {input_path}: {e.stderr.decode()}")
        return False

def convert_audio(input_path, output_path, output_format):
    try:
        (
            ffmpeg
            .input(input_path)
            .output(output_path, format=output_format)
            .overwrite_output()
            .run(capture_stdout=True, capture_stderr=True)
        )
        print(f"Converted {input_path} to {output_path}")
        return True
    except ffmpeg.Error as e:
        print(f"Error converting {input_path}: {e.stderr.decode()}")
        return False

def batch_convert(input_folder, output_folder, input_format, output_format, conversion_function):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    success_count = 0
    total_count = 0
    
    for filename in os.listdir(input_folder):
        if filename.lower().endswith(input_format.lower()):
            input_path = os.path.join(input_folder, filename)
            output_filename = os.path.splitext(filename)[0] + '.' + output_format
            output_path = os.path.join(output_folder, output_filename)
            
            if conversion_function(input_path, output_path, output_format):
                success_count += 1
            total_count += 1
    
    print(f"Batch conversion complete. Successfully converted {success_count} out of {total_count} files.")

# Test functions
def test_image_conversion():
    input_path = 'test_image.jpg'
    output_path = 'test_image_converted.png'
    result = convert_image(input_path, output_path, 'png')
    print(f"Image conversion test {'passed' if result else 'failed'}")

def test_video_conversion():
    input_path = 'test_video.mp4'
    output_path = 'test_video_converted.avi'
    result = convert_video(input_path, output_path, 'avi')
    print(f"Video conversion test {'passed' if result else 'failed'}")

def test_audio_conversion():
    input_path = 'test_audio.mp3'
    output_path = 'test_audio_converted.wav'
    result = convert_audio(input_path, output_path, 'wav')
    print(f"Audio conversion test {'passed' if result else 'failed'}")

def test_batch_conversion():
    input_folder = 'test_batch_input'
    output_folder = 'test_batch_output'
    batch_convert(input_folder, output_folder, 'jpg', 'png', convert_image)
    print("Batch conversion test completed")

if __name__ == "__main__":
    test_image_conversion()
    test_video_conversion()
    test_audio_conversion()
    test_batch_conversion()