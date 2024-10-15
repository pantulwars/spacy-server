from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import spacy

app = FastAPI()
origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Load spaCy model
nlp = spacy.load('en_core_web_md')

class TextRequest(BaseModel):
    text: str

class VectorResponse(BaseModel):
    vector: list

@app.post("/get_vector", response_model=VectorResponse)
async def get_vector(text_request: TextRequest):
    text = text_request.text
    doc = nlp(text)
    vector = doc.vector.tolist()

    # Ensure the vector is of size 525 using linear interpolation
    target_size = 525
    current_size = len(vector)

    if current_size < target_size:
        # If the vector is smaller, perform linear interpolation
        indices = np.linspace(0, current_size - 1, target_size)
        vector = np.interp(indices, np.arange(current_size), vector).tolist()
    elif current_size > target_size:
        # If the vector is larger, perform linear interpolation and then truncate
        indices = np.linspace(0, current_size - 1, target_size)
        vector = np.interp(indices, np.arange(current_size), vector).tolist()

    print(len(vector))
    return {"vector": vector}
