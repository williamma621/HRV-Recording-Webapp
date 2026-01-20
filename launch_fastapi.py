import sys
import os
from pathlib import Path

# Add your backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Now import and run your FastAPI app
import uvicorn
from app import app  # Adjust based on your actual import

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
