import { getAllBooks, getBookById, createBook, updateBook, deleteBook } from '../models/books.js';
import { getAuthorById } from '../models/authors.js'; // Importing the function to check if an author exists

const getBooks = async (req, res) => {
  try {
    const books = await getAllBooks();
    return res.status(200).json(books);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getBook = async (req, res) => {
  try {
    const book = await getBookById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const createNewBook = async (req, res) => {
  try {
    const { id, authorId, title, publicationDate } = req.body;
    
    // 1. Validate that all required fields are present
    if (!id || !authorId || !title || !publicationDate) {
      return res.status(400).json({ error: 'All fields (id, authorId, title, publicationDate) are required' });
    }

    // 2. Referential Integrity: Check if the authorId exists in the authors collection
    const authorExists = await getAuthorById(authorId);
    if (!authorExists) {
      return res.status(400).json({ error: 'authorId does not match an existing author' });
    }

    const newBook = { id, authorId, title, publicationDate };
    await createBook(newBook);
    
    // Returns 201 Created according to the Test Plan
    return res.status(201).json(newBook);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const updateExistingBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const { authorId, title, publicationDate } = req.body;

    // Verify if the book exists first
    const existingBook = await getBookById(bookId);
    if (!existingBook) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Validate fields
    if (!authorId || !title || !publicationDate) {
      return res.status(400).json({ error: 'All fields (authorId, title, publicationDate) are required' });
    }

    // Referential Integrity: Check if the authorId exists in the authors collection
    const authorExists = await getAuthorById(authorId);
    if (!authorExists) {
      return res.status(400).json({ error: 'authorId does not match an existing author' });
    }

    await updateBook(bookId, { authorId, title, publicationDate });
    return res.status(204).send(); 
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const removeBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    
    const existingBook = await getBookById(bookId);
    if (!existingBook) {
      return res.status(404).json({ error: 'Book not found' });
    }

    await deleteBook(bookId);
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export { getBooks, getBook, createNewBook, updateExistingBook, removeBook };