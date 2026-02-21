import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { getCelebrities, addCelebrity, updateCelebrity, deleteCelebrity, downloadImage } from '../controllers/celebrityController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../data/celebrityImages');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `celeb_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Public route to get list (for forms)
router.get('/', getCelebrities);

// Serve celebrity images
import { serveImage } from '../controllers/celebrityController.js';
router.get('/images/:filename', serveImage);

// Admin only routes with file upload support
router.post('/download', protect, admin, downloadImage);
router.post('/', protect, admin, upload.single('imageFile'), addCelebrity);
router.put('/:id', protect, admin, upload.single('imageFile'), updateCelebrity);
router.delete('/:id', protect, admin, deleteCelebrity);

export default router;