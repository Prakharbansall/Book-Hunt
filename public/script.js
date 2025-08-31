// ==================== GLOBAL VARIABLES ==================== //
let books = [];
let currentDeleteId = null;

// ==================== DOM ELEMENTS ==================== //
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const bookGrid = document.getElementById('bookGrid');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const emptyState = document.getElementById('emptyState');
const bookCount = document.getElementById('bookCount');

// ==================== INITIALIZATION ==================== //
document.addEventListener('DOMContentLoaded', function() {
    console.log('BookHunt initialized');
    loadBooks();
    setupEventListeners();
    setupMobileMenu();
});

// ==================== LOAD BOOKS ==================== //
function loadBooks() {
    showLoading();
    
    fetch('/api/books')
        .then(res => {
            console.log('Response status:', res.status);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            console.log('Books data received:', data);
            books = data;
            renderBooks(books);
            updateBookCount(books.length);
            hideLoading();
        })
        .catch(error => {
            console.error('Error fetching books:', error);
            showError();
        });
}

// ==================== UI STATE MANAGEMENT ==================== //
function showLoading() {
    loadingState.style.display = 'block';
    errorState.style.display = 'none';
    emptyState.style.display = 'none';
    bookGrid.style.display = 'none';
}

function hideLoading() {
    loadingState.style.display = 'none';
}

function showError() {
    loadingState.style.display = 'none';
    errorState.style.display = 'block';
    emptyState.style.display = 'none';
    bookGrid.style.display = 'none';
}

function showEmpty() {
    loadingState.style.display = 'none';
    errorState.style.display = 'none';
    emptyState.style.display = 'block';
    bookGrid.style.display = 'none';
}

function showBooks() {
    loadingState.style.display = 'none';
    errorState.style.display = 'none';
    emptyState.style.display = 'none';
    bookGrid.style.display = 'grid';
}

function updateBookCount(count) {
    bookCount.textContent = count;
}

// ==================== RENDER BOOKS ==================== //
function renderBooks(booksToRender) {
    console.log('Rendering books:', booksToRender);
    
    if (!booksToRender || booksToRender.length === 0) {
        showEmpty();
        return;
    }

    showBooks();
    
    bookGrid.innerHTML = booksToRender.map(book => `
        <div class="book-card" data-id="${book.id}">
            <img src="${book.cover}" alt="${book.title}" onerror="this.src='https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop'">
            <h4>${escapeHtml(book.title)}</h4>
            <p class="author">${escapeHtml(book.author)}</p>
            <p class="status ${book.status}">
                ${book.status === "available" ? 
                    '<i class="fas fa-check-circle"></i> Available' : 
                    `<i class="fas fa-clock"></i> Due back: ${new Date(book.dueDate).toLocaleDateString()}`
                }
            </p>
            <div class="book-actions">
                ${book.status === "available" ? 
                    `<button class="book-it-btn" onclick="reserveBook(${book.id})">
                        <i class="fas fa-bookmark"></i> Book It
                    </button>` : ""
                }
                <button class="edit-btn" onclick="openEditModal(${book.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="delete-btn" onclick="openDeleteModal(${book.id}, '${escapeHtml(book.title)}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join("");
}

// ==================== SEARCH FUNCTIONALITY ==================== //
function setupEventListeners() {
    searchInput.addEventListener("input", (e) => {
        filterBooks(e.target.value.toLowerCase());
    });

    searchButton.addEventListener("click", () => {
        filterBooks(searchInput.value.toLowerCase());
    });

    // Enter key to search
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === 'Enter') {
            filterBooks(searchInput.value.toLowerCase());
        }
    });
}

function filterBooks(searchTerm) {
    const filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(searchTerm) || 
        book.author.toLowerCase().includes(searchTerm)
    );
    renderBooks(filteredBooks);
    updateBookCount(filteredBooks.length);
}

// ==================== RESERVE BOOK FUNCTIONALITY ==================== //
function reserveBook(bookId) {
    const book = books.find(b => b.id == bookId);
    if (book) {
        book.status = "unavailable";
        book.dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days from today

        // Show confirmation modal
        const modal = document.getElementById("bookingModal");
        const modalMessage = document.getElementById("modalMessage");
        modalMessage.textContent = `"${book.title}" is reserved for you until ${new Date(book.dueDate).toLocaleDateString()}.`;
        modal.style.display = "flex";
        
        // Update the display
        renderBooks(books);
    }
}

// ==================== EDIT BOOK FUNCTIONALITY ==================== //
function openEditModal(bookId) {
    const book = books.find(b => b.id == bookId);
    if (book) {
        const editModal = document.getElementById("editModal");
        const editForm = document.getElementById("editForm");
        
        // Populate form fields
        editForm.querySelector('[name="id"]').value = book.id;
        editForm.querySelector('#editTitle').value = book.title;
        editForm.querySelector('#editAuthor').value = book.author;
        editForm.querySelector('#editStatus').value = book.status;
        editForm.querySelector('#editDueDate').value = book.dueDate ? book.dueDate.split('T')[0] : '';
        
        editModal.style.display = "flex";
    }
}

function updateBook(bookId, bookData) {
    fetch(`/books/${bookId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData)
    })
    .then(res => res.json())
    .then(updatedBook => {
        // Update local books array
        const index = books.findIndex(b => b.id == bookId);
        if (index !== -1) {
            books[index] = updatedBook;
            renderBooks(books);
        }
        closeEditModal();
    })
    .catch(error => {
        console.error('Error updating book:', error);
        alert('Error updating book. Please try again.');
    });
}

