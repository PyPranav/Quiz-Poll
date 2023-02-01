const express = require("express");
const { superUser } = require("./models");
const jwt = require("jsonwebtoken");
const port = 3000;
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, async () => {
	console.log(`app listening on port ${port}`);
});

app.post("/login", async (req, res, next) => {
	let { name, password } = req.body;

	let existingUser;
	try {
		existingUser = await superUser.findOne({ name: name });
	} catch {
		const error = new Error("Error! Something went wrong.");
		return next(error);
	}
	console.log(existingUser);
	if (
		!existingUser ||
		!bcrypt.compareSync(password, existingUser.hash_password)
	) {
		const error = Error("Wrong details please check at once");
		return next(error);
	}
	let token;
	try {
		//Creating jwt token
		token = jwt.sign(
			{ userId: existingUser.id, name: existingUser.name },
			"secretkeyappearshere",
			{ expiresIn: "1h" }
		);
	} catch (err) {
		console.log(err);
		const error = new Error("Error! Something went wrong.");
		return next(error);
	}

	res.status(200).json({
		success: true,
		data: {
			userId: existingUser.id,
			name: existingUser.name,
			token: token,
		},
	});
});

app.post("/signup", async (req, res, next) => {
	const { name, password } = req.body;
	bcrypt.hash(password, 8).then(async (hashedPassword) => {
		console.log(hashedPassword);
		const newUser = superUser({
			name: name,
			hash_password: hashedPassword,
		});

		try {
			await newUser.save();
		} catch {
			const error = new Error("Error! Something went wrong.");
			return next(error);
		}
		let token;
		try {
			token = jwt.sign(
				{ userId: newUser.id, name: newUser.name },
				"secretkeyappearshere",
				{ expiresIn: "1h" }
			);
		} catch (err) {
			const error = new Error("Error! Something went wrong.");
			return next(error);
		}
		res.status(201).json({
			success: true,
			data: { userId: newUser.id, name: newUser.name, token: token },
		});
	});
});
