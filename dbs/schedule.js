const { mongo } = require("./config.js");

const getTeachers = function(stgroup = "") {
	return mongo.then(async client => {
		const teachers = (await client
			.collection("lessons")
			.find(
				{ stgroup: { $regex: `${stgroup.trim()}`, $options: "i" } },
				{ projection: { teacher: 1, _id: 0 } }
			)
			.toArray())
			.map(teacher => teacher.teacher)
			.filter(teacher => teacher);

		return new Set(teachers);
	});
};

module.exports = { getTeachers };
