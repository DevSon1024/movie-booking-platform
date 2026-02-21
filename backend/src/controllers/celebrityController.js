import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import axios from 'axios';

// Helper to get file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data file and image directory paths
const DATA_FILE = path.join(__dirname, '../../data/celebrities.json');
const IMAGE_DIR = path.join(__dirname, '../../data/celebrityImages');

// Ensure directory and file exist
const ensureFileExists = async () => {
  try {
    await fs.access(DATA_FILE);
  } catch {
    throw new Error('Celebrities data file not found at: ' + DATA_FILE);
  }
};

// Ensure image directory exists
const ensureImageDirExists = async () => {
  try {
    await fs.access(IMAGE_DIR);
  } catch {
    await fs.mkdir(IMAGE_DIR, { recursive: true });
  }
};

// Convert image to WebP format
const convertToWebP = async (inputPath, outputFilename) => {
  await ensureImageDirExists();
  const outputPath = path.join(IMAGE_DIR, outputFilename);
  
  const isWebp = inputPath.toLowerCase().endsWith('.webp');
  
  let sharpInstance = sharp(inputPath)
    .resize(800, 1200, { fit: 'cover', withoutEnlargement: true });
    
  if (!isWebp) {
    sharpInstance = sharpInstance.webp({ quality: 85 });
  }
  
  await sharpInstance.toFile(outputPath);
    
  return outputFilename;
};

// Download external image and convert to WebP
const downloadAndConvertToWebP = async (imageUrl, outputFilename) => {
  await ensureImageDirExists();
  const outputPath = path.join(IMAGE_DIR, outputFilename);
  
  const response = await axios.get(imageUrl, { 
    responseType: 'arraybuffer',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  });
  
  const contentType = response.headers['content-type'];
  const isWebp = contentType === 'image/webp' || imageUrl.toLowerCase().endsWith('.webp');
  
  let sharpInstance = sharp(response.data)
    .resize(800, 1200, { fit: 'cover', withoutEnlargement: true });
    
  if (!isWebp) {
    sharpInstance = sharpInstance.webp({ quality: 85 });
  }

  await sharpInstance.toFile(outputPath);
    
  return outputFilename;
};

const formatNameForFile = (name) => {
    return name.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').toLowerCase();
};

// Delete old image file
const deleteImageFile = async (filename) => {
  if (!filename || filename.startsWith('http')) return; // Skip URLs
  
  try {
    const filePath = path.join(IMAGE_DIR, filename);
    await fs.unlink(filePath);
  } catch (error) {
    console.log('Could not delete old image:', error.message);
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
    const imageFile = req.file;
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    if (!image && !imageFile) {
      return res.status(400).json({ message: 'Image URL or image file is required' });
    }

    const fileContent = await fs.readFile(DATA_FILE, 'utf-8');
    const celebrities = JSON.parse(fileContent);

    // Check for duplicates
    if (celebrities.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      // Delete uploaded file if duplicate
      if (imageFile) {
        await fs.unlink(imageFile.path);
      }
      return res.status(400).json({ message: 'Celebrity already exists' });
    }

    // Generate Next ID
    const maxId = celebrities.reduce((max, c) => {
        const currentId = parseInt(c.id);
        return !isNaN(currentId) && currentId > max ? currentId : max;
    }, 0);
    
    const newId = (maxId + 1).toString();

    let finalImagePath = image;
    
    // If file was uploaded, convert to WebP
    if (imageFile) {
      const formattedName = formatNameForFile(name);
      const webpFilename = `celeb_${newId}_${formattedName}.webp`;
      await convertToWebP(imageFile.path, webpFilename);
      
      // Delete original uploaded file
      await fs.unlink(imageFile.path);
      
      // Use relative path for local images
      finalImagePath = `/api/celebrities/images/${webpFilename}`;
    } else if (image && /^https?:\/\//i.test(image)) {
      try {
        const formattedName = formatNameForFile(name);
        const webpFilename = `celeb_${newId}_${formattedName}.webp`;
        await downloadAndConvertToWebP(image, webpFilename);
        finalImagePath = `/api/celebrities/images/${webpFilename}`;
      } catch (err) {
        console.error("Error downloading image from URL:", err.message);
        return res.status(400).json({ message: 'Failed to download image from the provided URL' });
      }
    }

    const newCelebrity = { id: newId, name, image: finalImagePath };
    celebrities.push(newCelebrity);

    await fs.writeFile(DATA_FILE, JSON.stringify(celebrities, null, 2));
    res.status(201).json(newCelebrity);
  } catch (error) {
    console.error(error);
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch {}
    }
    res.status(500).json({ message: 'Error saving data' });
  }
};

