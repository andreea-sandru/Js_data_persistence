'use strict';
const oracledb = require('oracledb');
const {
	getConnection
} = require('oracledb');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const user_name = 'SYSTEM'; //insert here you own username
const psswd = ''; //insert here you own password

async function acquire_connection() {
	try {
		const result = await oracledb.getConnection({
			user: user_name,
			password: psswd,
			connectString: process.env.LOCAL
		});
		return result;
	} catch(err) {
		console.error(err);
	}
}
// deletes an instance from the database
async function Delete(query, CNP) {
	let connection;
	try {
		connection = await acquire_connection();
		const result = await connection.execute(query, [CNP], );
		await commit(connection);
	} catch(err) {
		console.error(err);
	} finally {
		if(connection) {
			try {
				await connection.close();
			} catch(err) {
				console.error(err);
			}
		}
	}
}
// returns a list with all instances of a specified class
async function getAll(class_name, query) {
	let connection, persons = [],
		person;
	try {
		connection = await acquire_connection();
		const result = await connection.execute(query, [], );
		let res = result.rows;
		switch(class_name) {
			case 'Person':
				for(const r of res) {
					person = new Person(r.CNP, r.BIRTHDATE, r.NAME, r.GENDER);
					persons.push(person);
				}
				break;
			case 'Employee':
				for(const r of res) {
					person = new Employee(r.CNP, r.BIRTHDATE, r.NAME, r.GENDER, r.JOB);
					persons.push(person);
				}
				break;
			case 'Teacher':
				for(const r of res) {
					person = new Teacher(r.CNP, r.BIRTHDATE, r.NAME, r.GENDER, r.SUBJECT, r.SCHOOL);
					persons.push(person);
				}
				break;
			case 'DepartmentHead':
				for(const r of res) {
					person = new DepartmentHead(r.CNP, r.BIRTHDATE, r.NAME, r.GENDER, r.SUBJECT, r.SCHOOL, r.BONUS);
					persons.push(person);
				}
				break;
			case 'Administrator':
				for(const r of res) {
					person = new Administrator(r.CNP, r.BIRTHDATE, r.NAME, r.GENDER, r.INSTITUTION);
					persons.push(person);
				}
				break;
			case 'ProDean':
				for(const r of res) {
					person = new ProDean(r.CNP, r.BIRTHDATE, r.NAME, r.GENDER, r.COLLEGE);
					persons.push(person);
				}
				break;
			case 'Dean':
				for(const r of res) {
					person = new Dean(r.CNP, r.BIRTHDATE, r.NAME, r.GENDER, r.COLLEGE, r.SUBORDINATE);
					persons.push(person);
				}
				break;
			case 'Student':
				for(const r of res) {
					person = new Student(r.CNP, r.BIRTHDATE, r.NAME, r.GENDER, r.COLLEGE, r.GRADES);
					persons.push(person);
				}
				break;
		}
	} catch(err) {
		console.error(err);
	} finally {
		if(connection) {
			try {
				await connection.close();
				return persons;
			} catch(err) {
				console.error(err);
			}
		}
	}
}
// returns an instance corresponding to the given CNP
async function getByCNP(class_name, query, CNP) {
	let connection;
	let person;
	try {
		connection = await acquire_connection();
		const result = await connection.execute(query, [CNP], );
		let r = result.rows[0];
		switch(class_name) {
			case 'Person':
				person = new Person(r.CNP, r.BIRTHDATE, r.NAME, r.GENDER);
				break;
			case 'Employee':
				person = new Employee(r.CNP, r.BIRTHDATE, r.NAME, r.GENDER, r.JOB);
				break;
			case 'Teacher':
				person = new Teacher(r.CNP, r.BIRTHDATE, r.NAME, r.GENDER, r.SUBJECT, r.SCHOOL);
				break;
			case 'DepartmentHead':
				person = new DepartmentHead(r.CNP, r.BIRTHDATE, r.NAME, r.GENDER, r.SUBJECT, r.SCHOOL, r.BONUS);
				break;
			case 'Administrator':
				person = new Administrator(r.CNP, r.BIRTHDATE, r.NAME, r.GENDER, r.INSTITUTION);
				break;
			case 'ProDean':
				person = new ProDean(r.CNP, r.BIRTHDATE, r.NAME, r.GENDER, r.COLLEGE);
				break;
			case 'Dean':
				person = new Dean(r.CNP, r.BIRTHDATE, r.NAME, r.GENDER, r.COLLEGE, r.SUBORDINATE);
				break;
			case 'Student':
				person = new Student(r.CNP, r.BIRTHDATE, r.NAME, r.GENDER, r.COLLEGE, r.GRADES);
				break;
		}
	} catch(err) {
		console.error(err);
	} finally {
		if(connection) {
			try {
				await connection.close();
				return person;
			} catch(err) {
				console.error(err);
			}
		}
	}
}
async function commit(connection) {
	try {
		await connection.execute(`COMMIT`, [], );
	} catch(err) {
		console.error(err);
	}
}
async function modifyStudentGrades(count, CNP) {
	let connection;
	try {
		connection = await acquire_connection();
		await connection.execute(`UPDATE student SET 
      grades = grades + :count
      WHERE
      cnp = :CNP`, [count, CNP], );
		await commit(connection);
	} catch(err) {
		console.error(err);
	} finally {
		if(connection) {
			try {
				await connection.close();
			} catch(err) {
				console.error(err);
			}
		}
	}
}