// ==================== DELETE BOOK FUNCTIONALITY ==================== //
function openDeleteModal(bookId, bookTitle) {
    currentDeleteId = bookId;
    document.getElementById('deleteBookTitle').textContent = bookTitle;
    document.getElementById('deleteModal').style.display = 'flex';
}

function confirmDelete() {
    if (currentDeleteId) {
        fetch(`/books/${currentDeleteId}`, {
            method: 'DELETE'
        })
        .then(res => res.json())
        .then(data => {
            // Remove from local books array
            books = books.filter(b => b.id != currentDeleteId);
            renderBooks(books);
            updateBookCount(books.length);
            closeDeleteModal();
        })
        .catch(error => {
            console.error('Error deleting book:', error);
            alert('Error deleting book. Please try again.');
        });
    }
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    currentDeleteId = null;
}

// ==================== MODAL MANAGEMENT ==================== //
function setupModals() {
    // Booking modal
    const bookingModal = document.getElementById("bookingModal");
    const closeBtn = document.querySelector(".close");
    const confirmBtn = document.getElementById("confirmButton");

    closeBtn.addEventListener("click", () => {
        bookingModal.style.display = "none";
        renderBooks(books);
    });

    confirmBtn.addEventListener("click", () => {
        bookingModal.style.display = "none";
        renderBooks(books);
    });

    // Edit modal
    const editModal = document.getElementById("editModal");
    const closeEditBtn = document.querySelector(".close-edit");
    const editForm = document.getElementById("editForm");

    closeEditBtn.addEventListener("click", closeEditModal);

    editForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(editForm);
        const bookData = {
            title: formData.get('title'),
            author: formData.get('author'),
            status: formData.get('status'),
            dueDate: formData.get('duedate') || null
        };
        
        const bookId = formData.get('id');
        updateBook(bookId, bookData);
    });

    // Close modals when clicking outside
    window.addEventListener("click", (e) => {
        if (e.target === bookingModal) {
            bookingModal.style.display = "none";
            renderBooks(books);
        }
        if (e.target === editModal) {
            closeEditModal();
        }
    });
}

function closeEditModal() {
    document.getElementById("editModal").style.display = "none";
}

// ==================== MOBILE MENU ==================== //
function setupMobileMenu() {
    const navbar = document.querySelector(".navbar");
    const navLinks = document.querySelector(".nav-links");

    // Create hamburger menu icon for mobile view
    const mobileMenuButton = document.createElement("button");
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

// ==================== UTILITY FUNCTIONS ==================== //
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== INITIALIZE MODALS ==================== //
setupModals();
