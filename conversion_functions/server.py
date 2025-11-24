"""
Flask API Server for Unicon File Conversion
Provides REST endpoints and Server-Sent Events for real-time progress updates
"""

import os
import sys
import json
import uuid
import asyncio
import logging
from pathlib import Path
from typing import Dict, Optional
from queue import Queue
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from threading import Thread

# Import conversion functions
from media_conversion import (
    convert_file,
    batch_convert,
    get_file_type,
    get_possible_formats
)
from document_conversion import (
    convert_document,
    get_document_type,
    get_document_formats
)

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for Electron renderer

# Global state for conversion jobs
conversion_jobs: Dict[str, dict] = {}
progress_queues: Dict[str, Queue] = {}

# FFmpeg binary path (will be set from environment or bundled location)
FFMPEG_PATH = os.environ.get('FFMPEG_PATH', 'ffmpeg')


def get_resource_path(relative_path):
    """Get absolute path to resource, works for dev and PyInstaller bundle"""
    try:
        # PyInstaller creates a temp folder and stores path in _MEIPASS
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(os.path.dirname(__file__))

    return os.path.join(base_path, relative_path)


def set_ffmpeg_path():
    """Set FFmpeg path based on bundled binary or system installation"""
    global FFMPEG_PATH

    # Try to find bundled FFmpeg first
    if sys.platform == 'win32':
        bundled_ffmpeg = get_resource_path('../ffmpeg/ffmpeg.exe')
    else:
        bundled_ffmpeg = get_resource_path('../ffmpeg/ffmpeg')

    if os.path.exists(bundled_ffmpeg):
        FFMPEG_PATH = bundled_ffmpeg
        logger.info(f"Using bundled FFmpeg at: {FFMPEG_PATH}")
    else:
        logger.info("Using system FFmpeg from PATH")


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'ffmpeg_path': FFMPEG_PATH,
        'version': '1.0.0'
    })


@app.route('/formats', methods=['GET'])
def get_formats():
    """Get all supported formats organized by type"""
    return jsonify({
        'media': {
            'video': get_possible_formats('video'),
            'audio': get_possible_formats('audio'),
            'image': get_possible_formats('image')
        },
        'documents': get_document_formats()
    })


@app.route('/detect-type', methods=['POST'])
def detect_file_type():
    """Detect file type from file path"""
    data = request.json
    file_path = data.get('file_path')

    if not file_path or not os.path.exists(file_path):
        return jsonify({'error': 'Invalid file path'}), 400

    # Try media type first
    media_type = get_file_type(file_path)
    if media_type != 'unknown':
        return jsonify({
            'type': 'media',
            'subtype': media_type,
            'formats': get_possible_formats(media_type)
        })

    # Try document type
    doc_type = get_document_type(file_path)
    if doc_type != 'unknown':
        return jsonify({
            'type': 'document',
            'subtype': doc_type,
            'formats': get_document_formats().get(doc_type, [])
        })

    return jsonify({
        'type': 'unknown',
        'subtype': 'unknown',
        'formats': []
    })


@app.route('/convert', methods=['POST'])
def convert():
    """Convert a single file"""
    data = request.json
    input_path = data.get('input_path')
    output_path = data.get('output_path')
    output_format = data.get('output_format')

    if not all([input_path, output_path, output_format]):
        return jsonify({'error': 'Missing required parameters'}), 400

    if not os.path.exists(input_path):
        return jsonify({'error': f'Input file not found: {input_path}'}), 404

    # Generate job ID
    job_id = str(uuid.uuid4())

    # Create progress queue for this job
    progress_queues[job_id] = Queue()

    # Initialize job state
    conversion_jobs[job_id] = {
        'status': 'pending',
        'progress': 0.0,
        'input_path': input_path,
        'output_path': output_path,
        'output_format': output_format,
        'error': None
    }

    # Start conversion in background thread
    thread = Thread(target=run_conversion, args=(job_id, input_path, output_path, output_format))
    thread.daemon = True
    thread.start()

    return jsonify({
        'job_id': job_id,
        'status': 'started'
    })


@app.route('/batch-convert', methods=['POST'])
def batch_convert_endpoint():
    """Convert multiple files in a folder"""
    data = request.json
    input_folder = data.get('input_folder')
    output_folder = data.get('output_folder')
    output_format = data.get('output_format')

    if not all([input_folder, output_folder, output_format]):
        return jsonify({'error': 'Missing required parameters'}), 400

    if not os.path.exists(input_folder):
        return jsonify({'error': f'Input folder not found: {input_folder}'}), 404

    # Generate job ID
    job_id = str(uuid.uuid4())

    # Create progress queue for this job
    progress_queues[job_id] = Queue()

    # Initialize job state
    conversion_jobs[job_id] = {
        'status': 'pending',
        'progress': 0.0,
        'input_folder': input_folder,
        'output_folder': output_folder,
        'output_format': output_format,
        'error': None
    }

    # Start batch conversion in background thread
    thread = Thread(target=run_batch_conversion, args=(job_id, input_folder, output_folder, output_format))
    thread.daemon = True
    thread.start()

    return jsonify({
        'job_id': job_id,
        'status': 'started'
    })


