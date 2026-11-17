# Books API Week 02 Spec - Version 1

## Feature 1: Book CRUD Operations and Author References

### Goal
Update the existing Week 01 book API so book documents include a reference to an author and the API supports all CRUD operations for books. Every book route must be documented and testable in Swagger.

### Data Model
Book documents will be stored in the `books` collection.

Required book fields:
- `id`: string, required, custom id such as `b1`
- `authorId`: string, required, references the `id` field of an author document
- `title`: string, required
- `publicationDate`: string, required

Books will continue to use custom string ids instead of MongoDB `_id` values for route parameters.

### Relationship to Authors
Each book will identify its author with an `authorId` field. The value of `authorId` must match the custom `id` value of an existing author document.

When creating or updating a book, the API should reject the request with a `400` status code if the submitted `authorId` does not match an existing author.

### Routes

#### GET /books
Purpose: Return all books.

Success:
- Status code: `200`
- Response body: an array of book objects

Errors:
- `500` if an unexpected server or database error occurs

#### GET /books/:id
Purpose: Return one book by its custom id.

Success:
- Status code: `200`
- Response body: the matching book object

Errors:
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

#### POST /books
Purpose: Create a new book.

Request body:

    {
      "id": "b4",
      "authorId": "a1",
      "title": "Example Book Title",
      "publicationDate": "2026-01-15"
    }

Success:
- Status code: `201`
- Response body: the newly created book object

Errors:
- `400` if a required field is missing
- `400` if the `id` already exists
- `400` if the `authorId` does not match an existing author
- `500` if an unexpected server or database error occurs

#### PUT /books/:id
Purpose: Update an existing book.

Request body:

    {
      "authorId": "a2",
      "title": "Updated Book Title",
      "publicationDate": "2026-02-20"
    }

Success:
- Status code: `200`
- Response body: the updated book object

Errors:
- `400` if a required field is missing
- `400` if the `authorId` does not match an existing author
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

#### DELETE /books/:id
Purpose: Delete an existing book.

Success:
- Status code: `204`
- Response body: none

Errors:
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

### Swagger Documentation
Swagger must document every book route.

### Deployment Expectations
After implementation, the book routes must work locally and from the deployed Render application. The deployed Swagger page at `/api-docs` must allow someone to test every book route from the browser.

## Feature 2
Implement secure and fully documented CRUD operations for the authors collection. The system must enforce strict bidirectional referential integrity, specifically preventing the deletion of any author whose id is still referenced by existing books. All error responses will consistently use a standardized JSON structure: { "error": "descriptive message" }

### Data Model
Target Collection: authors
- id (String): Alphanumeric public identifier (e.g., a1).
    - Constraints: Required, database-level unique (unique index), and immutable after creation. Route parameters will  strictly use this custom ID, isolating MongoDB's internal _id.

- authorName (String): The full name or pseudonym of the author.
    - Constraints: Required, non-empty, and sanitized (trimmed of leading/trailing whitespace).

- bornYear (Integer): The year the author was born.
    - Constraints: Required valid integer. It must not be a future year (e.g., must be <= 2026).

### Relationship to books & deletion constrains
- Bidirectional link: Each author maintains a one-to-many relationship with the books collection. A book identifies its author via the authorId field, which strictly references the author's custom id.
 
- Referential Integrity Guard: To prevent database corruption and the creation of "orphan books", the API enforces strict deletion constraints. An author cannot be deleted if they are still linked to existing books.

- Deletion Block: Before executing a DELETE request, the API must actively query the books collection. If one or more books currently reference the target author's id, the API must immediately abort the deletion process and return a 409 Conflict status code with the exact payload: { "error": "Author cannot be deleted while books reference it" }.

### Routes
#### GET /authors 
- Purpose: Return all the authors

- success:
    Returns 200 OK and an array of author objects. 
- Errors:
Returns 500 for an unexpected error.

#### GET/authors/:id
- Purpose:Return one author by their custom id.

- Success:
    Returns 200 OK and the matching author object.
- Errors:
    Returns 404 Not Found when no matching custom id exists.
    Returns 500 Internal Server Error for an unexpected error.

#### POST/authors
- Purpose: Create a new author.

- Request Body:

    {
    "id": "a3",
    "authorName": "Isabel Allende",
    "bornYear": 1942
    }

- Success:
    Returns 201 Created and the newly created author object.
- Errors: 
    Returns 400 Bad Request for missing, invalid, or extra fields; duplicate id; or a future/non-integer bornYear.
    Returns 500 Internal Server Error for an unexpected error.

#### PUT/authors/:id

- Purpose: Update an existing author. The URL id is authoritative.

