import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// POINTING TO FRONTEND DATA FOLDER
// backend/src/controllers/ -> ../../../frontend/src/data/celebrities.json
const DATA_FILE = path.join(__dirname, '../../data/celebrities.json');

// Ensure directory and file exist
const ensureFileExists = async () => {
  try {
    await fs.access(DATA_FILE);
  } catch {
    // If file doesn't exist, we can't really create it in the frontend folder 
    // without the folder structure, but assuming the user said it exists.
    throw new Error('Celebrities data file not found at: ' + DATA_FILE);
  }
};

export const getCelebrities = async (req, res) => {
  await ensureFileExists();
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error reading data file' });
  }
};

export const addCelebrity = async (req, res) => {
  await ensureFileExists();
  try {
    const { name, image } = req.body;
    if (!name || !image) {
      return res.status(400).json({ message: 'Name and Image URL are required' });
    }

    const fileContent = await fs.readFile(DATA_FILE, 'utf-8');
    const celebrities = JSON.parse(fileContent);

    // Check for duplicates
    if (celebrities.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      return res.status(400).json({ message: 'Celebrity already exists' });
    }

    // Generate Next ID (Handling String IDs)
    const maxId = celebrities.reduce((max, c) => {
        const currentId = parseInt(c.id);
        return !isNaN(currentId) && currentId > max ? currentId : max;
    }, 0);
    
    const newId = (maxId + 1).toString();

    const newCelebrity = { id: newId, name, image };
    celebrities.push(newCelebrity);

    await fs.writeFile(DATA_FILE, JSON.stringify(celebrities, null, 2));
    res.status(201).json(newCelebrity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving data' });
  }
};

export const updateCelebrity = async (req, res) => {
    await ensureFileExists();
    try {
      const { id } = req.params;
      const { name, image } = req.body;
      
      const fileContent = await fs.readFile(DATA_FILE, 'utf-8');
      let celebrities = JSON.parse(fileContent);
  
      const index = celebrities.findIndex(c => c.id === id);
      if (index === -1) {
        return res.status(404).json({ message: 'Celebrity not found' });
      }
  
      celebrities[index] = { ...celebrities[index], name, image };
  
      await fs.writeFile(DATA_FILE, JSON.stringify(celebrities, null, 2));
      res.json(celebrities[index]);
    } catch (error) {
      res.status(500).json({ message: 'Error updating data' });
    }
  };

  export const deleteCelebrity = async (req, res) => {
    await ensureFileExists();
    try {
      const { id } = req.params;
      const fileContent = await fs.readFile(DATA_FILE, 'utf-8');
      let celebrities = JSON.parse(fileContent);
      
      const newCelebrities = celebrities.filter(c => c.id !== id);
      
      await fs.writeFile(DATA_FILE, JSON.stringify(newCelebrities, null, 2));
      res.json({ message: 'Deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting data' });
    }
  };