@app.route('/progress/<job_id>', methods=['GET'])
def get_progress_stream(job_id):
    """Server-Sent Events endpoint for real-time progress updates"""
    if job_id not in conversion_jobs:
        return jsonify({'error': 'Job not found'}), 404

    def generate():
        """Generate SSE events"""
        queue = progress_queues.get(job_id)
        if not queue:
            yield f"data: {json.dumps({'error': 'Progress queue not found'})}\n\n"
            return

        while True:
            # Get progress update from queue
            update = queue.get()

            # Send SSE event
            yield f"data: {json.dumps(update)}\n\n"

            # Stop if job is complete or failed
            if update.get('status') in ['completed', 'failed']:
                break

    return Response(generate(), mimetype='text/event-stream')


@app.route('/job/<job_id>', methods=['GET'])
def get_job_status(job_id):
    """Get current status of a conversion job"""
    if job_id not in conversion_jobs:
        return jsonify({'error': 'Job not found'}), 404

    return jsonify(conversion_jobs[job_id])


def run_conversion(job_id: str, input_path: str, output_path: str, output_format: str):
    """Run conversion in background thread"""
    try:
        # Update status
        conversion_jobs[job_id]['status'] = 'processing'
        progress_queues[job_id].put({
            'status': 'processing',
            'progress': 0.0,
            'message': 'Starting conversion...'
        })

        # Determine if this is a media or document conversion
        file_type = get_file_type(input_path)

        if file_type != 'unknown':
            # Media conversion
            async def progress_callback(progress: float):
                conversion_jobs[job_id]['progress'] = progress
                progress_queues[job_id].put({
                    'status': 'processing',
                    'progress': progress,
                    'message': f'Converting... {progress:.1%}'
                })

            # Run async conversion
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            success = loop.run_until_complete(
                convert_file(input_path, output_path, output_format, progress_callback)
            )
            loop.close()
        else:
            # Document conversion
            progress_queues[job_id].put({
                'status': 'processing',
                'progress': 0.5,
                'message': 'Converting document...'
            })

            success = convert_document(input_path, output_path, output_format)

        if success:
            conversion_jobs[job_id]['status'] = 'completed'
            conversion_jobs[job_id]['progress'] = 1.0
            progress_queues[job_id].put({
                'status': 'completed',
                'progress': 1.0,
                'message': 'Conversion complete!',
                'output_path': output_path
            })
        else:
            raise Exception('Conversion failed')

    except Exception as e:
        logger.exception(f"Error during conversion: {str(e)}")
        conversion_jobs[job_id]['status'] = 'failed'
        conversion_jobs[job_id]['error'] = str(e)
        progress_queues[job_id].put({
            'status': 'failed',
            'progress': 0.0,
            'error': str(e),
            'message': f'Conversion failed: {str(e)}'
        })


def run_batch_conversion(job_id: str, input_folder: str, output_folder: str, output_format: str):
    """Run batch conversion in background thread"""
    try:
        conversion_jobs[job_id]['status'] = 'processing'
        progress_queues[job_id].put({
            'status': 'processing',
            'progress': 0.0,
            'message': 'Starting batch conversion...'
        })

        async def progress_callback(progress: float):
            conversion_jobs[job_id]['progress'] = progress
            progress_queues[job_id].put({
                'status': 'processing',
                'progress': progress,
                'message': f'Converting... {progress:.1%}'
            })

        # Run async batch conversion
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        success_count, total_count = loop.run_until_complete(
            batch_convert(input_folder, output_folder, output_format, progress_callback)
        )
        loop.close()

        conversion_jobs[job_id]['status'] = 'completed'
        conversion_jobs[job_id]['progress'] = 1.0
        conversion_jobs[job_id]['success_count'] = success_count
        conversion_jobs[job_id]['total_count'] = total_count

        progress_queues[job_id].put({
            'status': 'completed',
            'progress': 1.0,
            'message': f'Batch conversion complete! {success_count}/{total_count} files converted',
            'success_count': success_count,
            'total_count': total_count
        })

    except Exception as e:
        logger.exception(f"Error during batch conversion: {str(e)}")
        conversion_jobs[job_id]['status'] = 'failed'
        conversion_jobs[job_id]['error'] = str(e)
        progress_queues[job_id].put({
            'status': 'failed',
            'progress': 0.0,
            'error': str(e),
            'message': f'Batch conversion failed: {str(e)}'
        })


def main():
    """Start the Flask server"""
    # Set FFmpeg path
    set_ffmpeg_path()

    # Get port from environment or use default
    port = int(os.environ.get('UNICON_PORT', 5000))

    logger.info(f"Starting Unicon conversion server on port {port}")
    logger.info(f"FFmpeg path: {FFMPEG_PATH}")

    # Run Flask server
    app.run(host='127.0.0.1', port=port, debug=False, threaded=True)


if __name__ == '__main__':
    main()