- Request Body:

    {
    "authorName": "Isabel Allende",
    "bornYear": 1942
    }

- Success:
    Returns 200 OK and the updated author object.
- Errors:
    Returns 400 Bad Request for missing, invalid, or extra fields.
    Returns 404 Not Found when the author does not exist.
    Returns 500 Internal Server Error for an unexpected error.

#### DELETE/authors/:id

- Purpose: Delete an existing author.

- Success:
    Returns 204 No Content with no response body when deletion succeeds.
- Errors:
    Returns 409 Conflict (with { "error": "Author cannot be deleted while books reference it" }) when referenced books exist.
    Returns 404 Not Found when the author does not exist.
    Returns 500 Internal Server Error for an unexpected error.
### Swagger Documentation
Swagger must document every author route.

### Deployment Expectations

After implementation, the author routes must work locally and from the deployed Render application. The deployed Swagger page at /api-docs must allow someone to test every author route from the browser.

## Evaluation of Books API Week 02 Spec.
- Bugs or short-sighted decisions 
    - Different error messages: Feature 2 says all errors must use the JSON format { "error": "descriptive message" }. Feature 1 does not say this. This means users will get different types of error messages depending on if they are using the books or the authors routes.

    - Missing date rules: In the books section, publicationDate is just a text string. The document does not explain the date format (like YYYY-MM-DD) or check if it is a real date on the calendar.

    - Accepting extra information: The POST and PUT routes for authors block requests that have extra fields. The books section does not mention this. A user could add unwanted information to the books database.

    - Unclear PUT rules for books: For authors, the document clearly says the ID in the URL is the one that matters and cannot be changed. For books, it does not explain what happens if a user tries to change the ID in the request.

- Security Considerations
    - Protecting secrets: The system must check all data before saving it to the database. Also, passwords and database connections must stay hidden in environment variables. They should never be visible in Swagger or on GitHub.
    - Checking text inputs: For authors, the authorName cannot be empty and must have extra spaces removed. However, there is no similar rule for the book title. A user could send a book title that is completely empty or just spaces.

- Efficiency considerations
    - Missing database indexes: The authors section correctly asks for a unique index for the id. But, the document forgets to ask for a unique index for books.id and a normal index for books.authorId.
    - Slow database searches: The index for books.authorId is very important for speed. When you want to delete an author, the system needs to check if that author has any books. Without this index, the database will have to search through every single book one by one, which is very slow.

## Clarifications added for Version 2
- All errors in both books and authors must return JSON in the form { "error": "descriptive message" }.
- When creating or updating books (POST and PUT), the system must reject requests that have missing, wrong, or extra fields.
- The publicationDate must use the exact YYYY-MM-DD format and must be a real date.
- The id field in books needs a unique index. The authorId field in books also needs an index to make the author deletion check faster.
- Text inputs for books, like the title, must have extra spaces removed and cannot be empty strings.

# Books API Week 02 Spec - Version 2

## Global API Standards
To ensure consistency and security across the entire application, the following rules apply to all routes (both books and authors):

- Security & Secrets: All data validation must run before any database interaction. Database connection strings and passwords must remain in environment variables and must never be exposed in Swagger documentation or committed to version control (Git).
- Strict Validation: POST and PUT requests must strictly accept only documented fields. Any request containing missing, invalid, or extra/undocumented fields must be rejected with a 400 Bad Request.
- Standardized Errors: All error responses must return a JSON body in the exact format: { "error": "descriptive message" }.

## Feature 1: Book CRUD Operations and Author References

### Goal
Update the existing book API so book documents include a reference to an author, support all CRUD operations, and enforce strict data validation and database indexing. Every book route must be documented and testable in Swagger.

### Data Model
Book documents will be stored in the books collection.

- Required books fields:
    - id (String): Custom alphanumeric identifier (e.g., b1).
        - Constraints: Required, database-level unique (unique index), and immutable after creation.
    - authorId (String): References the id field of an author document.
        - Constraints: Required, must match an existing author. Must have a database index to ensure fast searches when verifying if an author can be deleted.
    - title (String): The title of the book.
        - Constraints: Required, non-empty, and sanitized (trimmed of leading/trailing whitespace).
    - publicationDate (String): The date the book was published.
        - Constraints: Required, must strictly follow the YYYY-MM-DD format, and must be validated as a real calendar date. 

### Relationship to Authors

Each book will identify its author with an authorId field. The API must reject any creation or update request with a 400 status code if the submitted authorId does not match an existing author in the database.

### Routes
#### GET/books
- Purpose: Return all books.

