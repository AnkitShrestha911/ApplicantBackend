const Type = require('../models/Type');
const Applicant = require('../models/Applicant');

exports.createType = async (req, res, next) => {
  try {
    const name = req.body.name?.trim();
    if (!name) {
      res.status(400);
      throw new Error('Type name is required');
    }

    const existing = await Type.findOne({ user: req.user._id, name }).lean();
    if (existing) {
      res.status(409);
      throw new Error('Type already exists');
    }

    const type = await Type.create({ user: req.user._id, name });
    res.status(201).json({ success: true, data: type });
  } catch (error) {
    next(error);
  }
};

exports.getTypes = async (req, res, next) => {
  try {
    const types = await Type.find({ user: req.user._id }).sort({ name: 1 }).lean();
    res.json({ success: true, data: types });
  } catch (error) {
    next(error);
  }
};

exports.updateType = async (req, res, next) => {
  try {
    const name = req.body.name?.trim();
    if (!name) {
      res.status(400);
      throw new Error('Type name is required');
    }

    const type = await Type.findOne({ _id: req.params.id, user: req.user._id });
    if (!type) {
      res.status(404);
      throw new Error('Type not found');
    }

    const duplicate = await Type.findOne({ user: req.user._id, name, _id: { $ne: type._id } }).lean();
    if (duplicate) {
      res.status(409);
      throw new Error('Type already exists');
    }

    type.name = name;
    await type.save();
    res.json({ success: true, data: type });
  } catch (error) {
    next(error);
  }
};

exports.deleteType = async (req, res, next) => {
  try {
    const linkedApplicant = await Applicant.exists({ type: req.params.id, user: req.user._id });
    if (linkedApplicant) {
      res.status(400);
      throw new Error('Cannot delete type in use by applicants');
    }

    const result = await Type.deleteOne({ _id: req.params.id, user: req.user._id });
    if (!result.deletedCount) {
      res.status(404);
      throw new Error('Type not found');
    }

    res.json({ success: true, message: 'Type deleted successfully' });
  } catch (error) {
    next(error);
  }
};
