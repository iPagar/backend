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
		json: true,
		timeout: 100
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
	else if (student === 11606522 && semester === "2020-осень") {
		return Promise.resolve([
			{
				factor: 3,
				title: "Теоретические основы ИИТ",
				num: "М1",
				value: 30
			},
			{ factor: 4, title: "Прикладная метрология", num: "М1", value: 35 },
			{
				factor: 3,
				title: "Компьютерные технологии в приборостроении",
				num: "М1",
				value: 50
			},
			{
				factor: 3.5,
				title: "Методы и средства измерений, испытаний и контроля",
				num: "М1",
				value: 36
			},
			{
				factor: 3,
				title: "Физическая и прикладная оптика",
				num: "М1",
				value: 0
			},
			{
				factor: 3,
				title: "Физическая и прикладная оптика",
				num: "М2",
				value: 25
			},
			{
				factor: 3,
				title: "Физическая и прикладная оптика",
				num: "З",
				value: 50
			},
			{
				factor: 4,
				title: "Технология разработки стандартов",
				num: "М1",
				value: 41
			},
			{
				factor: 4,
				title: "Технология разработки стандартов",
				num: "М2",
				value: 50
			},
			{
				factor: 4,
				title: "Технология разработки стандартов",
				num: "Э",
				value: 50
			},
			{ factor: 3, title: "Теоретические основы ИИТ", num: "М2", value: 50 },
			{ factor: 3, title: "Теоретические основы ИИТ", num: "Э", value: 50 },
			{ factor: 4, title: "Прикладная метрология", num: "М2", value: 50 },
			{ factor: 4, title: "Прикладная метрология", num: "Э", value: 50 },
			{
				factor: 3,
				title: "Компьютерные технологии в приборостроении",
				num: "М2",
				value: 52
			},
			{
				factor: 3,
				title: "Компьютерные технологии в приборостроении",
				num: "Э",
				value: 50
			},
			{
				factor: 3,
				title: "Системы экологического управления предприятием",
				num: "М1",
				value: 45
			},
			{
				factor: 3,
				title: "Системы экологического управления предприятием",
				num: "М2",
				value: 50
			},
			{
				factor: 3,
				title: "Системы экологического управления предприятием",
				num: "З",
				value: 50
			},
			{
				factor: 3.5,
				title: "Методы и средства измерений, испытаний и контроля",
				num: "М2",
				value: 50
			},
			{
				factor: 3.5,
				title: "Методы и средства измерений, испытаний и контроля",
				num: "К",
				value: 30
			},
			{
				factor: 3.5,
				title: "Методы и средства измерений, испытаний и контроля",
				num: "З",
				value: 50
			},
			{ factor: 3, title: "Правоведение", num: "М1", value: 30 },
			{ factor: 3, title: "Правоведение", num: "М2", value: 50 },
			{ factor: 3, title: "Правоведение", num: "З", value: 30 },
			{
				factor: 1,
				title:
					"Производственная практика, практика по получению профессиональных умений и опыта профессиональной деятельности",
				num: "З",
				value: 48
			}
		]);
	} else
		return rp(options).then(marks =>
			marks.filter(
				mark => mark.title !== "Рейтинг" && mark.title !== "Накопленный Рейтинг"
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
		json: true,
		timeout: 100
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
		json: true,
		timeout: 100
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
