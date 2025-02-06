console.log('Initializing Supabase...');
const supabaseUrl = 'https://ueonybuekrjhyldunuvm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlb255YnVla3JqaHlsZHVudXZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0NDgyNDAsImV4cCI6MjA1MjAyNDI0MH0.C-H2RXWxe6dbsbnTGwGWnX_EU36PaYmWoghfZh6zS0I';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);
console.log('Supabase initialized:', supabase);

// Test Supabase connection
async function testSupabase() {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase
        .from('books')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Supabase connection error:', error);
    } else {
        console.log('Supabase connection successful:', data);
    }
}

testSupabase();

async function fetchBooks() {
    const { data, error } = await supabase
        .from('books')
        .select('*');

    if (error) {
        console.error('Error fetching books:', error);
        return;
    }

    displayBooks(data);
}

function displayBooks(books) {
    const booksList = document.getElementById('books-list');
    booksList.innerHTML = '';

    books.forEach(book => {
        const bookElement = document.createElement('div');
        bookElement.className = 'book';

        bookElement.innerHTML = `
            <h3>${book.title}</h3>
            <p>By ${book.author}</p>
            <p>${book.is_borrowed ? `Borrowed by ${book.borrowed_by}` : 'Available'}</p>
            <button onclick="toggleBorrow(${book.id}, ${!book.is_borrowed})">
                ${book.is_borrowed ? 'Return' : 'Borrow'}
            </button>
        `;

        booksList.appendChild(bookElement);
    });
}

async function toggleBorrow(bookId, isBorrowed) {
    const borrowedBy = isBorrowed ? prompt("Enter your name:") : null;

    const { data, error } = await supabase
        .from('books')
        .update({ is_borrowed: isBorrowed, borrowed_by: borrowedBy })
        .eq('id', bookId);

    if (error) {
        console.error('Error updating book:', error);
        return;
    }

    fetchBooks();
}

document.addEventListener('DOMContentLoaded', fetchBooks);