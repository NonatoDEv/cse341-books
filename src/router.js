import express from 'express';
import { getBooksHandler, getBookByIdHandler } from './controllers/books.js';
import {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} from './controllers/authors.js';

const router = express.Router();

router.get('/books', getBooksHandler);
router.get('/books/:id', getBookByIdHandler);

/**
 * @openapi
 * /authors:
 *   get:
 *     summary: Get all authors
 *     tags:
 *       - Authors
 *     responses:
 *       200:
 *         description: A list of authors
 *       500:
 *         description: Unable to retrieve authors
 */
router.get('/authors', getAllAuthors);

/**
 * @openapi
 * /authors/{id}:
 *   get:
 *     summary: Get author by ID
 *     tags:
 *       - Authors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The custom author ID (e.g., a1)
 *     responses:
 *       200:
 *         description: A single author
 *       404:
 *         description: Author not found
 *       500:
 *         description: Unable to retrieve author
 */
router.get('/authors/:id', getAuthorById);

/**
 * @openapi
 * /authors:
 *   post:
 *     summary: Create an author
 *     tags:
 *       - Authors
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - authorName
 *               - bornYear
 *             properties:
 *               id:
 *                 type: string
 *               authorName:
 *                 type: string
 *               bornYear:
 *                 type: integer
 *           example:
 *             id: "a3"
 *             authorName: "Isabel Allende"
 *             bornYear: 1942
 *     responses:
 *       201:
 *         description: Author created
 *       400:
 *         description: Missing required fields, extra fields, duplicate id, or future year
 *       500:
 *         description: Unable to create author
 */
router.post('/authors', createAuthor);

/**
 * @openapi
 * /authors/{id}:
 *   put:
 *     summary: Update an author by ID
 *     tags:
 *       - Authors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The custom author ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - authorName
 *               - bornYear
 *             properties:
 *               authorName:
 *                 type: string
 *               bornYear:
 *                 type: integer
 *           example:
 *             authorName: "Isabel Allende"
 *             bornYear: 1942
 *     responses:
 *       200:
 *         description: Author updated
 *       400:
 *         description: Missing required fields, extra fields, or future year
 *       404:
 *         description: Author not found
 *       500:
 *         description: Unable to update author
 */
router.put('/authors/:id', updateAuthor);

/**
 * @openapi
 * /authors/{id}:
 *   delete:
 *     summary: Delete an author by ID
 *     tags:
 *       - Authors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The custom author ID
 *     responses:
 *       204:
 *         description: Author deleted (No Content)
 *       404:
 *         description: Author not found
 *       409:
 *         description: Author cannot be deleted while books reference it
 *       500:
 *         description: Unable to delete author
 */
router.delete('/authors/:id', deleteAuthor);

export default router;
