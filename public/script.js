// ==================== FETCH BOOK DATA FROM BACKEND ==================== //
// This fetches the latest book list from the backend API endpoint (/api/books)
let books = [];

fetch('/api/books')
  .then(res => res.json())
  .then(data => {
    books = data;              // Store fetched books in global array
    renderBooks(books);        // Render them to the page
    setupMobileMenu();         // Setup nav bar mobile menu
    setupModal();              // Setup modal window behavior
  });

// ==================== DOM ELEMENTS ==================== //
const searchInput = document.querySelector(".search-bar input");
const searchButton = document.querySelector(".search-bar button");
const bookGrid = document.querySelector(".book-grid");
const mobileMenuButton = document.createElement("button");

// ==================== RENDER BOOKS TO PAGE ==================== //
// This function displays all books in a grid layout
function renderBooks(booksToRender) {
  bookGrid.innerHTML = booksToRender.map(book => `
    <div class="book-card">
        <img src="${book.cover}" alt="${book.title}">
        <h4>${book.title}</h4>
        <p class="author">${book.author}</p>
        <p class="status ${book.status}">
          ${book.status === "available" ? 
              "Available" : 
              `Due back: ${new Date(book.dueDate).toLocaleDateString()}`
          }
        </p>
        ${book.status === "available" ? 
            `<button class="book-it-btn" data-id="${book.id}">Book It</button>` : ""
        }
    </div>
  `).join("");

  // Add click events to each "Book It" button
  document.querySelectorAll(".book-it-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const bookId = e.target.getAttribute("data-id");
      reserveBook(bookId);
    });
  });
}
    
// ==================== SEARCH FUNCTIONALITY ==================== //
// When user types or clicks search, filter and display matched books
searchInput.addEventListener("input", (e) => {
  filterBooks(e.target.value.toLowerCase());
});

searchButton.addEventListener("click", () => {
  filterBooks(searchInput.value.toLowerCase());
});

// Filters the books array based on the search text
function filterBooks(searchTerm) {
  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm) || 
    book.author.toLowerCase().includes(searchTerm)
  );
  renderBooks(filteredBooks);
}

// ==================== RESERVE BOOK FUNCTIONALITY ==================== //
// Simulates reserving a book by marking it as unavailable and setting due date
function reserveBook(bookId) {
  const book = books.find(b => b.id == bookId);
  if (book) {
    book.status = "unavailable";
    book.dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days from today

    // Show confirmation modal with book title and due date
    const modal = document.getElementById("bookingModal");
    const modalMessage = document.getElementById("modalMessage");
    modalMessage.textContent = `"${book.title}" is reserved for you until ${new Date(book.dueDate).toLocaleDateString()}.`;
    modal.style.display = "flex";
  }
}

// ==================== SETUP MODAL (POPUP WINDOW) ==================== //
function setupModal() {
  const modal = document.getElementById("bookingModal");
  const closeBtn = document.querySelector(".close");
  const confirmBtn = document.getElementById("confirmButton");

  // Close modal on 'X' button
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
    renderBooks(books); // Refresh view
  });

  // Close modal on "OK" button
  confirmBtn.addEventListener("click", () => {
    modal.style.display = "none";
    renderBooks(books);
  });

  // Close modal if clicking outside the modal content
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
      renderBooks(books);
    }
  });
}

// ==================== NAVBAR - MOBILE MENU TOGGLE ==================== //
function setupMobileMenu() {
  const navbar = document.querySelector(".navbar");
  const navLinks = document.querySelector(".nav-links");

  // Create hamburger menu icon for mobile view
  mobileMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
  mobileMenuButton.classList.add("mobile-menu-button");
  navbar.appendChild(mobileMenuButton);

  // Toggle mobile nav menu
  mobileMenuButton.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });

  // Auto-close menu when a nav link is clicked
  document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
    });
  });
}