function diff_years(dt2, dt1) {
	var diff = (dt2.getTime() - dt1.getTime()) / 1000;
	diff /= (60 * 60 * 24);
	return Math.abs(Math.round(diff / 365.25));
}
class Person {
	constructor(CNP = 'unknown', birthDate = Date.now(), name = 'unknown', gender = 'unknown') {
		this._birthDate = birthDate;
		this._name = name;
		this._gender = gender;
		this._CNP = CNP;
	}
	get birthDate() {
		return this._birthDate;
	}
	get name() {
		return this._name;
	}
	get gender() {
		return this._gender;
	}
	get CNP() {
		return this._CNP;
	}
	set birthDate(birthDate) {
		this._birthDate = birthDate;
	}
	set name(name) {
		this._name = name;
	}
	set gender(gender) {
		this._gender = gender;
	}
	set CNP(CNP) {
		this._CNP = CNP;
	}
	get age() {
		return diff_years(new Date(Date.now()), this._birthDate);
	}
	static async getAllPersons() {
		return await getAll('Person', `SELECT * FROM person`);
	}
	static async getPersonByCNP(CNP) {
		return await getByCNP('Person', `SELECT * FROM person WHERE CNP = :id`, CNP);
	}
}
class Employee extends Person {
	constructor(CNP = 'unknown', birthDate = Date.now(), name = 'unknown', gender = 'unknown', job = 'unknown') {
		super(CNP, birthDate, name, gender);
		this._job = job;
	}
	get job() {
		return this._job;
	}
	set job(job) {
		this._jon = job;
	}
	fire() {
		Delete('DELETE FROM employee WHERE CNP= :id', this._CNP)
	}
	static async getAllPersons() {
		return await getAll('Employee', `SELECT * FROM employee`);
	}
	static async getPersonByCNP(CNP) {
		return await getByCNP('Employee', `SELECT * FROM employee WHERE CNP = :id`, CNP);
	}
}
class Teacher extends Employee {
	constructor(CNP = 'unknown', birthDate = Date.now(), name = 'unknown', gender = 'unknown', subject = 'unknown', school = 'unknown') {
		super(CNP, birthDate, name, gender, 'teacher');
		this._subject = subject;
		this._school = school;
	}
	get subject() {
		return this._subject;
	}
	set subject(subject) {
		this._subject = subject;
	}
	get school() {
		return this._school;
	}
	set school(school) {
		this._school = school;
	}
	static async getAllPersons() {
		return await getAll('Teacher', `SELECT * FROM teacher`);
	}
	static async getPersonByCNP(CNP) {
		return await getByCNP('Teacher', `SELECT * FROM teacher WHERE CNP = :id`, CNP);
	}
	fire() {
		Delete('DELETE FROM teacher WHERE CNP= :id', this._CNP);
	}
}
class DepartmentHead extends Teacher {
	constructor(CNP = 'unknown', birthDate = Date.now(), name = 'unknown', gender = 'unknown', subject = 'unknown', school = 'unknown', bonus = 100) {
		super(CNP, birthDate, name, gender, subject, school);
		this._bonus = bonus;
	}
	get bonus() {
		return this._bonus;
	}
	set bonus(bonus) {
		this._bonus = bonus;
	}
	static async getAllPersons() {
		return await getAll('DepartmentHead', `SELECT * FROM departmenthead`);
	}
	static async getPersonByCNP(CNP) {
		return await getByCNP('DepartmentHead', `SELECT * FROM departmenthead WHERE CNP = :id`, CNP);
	}
	fire() {
		Delete('DELETE FROM departmentHead WHERE CNP= :id', this._CNP);
	}
}
class Administrator extends Employee {
	constructor(CNP = 'unknown', birthDate = Date.now(), name = 'unknown', gender = 'unknown', institution = 'unknown') {
		super(CNP, birthDate, name, gender, 'administrator');
		this._institution = institution;
	}
	get institution() {
		return this._institution;
	}
	set institution(institution) {
		this._institution = institution;
	}
	static async getAllPersons() {
		return await getAll('Administrator', `SELECT * FROM administrator`);
	}
	static async getPersonByCNP(CNP) {
		return await getByCNP('Administrator', `SELECT * FROM administrator WHERE CNP = :id`, CNP);
	}
	fire() {
		Delete('DELETE FROM administrator WHERE CNP= :id', this._CNP);
	}
}
class ProDean extends Employee {
	constructor(CNP = 'unknown', birthDate = Date.now(), name = 'unknown', gender = 'unknown', college = 'unknown') {
		super(CNP, birthDate, name, gender, 'prodean');
		this._college = college;
	}
	get college() {
		return this._college;
	}
	set college(college) {
		this._college = college;
	}
	static async getAllPersons() {
		return await getAll('ProDean', `SELECT * FROM prodean`);
	}
	static async getPersonByCNP(CNP) {
		return await getByCNP('ProDean', `SELECT * FROM prodean WHERE CNP = :id`, CNP);
	}
	fire() {
		Delete('DELETE FROM proDean WHERE CNP= :id', this._CNP);
	}
}
class Dean extends ProDean {
	constructor(CNP = 'unknown', birthDate = Date.now(), name = 'unknown', gender = 'unknown', college = 'unknown', subordinate = 'unknown') {
		super(CNP, birthDate, name, gender, college);
		this._subordinate = subordinate;
		this._job = 'dean';
	}
	get subordinate() {
		return this._subordinate;
	}
	set subordinate(subordinate) {
		this._subordinate = subordinate;
	}
	static async getAllPersons() {
		return await getAll('Dean', `SELECT * FROM dean`);
	}
	static async getPersonByCNP(CNP) {
		return await getByCNP('Dean', `SELECT * FROM dean WHERE CNP = :id`, CNP);
	}
	fire() {
		Delete('DELETE FROM dean WHERE CNP= :id', this._CNP);
	}
}
class Student extends Person {
	constructor(CNP = 'unknown', birthDate = Date.now(), name = 'unknown', gender = 'unknown', college = 'unknown', grades = 0) {
		super(CNP, birthDate, name, gender);
		this._grades = grades;
		this._college = college;
	}
	get grades() {
		return this._grades;
	}
	set grades(grades) {
		this._grades = grades;
	}
	get college() {
		return this._college;
	}
	set college(college) {
		this._college = college;
	}
	static async getAllPersons() {
		return await getAll('Student', `SELECT * FROM student`);
	}
	static async getPersonByCNP(CNP) {
		return await getByCNP('Student', `SELECT * FROM student WHERE CNP = :id`, CNP);
	}
	increaseGrades(count) {
		modifyStudentGrades(count, this.CNP);
	}
	decreaseGrades(count) {
		modifyStudentGrades(count * (-1), this.CNP);
	}
	dropOut() {
		Delete('DELETE FROM student WHERE CNP= :id', this._CNP);
	}
}