- Success:
200 OK and an array of book objects.
- Errors:
500 Internal Server Error for unexpected database errors.

##### GET-  /books/:id
- Purpose: Return one book by its custom id.

- Success: 
200 OK and the matching book object.

- Errors:
404 Not Found if no book exists with that id.
500 Internal Server Error for unexpected errors.

#### POST /books
- Purpose: Create a new book.

- Request body:

JSON
{
  "id": "b4",
  "authorId": "a1",
  "title": "Example Book Title",
  "publicationDate": "2026-01-15"
}
- Success: 201 Created and the newly created book object.

- Errors:
400 Bad Request for missing, invalid, or extra fields, or a malformed date.
400 Bad Request if the id already exists.
400 Bad Request if the authorId does not match an existing author.
500 Internal Server Error for unexpected errors.

#### PUT /books/:id
- Purpose: Update an existing book. The id in the URL is authoritative and cannot be modified.

- Request body: (Note: id is not allowed in the body)

JSON
{
  "authorId": "a2",
  "title": "Updated Book Title",
  "publicationDate": "2026-02-20"
}
- Success: 
200 OK and the updated book object.

- Errors:
400 Bad Request for missing, invalid, or extra fields (including if the user tries to send an id in the body).
400 Bad Request if the authorId does not match an existing author.
404 Not Found if no book exists with that id.
500 Internal Server Error for unexpected errors.

#### DELETE /books/:id
- Purpose: Delete an existing book.

- Success: 204 No Content with no response body.

- Errors:
404 Not Found if no book exists with that id.
500 Internal Server Error for unexpected errors.

## Feature 2: Author CRUD Operations and Referential Integrity
### Goal
Implement secure and fully documented CRUD operations for the authors collection. The system must enforce strict bidirectional referential integrity, preventing the deletion of any author whose id is still referenced by existing books.

#### Data Model
Target Collection: authors

- id (String): Custom alphanumeric identifier (e.g., a1).
    - Constraints: Required, database-level unique (unique index), and immutable after creation. Route parameters will strictly use this custom ID.

- authorName (String): The full name or pseudonym of the author.
    - Constraints: Required, non-empty, and sanitized (trimmed of leading/trailing whitespace).

- bornYear (Integer): The year the author was born.
    - Constraints: Required valid integer. It must not be a future year (e.g., must be <= 2026).

### Relationship to Books & Deletion Constraints
- Bidirectional link: A book identifies its author via the authorId field, which strictly references the author's custom id.

- Referential Integrity Guard: To prevent database corruption and "orphan books", an author cannot be deleted if they are linked to existing books.

- Deletion Block: Before executing a DELETE request, the API must query the books collection (which is fast due to the authorId index). If one or more books reference the target author's id, the API must immediately abort the deletion and return a 409 Conflict status code with the exact payload: { "error": "Author cannot be deleted while books reference it" }.

### Routes
#### GET /authors
- Purpose: Return all authors.

- Success: 
200 OK and an array of author objects.

- Errors: 
500 Internal Server Error for unexpected errors.

#### GET /authors/:id
- Purpose: Return one author by their custom id.

- Success: 
200 OK and the matching author object.

- Errors:
404 Not Found when no matching custom id exists.
500 Internal Server Error for unexpected errors.

- POST /authors
Purpose: Create a new author.

- Request Body:

JSON
{
  "id": "a3",
  "authorName": "Isabel Allende",
  "bornYear": 1942
}
- Success: 
201 Created and the newly created author object.

- Errors:
400 Bad Request for missing, invalid, or extra fields; duplicate id; or a future/non-integer bornYear.
500 Internal Server Error for unexpected errors.

#### PUT /authors/:id
- Purpose: Update an existing author. The URL id is authoritative.

- Request Body:

JSON
{
  "authorName": "Isabel Allende",
  "bornYear": 1942
}
- Success: 
200 OK and the updated author object.

- Errors:
400 Bad Request for missing, invalid, or extra fields.
404 Not Found when the author does not exist.
500 Internal Server Error for unexpected errors.

#### DELETE /authors/:id
- Purpose: Delete an existing author.

- Success: 
204 No Content with no response body.

- Errors:
409 Conflict (with { "error": "Author cannot be deleted while books reference it" }) when referenced books exist.
404 Not Found when the author does not exist.
500 Internal Server Error for unexpected errors.

### Swagger Documentation & Deployment Expectations
- Swagger: Swagger must document every book and author route, including the required fields, expected formats, and all possible error responses.

- Deployment: 
The API routes must work locally and from the deployed Render application. The deployed Swagger page at /api-docs must allow a user to test every route directly from the browser without exposing environment variables.