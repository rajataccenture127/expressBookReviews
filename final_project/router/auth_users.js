const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");

const regd_users = express.Router();

// Users array
let users = [];

// Check if username exists
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// Check if username & password match
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// ----------------------------
// Task 7: Login
// ----------------------------
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Generate JWT token
  const token = jwt.sign({ username }, "secretkey", { expiresIn: "1h" });

  // Store JWT in session
  req.session.authorization = { accessToken: token };

  return res.status(200).json({ message: "User successfully logged in", token });
});

// ----------------------------
// Task 8: Add or Modify Book Review
// ----------------------------
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username; // from session middleware in index.js
  const review = req.query.review;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review content is required" });
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: `Review for book ${isbn} added/updated successfully`,
    reviews: books[isbn].reviews
  });
});

// ----------------------------
// Task 9: Delete Book Review
// ----------------------------
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "No review by this user to delete" });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: `Review for book ${isbn} deleted successfully`,
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
