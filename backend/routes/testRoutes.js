const express = require('express');
const router = express.Router();

// in-memory array just for practice — not a real database yet
let items = [];

// GET all items
router.get('/', (req, res) => {
  res.json(items);
});

// POST a new item
router.post('/', (req, res) => {
  const newItem = { id: Date.now(), name: req.body.name };
  items.push(newItem);
  res.status(201).json(newItem);
});

// PUT update an item by id
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const item = items.find(i => i.id === id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  item.name = req.body.name;
  res.json(item);
});

// DELETE an item by id
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  items = items.filter(i => i.id !== id);
  res.json({ message: 'Deleted' });
});

module.exports = router;