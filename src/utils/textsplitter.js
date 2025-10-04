
import { MAX_CHUNK_LENGTH } from "./config.js";

export function splitText(text) {
  const chunks = [];
  let current = "";
  
  text.split(/\s+/).forEach((word) => {
    if ((current + " " + word).length > MAX_CHUNK_LENGTH) {
      chunks.push(current);
      current = word;
    } else {
      current += (current ? " " : "") + word;
    }
  });
  
  if (current) chunks.push(current);
  
  return chunks;
}