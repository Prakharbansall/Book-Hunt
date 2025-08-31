const express = require('express');
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
    const { title, author, status, dueDate } = req.body;
    
    // Validation
    if (!title || !author) {
      return res.status(400).json({ error: 'Title and author are required' });
    }

    const books = loadBooks();
    const newBook = {
      id: generateId(),
      title: title.trim(),
      author: author.trim(),
      cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop",
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

// POST to add new book (simplified for Vercel)
app.post('/newbook', (req, res) => {
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

    const books = loadBooks();
    const newBook = {
      id: generateId(),
      title: title.trim(),
      author: author.trim(),
      cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop",
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
