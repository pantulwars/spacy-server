import axios from 'axios';

interface VectorResponse {
  vector: number[];
}

async function getVectorFromApi(text: string): Promise<number[] | null> {
  const apiUrl = 'http://127.0.0.1:8002/get_vector';

  const data = { text };

  try {
    const response = await axios.post<VectorResponse>(apiUrl, data);

    if (response.status === 200) {
      return response.data.vector;
    } else {
      console.error(`Error: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.error('Failed to retrieve vector:', error.message);
    return null;
  }
}

// Example usage
async function main() {
  const exampleText = 'This is an example text.';
  const vector = await getVectorFromApi(exampleText);

  if (vector) {
    console.log('Vector:', vector);
  } else {
    console.log('Failed to retrieve vector.');
  }
}

main();
