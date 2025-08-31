const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Path to books file
const booksFile = path.join(__dirname, 'books.json');

// In-memory storage for Vercel (fallback)
let booksInMemory = [];

// Try to load books from file, fallback to in-memory
function loadBooks() {
  try {
    if (fs.existsSync(booksFile)) {
      const books = JSON.parse(fs.readFileSync(booksFile, 'utf-8'));
      booksInMemory = books;
      return books;
    }
  } catch (error) {
    console.error('Error loading books from file:', error);
  }
  
  // Fallback to default books if file doesn't exist
  if (booksInMemory.length === 0) {
    booksInMemory = [
      {
        "id": 1,
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "cover": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop",
        "status": "available",
        "dueDate": null
      },
      {
        "id": 2,
        "title": "To Kill a Mockingbird",
        "author": "Harper Lee",
        "cover": "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop",
        "status": "available",
        "dueDate": null
      },
      {
        "id": 3,
        "title": "1984",
        "author": "George Orwell",
        "cover": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop",
        "status": "available",
        "dueDate": null
      },
      {
        "id": 4,
        "title": "Pride and Prejudice",
        "author": "Jane Austen",
        "cover": "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&h=400&fit=crop",
        "status": "available",
        "dueDate": null
      },
      {
        "id": 5,
        "title": "The Catcher in the Rye",
        "author": "J.D. Salinger",
        "cover": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop",
        "status": "available",
        "dueDate": null
      },
      {
        "id": 6,
        "title": "Lord of the Flies",
        "author": "William Golding",
        "cover": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop",
        "status": "available",
        "dueDate": null
      },
      {
        "id": 7,
        "title": "Animal Farm",
        "author": "George Orwell",
        "cover": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop",
        "status": "available",
        "dueDate": null
      },
      {
        "id": 8,
        "title": "The Hobbit",
        "author": "J.R.R. Tolkien",
        "cover": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop",
        "status": "available",
        "dueDate": null
      },
      {
        "id": 9,
        "title": "Fahrenheit 451",
        "author": "Ray Bradbury",
        "cover": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop",
        "status": "available",
        "dueDate": null
      },
      {
        "id": 10,
        "title": "The Alchemist",
        "author": "Paulo Coelho",
        "cover": "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&h=400&fit=crop",
        "status": "available",
        "dueDate": null
      },
      {
        "id": 11,
        "title": "The Kite Runner",
        "author": "Khaled Hosseini",
        "cover": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop",
        "status": "available",
        "dueDate": null
      },
      {
        "id": 12,
        "title": "The Book Thief",
        "author": "Markus Zusak",
        "cover": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop",
        "status": "available",
        "dueDate": null
      },
      {
        "id": 13,
        "title": "The Fault in Our Stars",
        "author": "John Green",
        "cover": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop",
        "status": "available",
        "dueDate": null
      },
      {
        "id": 14,
        "title": "Gone Girl",
        "author": "Gillian Flynn",
        "cover": "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&h=400&fit=crop",
        "status": "available",
        "dueDate": null
      },
      {
        "id": 15,
        "title": "The Martian",
        "author": "Andy Weir",
        "cover": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop",
        "status": "available",
        "dueDate": null
      }
    ];
  }
  
  return booksInMemory;
}

// Save books to file or memory
function saveBooks(books) {
  booksInMemory = books;
  try {
    fs.writeFileSync(booksFile, JSON.stringify(books, null, 2));
  } catch (error) {
    console.error('Error saving books to file:', error);
    // Continue with in-memory storage
  }
}

// Generate unique ID
function generateId() {
  const books = loadBooks();
  return Math.max(...books.map(book => book.id), 0) + 1;
}

// Initialize books
loadBooks();

// Multer setup for file upload (cover image)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'public', 'images');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ========== ROUTES ========== //

// GET all books as JSON
app.get('/api/books', (req, res) => {
  try {
    const books = loadBooks();
    res.json(books);
  } catch (error) {
    console.error('Error reading books:', error);
    res.status(500).json({ error: 'Failed to load books', books: booksInMemory });
  }
});

// POST to add book via API
app.post('/api/books', (req, res) => {
  try {
    const { title, author, cover, status, dueDate } = req.body;
    
    // Validation
    if (!title || !author) {
      return res.status(400).json({ error: 'Title and author are required' });
    }

    const books = loadBooks();
    const newBook = {
      id: generateId(),
      title: title.trim(),
      author: author.trim(),
      cover: cover || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop",
      status: status || "available",
      dueDate: dueDate || null
    };

    books.push(newBook);
    saveBooks(books);
    res.json({ message: 'Book added successfully', book: newBook });
  } catch (error) {
    console.error('Error adding book via API:', error);
    res.status(500).json({ error: 'Failed to add book' });
  }
});

// Serve frontend home page
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve root page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve new book form
app.get('/new', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'newbook.html'));
});

// Serve test page
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test.html'));
});

// POST to add new book with image upload
app.post('/newbook', upload.single('cover'), (req, res) => {
  try {
    const { title, author, status, duedate } = req.body;
    
    // Validation
    if (!title || !author) {
      return res.status(400).send(`
        <html>
          <head><title>Error</title></head>
          <body>
            <h2>Error: Title and author are required</h2>
            <a href="/new">Go back</a>
          </body>
        </html>
      `);
    }

    // Handle image upload
    let coverUrl = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop"; // Default cover
    
    if (req.file) {
      // For Vercel deployment, we'll use a placeholder since file storage is ephemeral
      // In a real app, you'd upload to a service like AWS S3 or Cloudinary
      coverUrl = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop";
    }

    const books = loadBooks();
    const newBook = {
      id: generateId(),
      title: title.trim(),
      author: author.trim(),
      cover: coverUrl,
      status: status || "available",
      dueDate: duedate || null
    };

    books.push(newBook);
    saveBooks(books);
    res.redirect('/home');
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).send(`
      <html>
        <head><title>Error</title></head>
        <body>
          <h2>Error adding book</h2>
          <p>${error.message}</p>
          <a href="/new">Go back</a>
        </body>
      </html>
    `);
  }
});

// GET single book for editing
app.get("/books/:id", (req, res) => {
  try {
    const books = loadBooks();
    const { id } = req.params;
    const book = books.find((b) => b.id === Number(id));

    if (book) {
      res.json(book);
    } else {
      res.status(404).send("Book not found");
    }
  } catch (error) {
    console.error('Error getting book:', error);
    res.status(500).json({ error: 'Failed to get book' });
  }
});

// PUT to update book
app.put("/books/:id", (req, res) => {
  try {
    const books = loadBooks();
    const { id } = req.params;
    const bookIndex = books.findIndex((b) => b.id === Number(id));

    if (bookIndex !== -1) {
      books[bookIndex] = { ...books[bookIndex], ...req.body };
      saveBooks(books);
      res.json(books[bookIndex]);
    } else {
      res.status(404).send("Book not found");
    }
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// DELETE book
app.delete("/books/:id", (req, res) => {
  try {
    const books = loadBooks();
    const { id } = req.params;
    const bookIndex = books.findIndex((b) => b.id === Number(id));

    if (bookIndex !== -1) {
      books.splice(bookIndex, 1);
      saveBooks(books);
      res.json({ message: 'Book deleted successfully' });
    } else {
      res.status(404).send("Book not found");
    }
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

// Health check endpoint for Vercel
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', booksCount: booksInMemory.length });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
