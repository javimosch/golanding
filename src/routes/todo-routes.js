// routes/todo-routes.js

const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const errorHandler = require('../utils/errorHandler');
const validate = require('../middlewares/validate');

// Get all todos
router.get('/', errorHandler(async (req, res) => {
  console.debug('Fetching all todos', 4, 'routes');
  const todos = await Todo.find();
  res.json(todos);
}));

// Create a new todo
router.post('/', validate(Todo.schema),errorHandler(async (req, res) => {
  const todo = new Todo({
    text: req.body.text,
  });

  const newTodo = await todo.save();
  res.status(201).json(newTodo);
}));

// Update a todo
router.put('/:id', validate(Todo.schema), errorHandler(async (req, res) => {
  const todo = await Todo.findById(req.params.id);
  if (!todo) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  todo.text = req.body.text;
  const updatedTodo = await todo.save();
  res.json(updatedTodo);
}));

// Delete a todo
router.delete('/:id', errorHandler(async (req, res) => {
  const todo = await Todo.findByIdAndDelete(req.params.id);
  if (!todo) {
    return res.status(404).json({ message: 'Todo not found' });
  }
  res.json({ message: 'Todo deleted' });
}));

module.exports = router;
