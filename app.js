// 1) Initialize Supabase
const { createClient } = supabase; // from the CDN script
const supabaseUrl = 'https://ueonybuekrjhyldunuvm.supabase.co';       // <-- Replace with your URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlb255YnVla3JqaHlsZHVudXZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0NDgyNDAsImV4cCI6MjA1MjAyNDI0MH0.C-H2RXWxe6dbsbnTGwGWnX_EU36PaYmWoghfZh6zS0I'; // <-- Replace with your anon key
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Grab references to elements
const signupForm = document.getElementById('signup-form');
const signinForm = document.getElementById('signin-form');
const booksList = document.getElementById('books-list');
const authButton = document.getElementById('auth-button');

/* --------------------------------------------------------------------------
   LOGIN PAGE LOGIC (login.html)
   -------------------------------------------------------------------------- */
if (signupForm || signinForm) {
  document.addEventListener('DOMContentLoaded', async () => {
    const { data: sessionData } = await supabaseClient.auth.getSession();
    console.log('Login page session:', sessionData);

    if (sessionData.session) {
      // Redirect to main page if already signed in
      window.location.href = 'index.html';
      return;
    }

    // Handle Sign Up
    if (signupForm) {
      signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password,
        });

        if (error) {
          console.error('Sign-up error:', error);
          alert(`Sign-up error: ${error.message}`);
          return;
        }

        alert('Sign-up successful! Check your email if confirmations are enabled.');
        console.log('Sign-up response:', data);
      });
    }

    // Handle Sign In
    if (signinForm) {
      signinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;

        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('Sign-in error:', error);
          alert(`Sign-in error: ${error.message}`);
          return;
        }

        alert('Sign-in successful!');
        console.log('Sign-in response:', data);
        window.location.href = 'index.html';
      });
    }
  });
}

/* --------------------------------------------------------------------------
   MAIN PAGE LOGIC (index.html)
   -------------------------------------------------------------------------- */
if (booksList) {
  document.addEventListener('DOMContentLoaded', async () => {
    // Check for an active session
    const { data: sessionData } = await supabaseClient.auth.getSession();
    console.log('Main page session:', sessionData);

    // Update the auth button based on session status
    if (authButton) {
      if (sessionData.session) {
        authButton.textContent = 'Sign Out';
        authButton.onclick = async () => {
          console.log('Signing out...');
          const { error } = await supabaseClient.auth.signOut();
          if (error) {
            console.error('Error signing out:', error);
            alert('Error signing out');
          } else {
            alert('Signed out');
            location.reload();
          }
        };
      } else {
        authButton.textContent = 'Sign In';
        authButton.onclick = () => {
          console.log('Redirecting to login page...');
          window.location.href = 'login.html';
        };
      }
    }

    // Always fetch and display books
    fetchBooks();
  });

  // Fetch Books from Supabase
  async function fetchBooks() {
    const { data, error } = await supabaseClient
      .from('books')
      .select('*');

    if (error) {
      console.error('Error fetching books:', error);
      booksList.innerHTML = '<p>Error loading books. Check console for details.</p>';
      return;
    }

    console.log('Books fetched:', data);
    displayBooks(data);
  }

  // Display Books in the DOM
  function displayBooks(books) {
    booksList.innerHTML = '';

    books.forEach((book) => {
      const bookElement = document.createElement('div');
      bookElement.className = 'book';
      bookElement.innerHTML = `
        <h3>${book.title}</h3>
        <p>By ${book.author}</p>
        <p>${book.is_borrowed ? `Borrowed by ${book.borrowed_by}` : 'Available'}</p>
        <button onclick="toggleBorrow('${book.id}', ${!book.is_borrowed})">
          ${book.is_borrowed ? 'Return' : 'Borrow'}
        </button>
      `;
      booksList.appendChild(bookElement);
    });
  }

  // Toggle Borrow Status for a Book
  window.toggleBorrow = async function(bookId, isBorrowed) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user && isBorrowed) {
      alert('Please sign in before borrowing a book.');
      return;
    }

    const borrowedBy = isBorrowed ? user.email : null;
    const { data, error } = await supabaseClient
      .from('books')
      .update({ is_borrowed: isBorrowed, borrowed_by: borrowedBy })
      .eq('id', bookId);

    if (error) {
      console.error('Error updating book:', error);
      return;
    }

    fetchBooks();
  };
}
