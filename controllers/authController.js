const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const createToken = (user) => {
	return jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN || "1d",
	});
};

const setAuthCookie = (res, token) => {
	const cookieOptions = {
		httpOnly: true,
		path: "/",
		sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
		secure: process.env.NODE_ENV === "production",
		maxAge: 24 * 60 * 60 * 1000,
	};

	if (process.env.NODE_ENV === "production" && process.env.COOKIE_DOMAIN) {
		cookieOptions.domain = process.env.COOKIE_DOMAIN;
	}

	res.cookie("token", token, cookieOptions);
};

exports.login = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			res.status(400);
			throw new Error("Email and password are required");
		}
		const user = await User.findOne({ email: email.toLowerCase().trim() }).lean();
		if (!user || user.role === "admin") {
			res.status(401);
			throw new Error("Invalid credentials");
		}
		const passwordMatched = await bcrypt.compare(password, user.password);
		if (!passwordMatched) {
			res.status(401);
			throw new Error("Invalid credentials");
		}
		const token = createToken(user);

		setAuthCookie(res, token);

		res.json({ success: true, data: { email: user.email, name: user.name, role: user.role } });
	} catch (error) {
		next(error);
	}
};

exports.adminLogin = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			res.status(400);
			throw new Error("Email and password are required");
		}

		const user = await User.findOne({ email: email.toLowerCase().trim() }).lean();
		if (!user || user.role !== "admin") {
			res.status(401);
			throw new Error("Invalid admin credentials");
		}

		const passwordMatched = await bcrypt.compare(password, user.password);
		if (!passwordMatched) {
			res.status(401);
			throw new Error("Invalid admin credentials");
		}

		const token = createToken(user);
		setAuthCookie(res, token);

		res.json({ success: true, data: { email: user.email, name: user.name, role: user.role } });
	} catch (error) {
		next(error);
	}
};

exports.register = async (req, res, next) => {
	try {
		const { name, email, password } = req.body;
		if (!name?.trim() || !email?.trim() || !password?.trim()) {
			res.status(400);
			throw new Error("Name, email, and password are required");
		}

		const existingUser = await User.findOne({ email: email.toLowerCase().trim() }).lean();
		if (existingUser) {
			res.status(409);
			throw new Error("Email is already registered");
		}

		const hashedPassword = await bcrypt.hash(password.trim(), 10);
		const user = await User.create({
			name: name.trim(),
			email: email.toLowerCase().trim(),
			password: hashedPassword,
			role: "applicant",
		});

		res.status(201).json({
			success: true,
			data: { id: user._id, name: user.name, email: user.email, role: user.role },
		});
	} catch (error) {
		next(error);
	}
};

exports.changePassword = async (req, res, next) => {
	try {
		const { email, newPassword, confirmPassword } = req.body;
		if (!email?.trim() || !newPassword?.trim() || !confirmPassword?.trim()) {
			res.status(400);
			throw new Error("Email, new password, and confirm password are required");
		}

		if (newPassword.trim() !== confirmPassword.trim()) {
			res.status(400);
			throw new Error("Passwords do not match");
		}

		if (newPassword.trim().length < 8) {
			res.status(400);
			throw new Error("Password must be at least 8 characters");
		}

		const user = await User.findOne({ email: email.toLowerCase().trim() });
		if (!user) {
			res.status(404);
			throw new Error("User not found");
		}

		const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);
		user.password = hashedPassword;
		await user.save();

		res.json({ success: true, message: "Password updated successfully" });
	} catch (error) {
		next(error);
	}
};

exports.logout = (req, res, next) => {
	try {
		res.clearCookie("token", {
			path: "/",
			sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
			secure: process.env.NODE_ENV === "production",
		});
		res.json({ success: true, message: "Logged out successfully" });
	} catch (error) {
		next(error);
	}
};

exports.getCurrentUser = async (req, res, next) => {
	try {
		if (!req.user) {
			res.status(401);
			throw new Error("Unauthorized");
		}
		res.json({
			success: true,
			data: {
				id: req.user._id,
				email: req.user.email,
				name: req.user.name,
				role: req.user.role,
			},
		});
	} catch (error) {
		next(error);
	}
};
