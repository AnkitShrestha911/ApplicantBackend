const Applicant = require("../models/Applicant");
const Category = require("../models/Category");

exports.createApplicant = async (req, res, next) => {
	try {
		const { applicantName, applicantId, referrer, categoryId, typeId, phoneNumber } = req.body;

		// Validate required fields
		if (!applicantName?.trim() || !applicantId?.trim() || !categoryId || !typeId) {
			res.status(400);
			throw new Error("Applicant name, Applicant ID, Category, and Type are required");
		}

		// Validate applicantId
		if (!/^\d+$/.test(applicantId.trim())) {
			res.status(400);
			throw new Error("Applicant ID must contain only numeric characters");
		}

		// Validate category
		const category = await Category.findOne({
			_id: categoryId,
			user: req.user._id,
		}).lean();

		if (!category) {
			res.status(400);
			throw new Error("Selected category is invalid");
		}

		// Validate type
		const allowedTypes = ["New", "Add"];

		if (!allowedTypes.includes(typeId)) {
			res.status(400);
			throw new Error("Selected type is invalid");
		}

		// Rule 1: Category must be unique for the same applicant
		const categoryExists = await Applicant.exists({
			user: req.user._id,
			applicantId: applicantId.trim(),
			category: category._id,
		});

		if (categoryExists) {
			res.status(409);
			throw new Error("This category is already used for this applicant.");
		}
		// Rule 2: Only one New for the same applicant
		const hasNew = await Applicant.exists({
			user: req.user._id,
			applicantId: applicantId.trim(),
			type: "New",
		});

		if (typeId === "New" && hasNew) {
			res.status(409);
			throw new Error("Only one 'New' type is allowed for this applicant.");
		}
		// Rule 3: If Add already exists, New cannot be created
		const hasAdd = await Applicant.exists({
			user: req.user._id,
			applicantId: applicantId.trim(),
			type: "Add",
		});

		if (typeId === "New" && hasAdd) {
			res.status(409);
			throw new Error(
				"Cannot create a 'New' applicant because 'Add' records already exist for this applicant.",
			);
		}

		// Create applicant
		const applicant = await Applicant.create({
			user: req.user._id,
			applicantName: applicantName.trim(),
			applicantId: applicantId.trim(),
			referrer: referrer?.trim() || null,
			category: category._id,
			type: typeId,
			phoneNumber: phoneNumber?.trim() || null,
		});

		// Populate category before returning
		const populatedApplicant = await Applicant.findById(applicant._id).populate("category");

		res.status(201).json({
			success: true,
			data: populatedApplicant,
		});
	} catch (error) {
		next(error);
	}
};

exports.getApplicants = async (req, res, next) => {
	try {
		const { search, filter } = req.query;
		const query = { user: req.user._id };

		if (search) {
			const trimmedSearch = search.trim();
			query.$or = [
				{ applicantName: { $regex: trimmedSearch, $options: "i" } },
				{ applicantId: { $regex: trimmedSearch, $options: "i" } },
			];
		}

		if (filter) {
			const now = new Date();
			const filterDays = { today: 1, yesterday: 1, last7: 7, last30: 30 }[filter];
			if (filterDays) {
				const daysAgo = new Date(now);
				if (filter === "yesterday") {
					daysAgo.setDate(now.getDate() - 1);
					query.createdAt = {
						$gte: new Date(daysAgo.setHours(0, 0, 0, 0)),
						$lte: new Date(daysAgo.setHours(23, 59, 59, 999)),
					};
				} else {
					daysAgo.setDate(now.getDate() - filterDays + 1);
					query.createdAt = { $gte: new Date(daysAgo.setHours(0, 0, 0, 0)) };
				}
			}
		}

		const applicants = await Applicant.find(query)
			.sort({ createdAt: -1 })
			.populate("category")
			.lean();

		res.json({ success: true, data: applicants });
	} catch (error) {
		next(error);
	}
};

exports.updateApplicant = async (req, res, next) => {
	try {
		const applicant = await Applicant.findOne({ _id: req.params.id, user: req.user._id });
		if (!applicant) {
			res.status(404);
			throw new Error("Applicant not found");
		}

		const { applicantName, applicantId, referrer, categoryId, typeId, phoneNumber } = req.body;
		if (!applicantName?.trim() || !applicantId?.trim() || !categoryId || !typeId) {
			res.status(400);
			throw new Error("Applicant name, Applicant ID, Category, and Type are required");
		}

		// Validate applicantId is numeric
		if (!/^\d+$/.test(applicantId.trim())) {
			res.status(400);
			throw new Error("Applicant ID must contain only numeric characters");
		}

		const category = await Category.findOne({ _id: categoryId, user: req.user._id }).lean();
		if (!category) {
			res.status(400);
			throw new Error("Selected category is invalid");
		}

		const allowedTypes = ["New", "Add"];
		if (!typeId || !allowedTypes.includes(typeId)) {
			res.status(400);
			throw new Error("Selected type is invalid");
		}

		const conflictingCategory = await Applicant.findOne({
			user: req.user._id,
			category: category._id,
			_id: { $ne: applicant._id },
		}).lean();

		if (conflictingCategory) {
			res.status(409);
			throw new Error(
				"This category is already used for another applicant record for this account",
			);
		}

		applicant.applicantName = applicantName.trim();
		applicant.applicantId = applicantId.trim();
		applicant.referrer = referrer?.trim() || null;
		applicant.category = category._id;
		applicant.type = typeId; // store as string enum
		applicant.phoneNumber = phoneNumber?.trim() || null;

		await applicant.save();

		// Fetch with populated fields
		const populatedApplicant = await Applicant.findById(applicant._id).populate(
			"category type",
		);
		res.json({ success: true, data: populatedApplicant });
	} catch (error) {
		next(error);
	}
};

exports.deleteApplicant = async (req, res, next) => {
	try {
		const result = await Applicant.deleteOne({ _id: req.params.id, user: req.user._id });
		if (!result.deletedCount) {
			res.status(404);
			throw new Error("Applicant not found");
		}
		res.json({ success: true, message: "Applicant deleted successfully" });
	} catch (error) {
		next(error);
	}
};
