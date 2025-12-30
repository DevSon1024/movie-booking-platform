import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data/celebrities.json');

// Ensure directory and file exist
const ensureFileExists = async () => {
  try {
    await fs.access(DATA_FILE);
  } catch {
    const dir = path.dirname(DATA_FILE);
    await fs.mkdir(dir, { recursive: true });
    // Create initial data if file doesn't exist
    const initialData = [
      {
        "id": "200",
        "name": "Anu Malik",
        "image": "https://upload.wikimedia.org/wikipedia/commons/6/6e/Anu_Malik_at_Indian_Idol_10_launch.jpg"
      },
      {
        "id": "201",
        "name": "Vikrant Massey",
        "image": "https://upload.wikimedia.org/wikipedia/commons/2/29/Vikrant_Massey_in_the_closing_ceremony_of_IFFI_2025_%28cropped%29.jpg"
      }
    ];
    await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
};

export const getCelebrities = async (req, res) => {
  await ensureFileExists();
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ message: 'Error reading data' });
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

    // Generate Next ID
    const maxId = celebrities.reduce((max, c) => Math.max(max, parseInt(c.id || 0)), 0);
    const newId = (maxId + 1).toString();

    const newCelebrity = { id: newId, name, image };
    celebrities.push(newCelebrity);

    await fs.writeFile(DATA_FILE, JSON.stringify(celebrities, null, 2));
    res.status(201).json(newCelebrity);
  } catch (error) {
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