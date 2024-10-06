import unittest
import os
import shutil
from PIL import Image
import subprocess
import asyncio
import psutil
import logging
from conversion_functions.media_conversion import get_file_type, get_possible_formats, convert_file, batch_convert

# Set up logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def kill_ffmpeg_processes():
    for proc in psutil.process_iter(['name']):
        if proc.info['name'] == 'ffmpeg.exe':
            proc.kill()

class TestMediaConversion(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Get the path to the tests directory
        cls.tests_dir = os.path.dirname(os.path.abspath(__file__))
        cls.project_root = os.path.dirname(cls.tests_dir)
        
        # Create test_files directory if it doesn't exist
        cls.test_files_dir = os.path.join(cls.tests_dir, 'test_files')
        os.makedirs(cls.test_files_dir, exist_ok=True)

        # Create test input and output directories
        cls.test_input_dir = os.path.join(cls.test_files_dir, 'input')
        cls.test_output_dir = os.path.join(cls.test_files_dir, 'output')
        os.makedirs(cls.test_input_dir, exist_ok=True)
        os.makedirs(cls.test_output_dir, exist_ok=True)

    def setUp(self):
        # Create actual image file
        self.test_image = os.path.join(self.test_input_dir, 'test_image.jpg')
        img = Image.new('RGB', (100, 100), color = 'red')
        img.save(self.test_image)

        # Create small, valid video file
        self.test_video = os.path.join(self.test_input_dir, 'test_video.mp4')
        subprocess.run([
            'ffmpeg', '-f', 'lavfi', '-i', 'testsrc=duration=5:size=320x240:rate=30', 
            '-c:v', 'libx264', '-crf', '23', '-pix_fmt', 'yuv420p', self.test_video
        ], check=True)

        # Create small, valid audio file
        self.test_audio = os.path.join(self.test_input_dir, 'test_audio.mp3')
        subprocess.run([
            'ffmpeg', '-f', 'lavfi', '-i', 'sine=frequency=1000:duration=5',
            '-c:a', 'libmp3lame', self.test_audio
        ], check=True)

    def tearDown(self):
        # Kill any lingering FFmpeg processes
        kill_ffmpeg_processes()
        
        # Clean up test files after each test
        for file in os.listdir(self.test_input_dir):
            file_path = os.path.join(self.test_input_dir, file)
            try:
                if os.path.isfile(file_path):
                    os.unlink(file_path)
                elif os.path.isdir(file_path):
                    shutil.rmtree(file_path)
            except Exception as e:
                print(f"Failed to delete {file_path}. Reason: {e}")

        for file in os.listdir(self.test_output_dir):
            file_path = os.path.join(self.test_output_dir, file)
            try:
                if os.path.isfile(file_path):
                    os.unlink(file_path)
                elif os.path.isdir(file_path):
                    shutil.rmtree(file_path)
            except Exception as e:
                print(f"Failed to delete {file_path}. Reason: {e}")

    @classmethod
    def tearDownClass(cls):
        # Remove the test_files directory and its contents
        shutil.rmtree(cls.test_files_dir)

    def test_get_file_type(self):
        file_type = get_file_type(self.test_image)
        print(f"Test image path: {self.test_image}")
        print(f"Detected file type: {file_type}")
        self.assertEqual(file_type, 'image')

    def test_get_possible_formats(self):
        self.assertIn('png', get_possible_formats('image'))
        self.assertIn('mp4', get_possible_formats('video'))
        self.assertIn('wav', get_possible_formats('audio'))

    def test_convert_file(self):
        output_path = os.path.join(self.test_output_dir, 'output.png')
        result = asyncio.run(convert_file(self.test_image, output_path, 'png'))
        logger.debug(f"Conversion result: {result}")
        logger.debug(f"Output file exists: {os.path.exists(output_path)}")
        self.assertTrue(result)
        self.assertTrue(os.path.exists(output_path))

    def test_batch_convert(self):
        success_count, total_count = asyncio.run(batch_convert(self.test_input_dir, self.test_output_dir, 'png'))
        expected_output = os.path.join(self.test_output_dir, 'test_image.png')
        logger.debug(f"Expected output path: {expected_output}")
        logger.debug(f"Output file exists: {os.path.exists(expected_output)}")
        logger.debug(f"Success count: {success_count}, Total count: {total_count}")
        self.assertTrue(os.path.exists(expected_output))
        self.assertEqual(success_count, total_count)

    def test_convert_file_with_progress(self):
        output_path = os.path.join(self.test_output_dir, 'output.png')
        progress_values = []

        async def progress_callback(progress):
            progress_values.append(progress)
            logger.debug(f"Progress: {progress}")

        result = asyncio.run(convert_file(self.test_image, output_path, 'png', progress_callback))

        logger.debug(f"Conversion result: {result}")
        logger.debug(f"Output file exists: {os.path.exists(output_path)}")
        logger.debug(f"Progress values: {progress_values}")

        self.assertTrue(result)
        self.assertTrue(os.path.exists(output_path))
        self.assertGreater(len(progress_values), 0)
        if len(progress_values) > 1:
            self.assertGreater(progress_values[-1], progress_values[0])  # Progress should increase
        self.assertLessEqual(progress_values[-1], 1.0)  # Progress should not exceed 100%

    def test_batch_convert_with_progress(self):
        progress_values = []

        async def progress_callback(progress):
            progress_values.append(progress)
            logger.debug(f"Progress: {progress}")

        success_count, total_count = asyncio.run(batch_convert(self.test_input_dir, self.test_output_dir, 'png', progress_callback))

        expected_outputs = [
            os.path.join(self.test_output_dir, 'test_image.png'),
            os.path.join(self.test_output_dir, 'test_video.png'),
            os.path.join(self.test_output_dir, 'test_audio.png')
        ]

        for output_path in expected_outputs:
            logger.debug(f"Expected output path: {output_path}")
            logger.debug(f"Output file exists: {os.path.exists(output_path)}")

        logger.debug(f"Progress values: {progress_values}")
        logger.debug(f"Success count: {success_count}, Total count: {total_count}")

        self.assertTrue(any(os.path.exists(path) for path in expected_outputs), "No output files were created")
        self.assertGreater(len(progress_values), 0, "No progress values were recorded")
        if len(progress_values) > 1:
            self.assertGreater(progress_values[-1], progress_values[0], "Progress did not increase")
        self.assertLessEqual(progress_values[-1], 1.0, "Progress exceeded 100%")
        self.assertEqual(success_count, total_count, "Not all files were successfully converted")

if __name__ == '__main__':
    unittest.main()