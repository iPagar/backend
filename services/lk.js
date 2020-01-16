const rp = require("request-promise");

const pathSemesters = "https://lk.stankin.ru/webapi/api2/semesters/";
const pathMarks = "https://lk.stankin.ru/webapi/api2/marks/";

function getMarks(student, password, semester) {
	const options = {
		method: "POST",
		uri: pathMarks,
		headers: {
			"content-type": "application/x-www-form-urlencoded; charset=utf-8"
		},
		form: {
			student: student,
			password: password,
			semester: semester
		},
		json: true
	};

	if (student >= 999000 && student <= 999999)
		return new Promise((resolve, reject) => {
			resolve([
				{
					title: "Трансфигурация",
					num: "М1",
					value: Math.floor(Math.random() * (45 - 25)) + 25,
					factor: 3
				},
				{
					title: "Трансфигурация",
					num: "М2",
					value: Math.floor(Math.random() * (45 - 25)) + 25,
					factor: 3
				},
				{
					title: "Трансфигурация",
					num: "Э",
					value: Math.floor(Math.random() * (45 - 25)) + 25,
					factor: 3
				}
			]);
		});
	else
		return rp(options).then(marks =>
			marks.filter(
				mark =>
					mark.title !== "Рейтинг" &&
					mark.title !== "Накопленный Рейтинг"
			)
		);
}

function getSemesters(student, password) {
	const options = {
		method: "POST",
		uri: pathSemesters,
		form: {
			student: student,
			password: password
		},
		json: true
	};

	if (student >= 999000 && student <= 999999)
		return new Promise((resolve, reject) => {
			resolve(["2019-осень"]);
		});
	else return rp(options).then(response => response.semesters);
}

function getStudent(student, password) {
	const options = {
		method: "POST",
		uri: pathSemesters,
		form: {
			student: student,
			password: password
		},
		json: true
	};

	if (student >= 999000 && student <= 999999)
		return new Promise((resolve, reject) => {
			resolve({
				surname: "Тест",
				initials: "Тест",
				stgroup: `Тест-${Math.floor(Math.random() * (15 - 10)) + 10}`
			});
		});
	else
		return rp(options).then(response => ({
			stgroup: response.stgroup,
			surname: response.surname,
			initials: response.initials
		}));
}

module.exports = { getStudent, getSemesters, getMarks };
