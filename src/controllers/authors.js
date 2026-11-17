import {
  getAllAuthors as getAllAuthorsFromDb,
  getAuthorById as getAuthorByIdFromDb,
  createAuthor as createAuthorFromDb,
  updateAuthor as updateAuthorFromDb,
  deleteAuthor as deleteAuthorFromDb,
  authorHasBooks,
} from '../models/authors.js';

const getAllAuthors = async (req, res) => {
  try {
    const authors = await getAllAuthorsFromDb();
    return res.status(200).json(authors);
  } catch (error) {
    return res.status(500).json({ error: 'Unable to retrieve authors.' });
  }
};

const getAuthorById = async (req, res) => {
  try {
    const { id } = req.params;
    const author = await getAuthorByIdFromDb(id);

    if (!author) {
      return res.status(404).json({ error: 'Author not found.' });
    }

    return res.status(200).json(author);
  } catch (error) {
    return res.status(500).json({ error: 'Unable to retrieve author.' });
  }
};

const createAuthor = async (req, res) => {
  try {
    // Extract fields from the request body
    const { id, authorName, bornYear, ...extraFields } = req.body;

    // 1. Reject extra fields (including 'id' if sent in the body)
    if (Object.keys(extraFields).length > 0) {
      return res.status(400).json({ error: 'Request body contains invalid or extra fields.' });
    }

    // 2. Validate fields like id, authorName, and bornYear
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Valid string "id" is required.' });
    }
    if (!authorName || typeof authorName !== 'string' || authorName.trim() === '') {
      return res.status(400).json({ error: 'Valid non-empty "authorName" is required.' });
    }
    if (bornYear === undefined || !Number.isInteger(bornYear) || bornYear > 2026) {
      return res.status(400).json({ error: 'Valid "bornYear" integer (<= 2026) is required.' });
    }

    // 3. Verify that the author ID does not already exist
    const existingAuthor = await getAuthorByIdFromDb(id);
    if (existingAuthor) {
      return res.status(400).json({ error: 'Author id already exists.' });
    }

    // 4. Create the author (sanitizing the name)
    const newAuthor = { id, authorName: authorName.trim(), bornYear };
    const createdAuthor = await createAuthorFromDb(newAuthor);
    return res.status(201).json(createdAuthor);

  } catch (error) {
    return res.status(500).json({ error: 'Unable to create author.' });
  }
};

const updateAuthor = async (req, res) => {
  try {
    const { id } = req.params; // the ID of the author to update
    const { authorName, bornYear, ...extraFields } = req.body;

    // 1. Reject extra fields (including 'id' if sent in the body)
    if (Object.keys(extraFields).length > 0 || req.body.id) {
      return res.status(400).json({ error: 'Request body contains invalid or extra fields.' });
    }

    // 2. Validate fields
    if (!authorName || typeof authorName !== 'string' || authorName.trim() === '') {
      return res.status(400).json({ error: 'Valid non-empty "authorName" is required.' });
    }
    if (bornYear === undefined || !Number.isInteger(bornYear) || bornYear > 2026) {
      return res.status(400).json({ error: 'Valid "bornYear" integer (<= 2026) is required.' });
    }

    // 3. Verify that the author exists
    const existingAuthor = await getAuthorByIdFromDb(id);
    if (!existingAuthor) {
      return res.status(404).json({ error: 'Author not found.' });
    }

    // 4. Update the author
    const updatedAuthor = await updateAuthorFromDb(id, { authorName: authorName.trim(), bornYear });
    return res.status(200).json(updatedAuthor);

  } catch (error) {
    return res.status(500).json({ error: 'Unable to update author.' });
  }
};

const deleteAuthor = async (req, res) => {
  try {
    const { id } = req.params;

    const existingAuthor = await getAuthorByIdFromDb(id);
    if (!existingAuthor) {
      return res.status(404).json({ error: 'Author not found.' });
    }

    // REFERENTIAL INTEGRITY GUARD: Verify that no books reference this author before deletion
    if (await authorHasBooks(id)) {
      return res.status(409).json({ error: 'Author cannot be deleted while books reference it' });
    }

    await deleteAuthorFromDb(id);
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Unable to delete author.' });
  }
};

export { getAllAuthors, getAuthorById, createAuthor, updateAuthor, deleteAuthor };