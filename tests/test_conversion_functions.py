import unittest
import os
import shutil
from PIL import Image
from conversion_functions.media_conversion import get_file_type, get_possible_formats, convert_file, batch_convert

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

        # Create dummy video and audio files
        self.test_video = os.path.join(self.test_input_dir, 'test_video.mp4')
        self.test_audio = os.path.join(self.test_input_dir, 'test_audio.mp3')
        open(self.test_video, 'w').close()
        open(self.test_audio, 'w').close()

    def tearDown(self):
        # Clean up test files after each test
        for file in os.listdir(self.test_input_dir):
            os.remove(os.path.join(self.test_input_dir, file))
        for file in os.listdir(self.test_output_dir):
            os.remove(os.path.join(self.test_output_dir, file))

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
        result = convert_file(self.test_image, output_path)
        print(f"Conversion result: {result}")
        print(f"Output file exists: {os.path.exists(output_path)}")
        self.assertTrue(result)
        self.assertTrue(os.path.exists(output_path))

    def test_batch_convert(self):
        batch_convert(self.test_input_dir, self.test_output_dir, 'png')
        expected_output = os.path.join(self.test_output_dir, 'test_image.png')
        print(f"Expected output path: {expected_output}")
        print(f"Output file exists: {os.path.exists(expected_output)}")
        self.assertTrue(os.path.exists(expected_output))

if __name__ == '__main__':
    unittest.main()