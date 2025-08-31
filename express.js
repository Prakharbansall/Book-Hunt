const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Path to books file
const booksFile = path.join(__dirname, 'books.json');

// Multer setup for file upload (cover image)
const upload = multer({ dest: path.join(__dirname, 'public', 'images') });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ========== ROUTES ========== //

// GET all books as JSON
app.get('/api/books', (req, res) => {
  try {
    const books = JSON.parse(fs.readFileSync(booksFile, 'utf-8'));
    res.json(books);
  } catch (error) {
    console.error('Error reading books:', error);
    res.status(500).json({ error: 'Failed to load books' });
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

// POST to add new book
app.post('/newbook', upload.single('cover'), (req, res) => {
  try {
    const { id, title, author, status, duedate } = req.body;
    const cover = req.file ? `images/${req.file.filename}` : "images/default.jpg";

    const books = JSON.parse(fs.readFileSync(booksFile, 'utf-8'));

    books.push({
      id: Number(id),
      title,
      author,
      cover,
      status,
      dueDate: duedate || null
    });

    fs.writeFileSync(booksFile, JSON.stringify(books, null, 2));
    res.redirect('/home');
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).send('Error adding book');
  }
});

// GET single book for editing
app.get("/books/:id", (req, res) => {
  try {
    const books = JSON.parse(fs.readFileSync(booksFile, 'utf-8'));
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
    const books = JSON.parse(fs.readFileSync(booksFile, 'utf-8'));
    const { id } = req.params;
    const bookIndex = books.findIndex((b) => b.id === Number(id));

    if (bookIndex !== -1) {
      books[bookIndex] = { ...books[bookIndex], ...req.body };
      fs.writeFileSync(booksFile, JSON.stringify(books, null, 2));
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
    const books = JSON.parse(fs.readFileSync(booksFile, 'utf-8'));
    const { id } = req.params;
    const bookIndex = books.findIndex((b) => b.id === Number(id));

    if (bookIndex !== -1) {
      books.splice(bookIndex, 1);
      fs.writeFileSync(booksFile, JSON.stringify(books, null, 2));
      res.json({ message: 'Book deleted successfully' });
    } else {
      res.status(404).send("Book not found");
    }
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
