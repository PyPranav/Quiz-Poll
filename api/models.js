"use strict";
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const { mongoPassword, mongoUsername } = require("./mongoCreds");
const bcrypt = require("bcrypt");

const main = async () => {
	await mongoose.connect(
		`mongodb+srv://${mongoUsername}:${mongoPassword}@cluster0.0laq7ns.mongodb.net/?retryWrites=true&w=majority`
	);
};
main().catch((err) => console.log(err));
const superUserSchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true,
		required: true,
		unique: true,
	},
	hash_password: {
		type: String,
	},
	created: {
		type: Date,
		default: Date.now,
	},
});
superUserSchema.methods.comparePassword = function (password) {
	return bcrypt.compareSync(password, this.hash_password);
};
const superUser = mongoose.model("superUser", superUserSchema);
module.exports = { superUser };
