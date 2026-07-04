const Referrer = require('../models/Referrer');

exports.createReferrer = async (req, res, next) => {
  try {
    const name = req.body.name?.trim();
    if (!name) {
      res.status(400);
      throw new Error('Referrer name is required');
    }

    const existing = await Referrer.findOne({ user: req.user._id, name }).lean();
    if (existing) {
      res.status(409);
      throw new Error('Referrer already exists');
    }

    const referrer = await Referrer.create({ user: req.user._id, name });
    res.status(201).json({ success: true, data: referrer });
  } catch (error) {
    next(error);
  }
};

exports.getReferrers = async (req, res, next) => {
  try {
    const referrers = await Referrer.find({ user: req.user._id }).sort({ name: 1 }).lean();
    res.json({ success: true, data: referrers });
  } catch (error) {
    next(error);
  }
};

exports.updateReferrer = async (req, res, next) => {
  try {
    const name = req.body.name?.trim();
    if (!name) {
      res.status(400);
      throw new Error('Referrer name is required');
    }

    const referrer = await Referrer.findOne({ _id: req.params.id, user: req.user._id });
    if (!referrer) {
      res.status(404);
      throw new Error('Referrer not found');
    }

    const duplicate = await Referrer.findOne({ user: req.user._id, name, _id: { $ne: referrer._id } }).lean();
    if (duplicate) {
      res.status(409);
      throw new Error('Referrer already exists');
    }

    referrer.name = name;
    await referrer.save();
    res.json({ success: true, data: referrer });
  } catch (error) {
    next(error);
  }
};

exports.deleteReferrer = async (req, res, next) => {
  try {
    const result = await Referrer.deleteOne({ _id: req.params.id, user: req.user._id });
    if (!result.deletedCount) {
      res.status(404);
      throw new Error('Referrer not found');
    }

    res.json({ success: true, message: 'Referrer deleted successfully' });
  } catch (error) {
    next(error);
  }
};
