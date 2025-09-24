// testCategorizer.js
import categorizer from '../categorizer/index.js';

async function runTests() {
  const queries = [
    "What tools did Luo use pre-colonial?",
    "Tell me about Samburu people",
    "What is the belief about ancestors?",
    "Explain the modern practices of weddings",
    "Which period was colonization?"
  ];

  for (const q of queries) {
    const category = await categorizer.categorize(q);
    console.log(`Query: "${q}" → Category: ${category}`);
  }
}

runTests();
