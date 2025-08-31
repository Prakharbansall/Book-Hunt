// Form validation and user interaction
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('addBookForm');
    const titleInput = document.getElementById('title');
    const authorInput = document.getElementById('author');
    const statusSelect = document.getElementById('status');
    const dueDateInput = document.getElementById('duedate');
    const submitBtn = document.getElementById('submitBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const successModal = document.getElementById('successModal');

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    dueDateInput.min = today;

    // Real-time validation
    titleInput.addEventListener('input', function() {
        validateTitle();
    });

    authorInput.addEventListener('input', function() {
        validateAuthor();
    });

    statusSelect.addEventListener('change', function() {
        toggleDueDate();
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            showLoading();
            submitForm();
        }
    });

    // Validation functions
    function validateTitle() {
        const title = titleInput.value.trim();
        const errorElement = document.getElementById('titleError');
        
        if (title.length < 2) {
            showError(titleInput, errorElement, 'Title must be at least 2 characters long');
            return false;
        } else if (title.length > 100) {
            showError(titleInput, errorElement, 'Title must be less than 100 characters');
            return false;
        } else {
            clearError(titleInput, errorElement);
            return true;
        }
    }

    function validateAuthor() {
        const author = authorInput.value.trim();
        const errorElement = document.getElementById('authorError');
        
        if (author.length < 2) {
            showError(authorInput, errorElement, 'Author name must be at least 2 characters long');
            return false;
        } else if (author.length > 100) {
            showError(authorInput, errorElement, 'Author name must be less than 100 characters');
            return false;
        } else {
            clearError(authorInput, errorElement);
            return true;
        }
    }

    function validateForm() {
        const isTitleValid = validateTitle();
        const isAuthorValid = validateAuthor();
        
        return isTitleValid && isAuthorValid;
    }

    function showError(input, errorElement, message) {
        input.classList.add('error');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    function clearError(input, errorElement) {
        input.classList.remove('error');
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }

    function toggleDueDate() {
        if (statusSelect.value === 'unavailable') {
            dueDateInput.style.display = 'block';
            dueDateInput.required = true;
        } else {
            dueDateInput.style.display = 'none';
            dueDateInput.required = false;
            dueDateInput.value = '';
        }
    }

    function showLoading() {
        loadingSpinner.style.display = 'flex';
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    }

    function hideLoading() {
        loadingSpinner.style.display = 'none';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Book';
    }

    function showSuccess() {
        successModal.style.display = 'flex';
    }

    function submitForm() {
        const formData = new FormData(form);
        
        fetch('/newbook', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                hideLoading();
                showSuccess();
            } else {
                throw new Error('Failed to add book');
            }
        })
        .catch(error => {
            hideLoading();
            showError('An error occurred while adding the book. Please try again.');
            console.error('Error:', error);
        });
    }

    function showError(message) {
        alert(message);
    }

    // Initialize due date visibility
    toggleDueDate();
});

// Navigation functions
function goBack() {
    if (confirm('Are you sure you want to cancel? All entered data will be lost.')) {
        window.history.back();
    }
}

function goHome() {
    window.location.href = '/home';
}

function addAnother() {
    document.getElementById('successModal').style.display = 'none';
    document.getElementById('addBookForm').reset();
    document.getElementById('title').focus();
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('successModal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key to close modal
    if (e.key === 'Escape') {
        const modal = document.getElementById('successModal');
        if (modal.style.display === 'flex') {
            modal.style.display = 'none';
        }
    }
    
    // Ctrl+Enter to submit form
    if (e.ctrlKey && e.key === 'Enter') {
        const form = document.getElementById('addBookForm');
        if (form) {
            form.dispatchEvent(new Event('submit'));
        }
    }
});