export const updateCelebrity = async (req, res) => {
    await ensureFileExists();
    try {
      const { id } = req.params;
      const { name, image } = req.body;
      const imageFile = req.file;
      
      const fileContent = await fs.readFile(DATA_FILE, 'utf-8');
      let celebrities = JSON.parse(fileContent);
  
      const index = celebrities.findIndex(c => c.id === id);
      if (index === -1) {
        // Clean up uploaded file if celebrity not found
        if (imageFile) {
          await fs.unlink(imageFile.path);
        }
        return res.status(404).json({ message: 'Celebrity not found' });
      }
  
      const oldCelebrity = celebrities[index];
      let finalImagePath = image || oldCelebrity.image;
      
      // If new file was uploaded, convert to WebP
      const celebrityName = name || oldCelebrity.name;
      if (imageFile) {
        const formattedName = formatNameForFile(celebrityName);
        const webpFilename = `celeb_${id}_${formattedName}.webp`;
        await convertToWebP(imageFile.path, webpFilename);
        
        // Delete original uploaded file
        await fs.unlink(imageFile.path);
        
        // Delete old image if it was a local file
        if (oldCelebrity.image && oldCelebrity.image.includes('/api/celebrities/images/')) {
          const oldFilename = path.basename(oldCelebrity.image);
          await deleteImageFile(oldFilename);
        }
        
        finalImagePath = `/api/celebrities/images/${webpFilename}`;
      } else if (image && /^https?:\/\//i.test(image) && image !== oldCelebrity.image) {
        try {
          const formattedName = formatNameForFile(celebrityName);
          const webpFilename = `celeb_${id}_${formattedName}.webp`;
          await downloadAndConvertToWebP(image, webpFilename);
          
          if (oldCelebrity.image && oldCelebrity.image.includes('/api/celebrities/images/')) {
            const oldFilename = path.basename(oldCelebrity.image);
            await deleteImageFile(oldFilename);
          }
          
          finalImagePath = `/api/celebrities/images/${webpFilename}`;
        } catch (err) {
          console.error("Error downloading image from URL:", err.message);
          return res.status(400).json({ message: 'Failed to download image from the provided URL' });
        }
      }
      
      celebrities[index] = { ...oldCelebrity, name: name || oldCelebrity.name, image: finalImagePath };
  
      await fs.writeFile(DATA_FILE, JSON.stringify(celebrities, null, 2));
      res.json(celebrities[index]);
    } catch (error) {
      console.error(error);
      // Clean up uploaded file on error
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch {}
      }
      res.status(500).json({ message: 'Error updating data' });
    }
  };

  export const deleteCelebrity = async (req, res) => {
    await ensureFileExists();
    try {
      const { id } = req.params;
      const fileContent = await fs.readFile(DATA_FILE, 'utf-8');
      let celebrities = JSON.parse(fileContent);
      
      const celebrity = celebrities.find(c => c.id === id);
      
      // Delete associated image file if it's a local file
      if (celebrity && celebrity.image && celebrity.image.includes('/api/celebrities/images/')) {
        const filename = path.basename(celebrity.image);
        await deleteImageFile(filename);
      }
      
      const newCelebrities = celebrities.filter(c => c.id !== id);
      
      await fs.writeFile(DATA_FILE, JSON.stringify(newCelebrities, null, 2));
      res.json({ message: 'Deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error deleting data' });
    }
  };

  export const downloadImage = async (req, res) => {
    await ensureFileExists();
    try {
      const { id, name, url } = req.body;
      if (!name || !url) {
        return res.status(400).json({ message: 'Name and image URL are required' });
      }

      if (!/^https?:\/\//i.test(url)) {
        return res.status(400).json({ message: 'Valid image URL is required' });
      }
      
      let celebId = id;
      if (!celebId) {
        const fileContent = await fs.readFile(DATA_FILE, 'utf-8');
        const celebrities = JSON.parse(fileContent);
        const maxId = celebrities.reduce((max, c) => {
            const currentId = parseInt(c.id);
            return !isNaN(currentId) && currentId > max ? currentId : max;
        }, 0);
        celebId = (maxId + 1).toString();
      }

      const formattedName = formatNameForFile(name);
      const webpFilename = `celeb_${celebId}_${formattedName}.webp`;
      await downloadAndConvertToWebP(url, webpFilename);
      
      const finalImagePath = `/api/celebrities/images/${webpFilename}`;
      res.json({ message: 'Image downloaded successfully', image: finalImagePath });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error downloading image' });
    }
  };

// Serve celebrity images
export const serveImage = (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(IMAGE_DIR, filename);
  
  // Check if file exists
  if (!fsSync.existsSync(filePath)) {
    return res.status(404).json({ message: 'Image not found' });
  }
  
  res.sendFile(filePath);
};