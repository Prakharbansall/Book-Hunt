const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Path to books file
const booksFile = path.join(__dirname, 'books.json');

// Multer setup for file upload (cover image)
const upload = multer({ dest: path.join(__dirname, 'public', 'images') });

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ========== ROUTES ========== //

// GET all books as JSON
app.get('/api/books', (req, res) => {
  const books = JSON.parse(fs.readFileSync(booksFile, 'utf-8'));
  res.json(books);
});

// Serve frontend home page
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve new book form
app.get('/new', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'newbook.html'));
});

// POST to add new book
app.post('/newbook', upload.single('cover'), (req, res) => {
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
});

app.get("/books/:id", (req, res) => {
  const books = JSON.parse(fs.readFileSync(booksFile, 'utf-8')); // load fresh data
  const { id } = req.params;
  const book = books.find((b) => b.id === Number(id));

  if (book) {
    res.json(book);
  } else {
    res.status(404).send("Book not found");
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
