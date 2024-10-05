import unittest
import os
import tempfile
from conversion_functions.media_conversion import get_file_type, get_possible_formats, convert_file, batch_convert

class TestMediaConversion(unittest.TestCase):

    def setUp(self):
        # Create temporary directories for testing
        self.test_input_dir = tempfile.mkdtemp()
        self.test_output_dir = tempfile.mkdtemp()

        # Create test files
        self.test_image = os.path.join(self.test_input_dir, 'test_image.jpg')
        self.test_video = os.path.join(self.test_input_dir, 'test_video.mp4')
        self.test_audio = os.path.join(self.test_input_dir, 'test_audio.mp3')

        # Create empty files (for testing purposes)
        open(self.test_image, 'w').close()
        open(self.test_video, 'w').close()
        open(self.test_audio, 'w').close()

    def tearDown(self):
        # Clean up temporary directories
        for file in os.listdir(self.test_input_dir):
            os.remove(os.path.join(self.test_input_dir, file))
        for file in os.listdir(self.test_output_dir):
            os.remove(os.path.join(self.test_output_dir, file))
        os.rmdir(self.test_input_dir)
        os.rmdir(self.test_output_dir)

    def test_get_file_type(self):
        self.assertEqual(get_file_type(self.test_image), 'image')
        self.assertEqual(get_file_type(self.test_video), 'video')
        self.assertEqual(get_file_type(self.test_audio), 'audio')

    def test_get_possible_formats(self):
        self.assertIn('png', get_possible_formats('image'))
        self.assertIn('mp4', get_possible_formats('video'))
        self.assertIn('wav', get_possible_formats('audio'))

    def test_convert_file(self):
        output_path = os.path.join(self.test_output_dir, 'output.png')
        self.assertTrue(convert_file(self.test_image, output_path))
        self.assertTrue(os.path.exists(output_path))

    def test_batch_convert(self):
        batch_convert(self.test_input_dir, self.test_output_dir, 'png')
        self.assertTrue(os.path.exists(os.path.join(self.test_output_dir, 'test_image.png')))

if __name__ == '__main__':
    unittest.main()