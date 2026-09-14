import { promises as fs } from 'fs';
import path from 'path';

// Letterboxd exports live in src/data/letterboxd/. next.config.mjs
// (outputFileTracingIncludes) makes sure they ship with the API routes on Vercel.
const DATA_DIR = path.join(process.cwd(), 'src', 'data', 'letterboxd');

export const readLetterboxdFile = (filename) =>
  fs.readFile(path.join(DATA_DIR, filename), 'utf-8');
