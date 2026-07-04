const Category = require('../models/Category');
const Applicant = require('../models/Applicant');

exports.createCategory = async (req, res, next) => {
  try {
    const name = req.body.name?.trim();
    if (!name) {
      res.status(400);
      throw new Error('Category name is required');
    }

    const existing = await Category.findOne({ user: req.user._id, name }).lean();
    if (existing) {
      res.status(409);
      throw new Error('Category already exists');
    }

    const category = await Category.create({ user: req.user._id, name });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ user: req.user._id }).sort({ name: 1 }).lean();
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const trimmedName = name?.trim();
    if (!trimmedName) {
      res.status(400);
      throw new Error('Category name is required');
    }

    const category = await Category.findOne({ _id: req.params.id, user: req.user._id });
    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }

    const duplicate = await Category.findOne({ user: req.user._id, name: trimmedName, _id: { $ne: category._id } }).lean();
    if (duplicate) {
      res.status(409);
      throw new Error('Category already exists');
    }

    category.name = trimmedName;
    await category.save();
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const linkedApplicant = await Applicant.exists({ category: req.params.id, user: req.user._id });
    if (linkedApplicant) {
      res.status(400);
      throw new Error('Cannot delete category in use by applicants');
    }

    const result = await Category.deleteOne({ _id: req.params.id, user: req.user._id });
    if (!result.deletedCount) {
      res.status(404);
      throw new Error('Category not found');
    }

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};
