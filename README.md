# BookHunt - Library Book Management System

A web application for managing and searching library books with real-time availability tracking.

## Features

- 📚 Display all available books in a grid layout
- 🔍 Search books by title or author
- ➕ Add new books with cover images
- ✏️ Edit existing book information
- 🗑️ Delete books
- 📱 Responsive design for mobile devices
- 🎯 Book reservation system

## Tech Stack

- **Backend**: Node.js with Express.js
- **Frontend**: HTML, CSS, JavaScript
- **File Upload**: Multer
- **Deployment**: Vercel

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Open http://localhost:3000 in your browser

## Vercel Deployment

This project is configured for Vercel deployment with the following files:

- `vercel.json` - Vercel configuration
- `package.json` - Node.js dependencies and scripts
- `express.js` - Main server file

### Deployment Steps:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically detect the Node.js configuration
4. Deploy!

## API Endpoints

- `GET /api/books` - Get all books
- `GET /books/:id` - Get a specific book
- `PUT /books/:id` - Update a book
- `DELETE /books/:id` - Delete a book
- `POST /newbook` - Add a new book

## File Structure

```
├── express.js          # Main server file
├── books.json          # Book data storage
├── package.json        # Dependencies and scripts
├── vercel.json         # Vercel configuration
├── public/             # Static files
│   ├── index.html      # Main page
│   ├── newbook.html    # Add book form
│   ├── script.js       # Frontend JavaScript
│   ├── style.css       # Main styles
│   ├── newbook.css     # Add book form styles
│   └── images/         # Book cover images
└── README.md           # This file
```

## Troubleshooting

### Books not displaying on Vercel:
1. Check that `books.json` is properly formatted
2. Ensure the `/api/books` endpoint is working
3. Check browser console for JavaScript errors

### Edit functionality not working:
1. Verify the edit modal HTML is present
2. Check that the PUT endpoint is configured correctly
3. Ensure form data is being sent properly

### Image upload issues:
1. Make sure the `public/images` directory exists
2. Check file permissions on Vercel
3. Verify multer configuration

## Contributing

Feel free to submit issues and enhancement requests!

## License

ISC License