/*  ------------------ TESTING FUNCTIONS ----------------------*/
async function getAndDropOutStudent() {
	let p;
	try {
		p = await Student.getPersonByCNP('000011');
		console.log(p);
	} catch(e) {
		console.error("Failed to get student", e);
		return;
	}
	try {
		await p.dropOut();
		console.log("Dropout done!");
	} catch(e) {
		console.error("Failed to dropout", e);
	}
}
getAndDropOutStudent();
async function getAndFireEmployee() {
	let p;
	try {
		p = await Employee.getPersonByCNP('00006');
		console.log(p);
	} catch(e) {
		console.error("Failed to get employee", e);
		return;
	}
	try {
		await p.fire();
		console.log("Fired!");
	} catch(e) {
		console.error("Failed to fire", e);
	}
}
getAndFireEmployee();
async function getAllEmployees() {
	let p = [];
	try {
		p = await Employee.getAllPersons();
		console.log(p);
	} catch(e) {
		console.error("Failed to get employees", e);
		return;
	}
}
getAllEmployees();
async function DecreaseGrades() {
	let p;
	try {
		p = await Student.getPersonByCNP('000011');
		console.log(p);
	} catch(e) {
		console.error("Failed to get student", e);
		return;
	}
	try {
		await p.decreaseGrades(2);
		console.log("Grades modified!");
	} catch(e) {
		console.error("Failed to modify grades", e);
	}
}
DecreaseGrades();