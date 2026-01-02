const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();
const axios = require("axios"); // For async-await (Tasks 10-13)

// ----------------------------
// TASK 6: Register new user
// ----------------------------
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered" });
});

// ----------------------------
// TASK 10: Get all books using Async/Await
// ----------------------------
public_users.get("/", async (req, res) => {
  try {
    const allBooks = await new Promise((resolve, reject) => {
      resolve(books);
    });
    res.status(200).send(JSON.stringify(allBooks, null, 4));
  } catch (err) {
    res.status(500).json({ message: "Error retrieving books", error: err });
  }
});

// ----------------------------
// TASK 11: Get book details by ISBN using Async/Await
// ----------------------------
public_users.get("/isbn/:isbn", async (req, res) => {
  const isbn = req.params.isbn;

  try {
    const book = await new Promise((resolve, reject) => {
      if (books[isbn]) resolve(books[isbn]);
      else reject("Book not found");
    });

    res.status(200).json(book);
  } catch (err) {
    res.status(404).json({ message: err });
  }
});

// ----------------------------
// TASK 12: Get book details by Author (case-insensitive) using Async/Await
// ----------------------------
public_users.get("/author/:author", async (req, res) => {
  const author = req.params.author.toLowerCase();

  try {
    const result = await new Promise((resolve, reject) => {
      let filtered = [];
      Object.keys(books).forEach((key) => {
        if (books[key].author.toLowerCase() === author) filtered.push(books[key]);
      });

      if (filtered.length > 0) resolve(filtered);
      else reject("No books found for this author");
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ message: err });
  }
});

// ----------------------------
// TASK 13: Get book details by Title (case-insensitive) using Async/Await
// ----------------------------
public_users.get("/title/:title", async (req, res) => {
  const title = req.params.title.toLowerCase();

  try {
    const result = await new Promise((resolve, reject) => {
      let filtered = [];
      Object.keys(books).forEach((key) => {
        if (books[key].title.toLowerCase() === title) filtered.push(books[key]);
      });

      if (filtered.length > 0) resolve(filtered);
      else reject("No books found with this title");
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ message: err });
  }
});

// ----------------------------
// TASK 5: Get book review based on ISBN
// ----------------------------
public_users.get("/review/:isbn", async (req, res) => {
  const isbn = req.params.isbn;

  try {
    const reviews = await new Promise((resolve, reject) => {
      if (books[isbn] && books[isbn].reviews) resolve(books[isbn].reviews);
      else reject("No reviews found for this book.");
    });

    res.status(200).json(reviews);
  } catch (err) {
    res.status(404).json({ message: err });
  }
});

module.exports.general = public_users;
