const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const protect = require('../middleware/authMiddleware');

// POST /api/items — Add item
router.post('/', protect, async (req, res) => {
  try {
    const item = await Item.create({ ...req.body, postedBy: req.user.id });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Error adding item', error: err.message });
  }
});

// GET /api/items — All items
router.get('/', protect, async (req, res) => {
  try {
    const items = await Item.find().populate('postedBy', 'name email').sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching items' });
  }
});

// GET /api/items/search?name=xyz
router.get('/search', protect, async (req, res) => {
  try {
    const { name } = req.query;
    const items = await Item.find({
      $or: [
        { itemName: { $regex: name, $options: 'i' } },
        { type: { $regex: name, $options: 'i' } }
      ]
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Search error' });
  }
});

// GET /api/items/:id — Single item
router.get('/:id', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

// PUT /api/items/:id — Update item
router.put('/:id', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.postedBy.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

    const updated = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Update error' });
  }
});

// DELETE /api/items/:id — Delete item
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.postedBy.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Delete error' });
  }
});

module.exports = router;