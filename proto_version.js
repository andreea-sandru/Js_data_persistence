'use strict';
const oracledb = require('oracledb');
const {
	getConnection
} = require('oracledb');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const user_name = 'SYSTEM'; //insert here yout own username
const psswd = ''; //insert here your own password

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
	console.log(class_name);
	let connection;
	let person;
	try {
		connection = await acquire_connection();
		const result = await connection.execute(query, [CNP], // bind value for :id
		);
		let r = result.rows[0];
		console.log(r);
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

function Person(CNP = 'unknown', birthDate = Date.now(), name = 'unknown', gender = 'unknown') {
	this._birthDate = birthDate;
	this._name = name;
	this._gender = gender;
	this._CNP = CNP;
}
Object.defineProperty(Person.prototype, 'birthDate', {
	get: function() {
		return this._birthDate;
	},
	set: function(birthDate) {
		this._birthDate = birthDate;
	}
})
Object.defineProperty(Person.prototype, 'name', {
	get: function() {
		return this._name;
	},
	set: function(name) {
		this._name = name;
	}
})
Object.defineProperty(Person.prototype, 'gender', {
	get: function() {
		return this._gender;
	},
	set: function(gender) {
		this._gender = gender;
	}
})
Object.defineProperty(Person.prototype, 'age', {
	get: function() {
		return diff_years(new Date(Date.now()), this._birthDate);
	}
})
Object.defineProperty(Person.prototype, 'CNP', {
	get: function() {
		return this._CNP;
	},
	set: function(CNP) {
		this._CNP = CNP;
	}
})
Person.prototype.constructor = Person;
Person.prototype.getAllPersons = async function() {
	return await getAll('Person', `SELECT * FROM person`);
};
Person.prototype.getPersonByCNP = async function(CNP) {
	return await getByCNP('Person', `SELECT * FROM person WHERE CNP = :id`, CNP);
}

function Employee(CNP = 'unknown', birthDate = Date.now(), name = 'unknown', gender = 'unknown', job = 'unknown') {
	Person.call(this, CNP, birthDate, name, gender);
	this._job = job;
}
Employee.prototype = Object.create(Person.prototype);
Employee.prototype.constructor = Employee;
Object.defineProperty(Employee.prototype, 'job', {
	get: function() {
		return this._job;
	},
	set: function(job) {
		this._job = job;
	}
})
Employee.prototype.fire = function() {
	Delete('DELETE FROM employee WHERE CNP= :id', this._CNP);
}
Employee.prototype.getAllPersons = async function() {
	return await getAll('Employee', `SELECT * FROM employee`);
}
Employee.prototype.getPersonByCNP = async function(CNP) {
	return await getByCNP('Employee', `SELECT * FROM employee WHERE CNP = :id`, CNP);
}

function Teacher(CNP = 'unknown', birthDate = Date.now(), name = 'unknown', gender = 'unknown', subject = 'unknown', school = 'unknown') {
	Employee.call(this, CNP, birthDate, name, gender, 'teacher');
	this._subject = subject;
	this._school = school;
}
Teacher.prototype = Object.create(Employee.prototype);
Teacher.prototype.constructor = Teacher;
Object.defineProperty(Teacher.prototype, 'school', {
	get: function() {
		return this._school;
	},
	set: function(school) {
		this._school = school;
	}
})
Object.defineProperty(Teacher.prototype, 'subject', {
	get: function() {
		return this._subject;
	},
	set: function(subject) {
		this._subject = subject;
	}
})
Teacher.prototype.fire = function() {
	Delete('DELETE FROM teacher WHERE CNP= :id', this._CNP);
}
Teacher.prototype.getAllPersons = async function() {
	return await getAll('Teacher', `SELECT * FROM teacher`);
}
Teacher.prototype.getPersonByCNP = async function(CNP) {
	return await getByCNP('Teacher', `SELECT * FROM teacher WHERE CNP = :id`, CNP);
}

function DepartmentHead(CNP = 'unknown', birthDate = Date.now(), name = 'unknown', gender = 'unknown', subject = 'unknown', school = 'unknown', bonus = 100) {
	Teacher.call(this, CNP, birthDate, name, gender, subject, school);
	this._bonus = bonus;
}
DepartmentHead.prototype = Object.create(Teacher.prototype);
DepartmentHead.prototype.constructor = DepartmentHead;
Object.defineProperty(DepartmentHead.prototype, 'bonus', {
	get: function() {
		return this._bonus;
	},
	set: function(bonus) {
		this._bonus = bonus;
	}
})
DepartmentHead.prototype.fire = function() {
	Delete('DELETE FROM departmentHead WHERE CNP= :id', this._CNP);
}
DepartmentHead.getAllPersons = async function() {
	return await getAll('DepartmentHead', `SELECT * FROM departmenthead`);
}
DepartmentHead.getPersonByCNP = async function(CNP) {
	return await getByCNP('DepartmentHead', `SELECT * FROM departmenthead WHERE CNP = :id`, CNP);
}

function Administrator(CNP = 'unknown', birthDate = Date.now(), name = 'unknown', gender = 'unknown', institution = 'unknown') {
	Employee.call(this, CNP, birthDate, name, gender, 'administrator');
	this._institution = institution;
}
Administrator.prototype = Object.create(Employee.prototype);
Administrator.prototype.constructor = Administrator;
Object.defineProperty(Administrator.prototype, 'institution', {
	get: function() {
		return this._institution;
	},
	set: function(institution) {
		this._institution = this.institution;
	}
})
Administrator.prototype.fire = function() {
	Delete('DELETE FROM administrator WHERE CNP= :id', this._CNP);
}
Administrator.prototype.getAllPersons = async function() {
	return await getAll('Administrator', `SELECT * FROM administrator`);
}
Administrator.prototype.getPersonByCNP = async function(CNP) {
	return await getByCNP('Administrator', `SELECT * FROM administrator WHERE CNP = :id`, CNP);
}

function ProDean(CNP = 'unknown', birthDate = Date.now(), name = 'unknown', gender = 'unknown', college = 'unknown') {
	Employee.call(this, CNP, birthDate, name, gender, 'prodean');
	this._college = college;
}
ProDean.prototype = Object.create(Employee.prototype);
ProDean.prototype.constructor = Administrator;
Object.defineProperty(ProDean.prototype, 'college', {
	get: function() {
		return this._college;
	},
	set: function(college) {
		this._college = this.college;
	}
})
ProDean.prototype.fire = function() {
	Delete('DELETE FROM proDean WHERE CNP= :id', this._CNP);
}
ProDean.prototype.getAllPersons = async function() {
	return await getAll('ProDean', `SELECT * FROM prodean`);
}
ProDean.prototype.getPersonByCNP = async function(CNP) {
		return await getByCNP('ProDean', `SELECT * FROM prodean WHERE CNP = :id`, CNP);
}
	
function Dean(CNP = 'unknown', birthDate = Date.now(), name = 'unknown', gender = 'unknown', college = 'unknown', subordinate = 'unknown') {
	ProDean.call(this, CNP, birthDate, name, gender, college);
	this._subordinate = subordinate;
	this._job = 'dean';
}
Dean.prototype = Object.create(ProDean.prototype);
Dean.prototype.constructor = Dean;
Object.defineProperty(Dean.prototype, 'subordinate', {
	get: function() {
		return this._subordinate;
	},
	set: function(subordinate) {
		this._subordinate = this.subordinate;
	}
})
Dean.prototype.fire = function() {
	Delete('DELETE FROM dean WHERE CNP= :id', this._CNP);
}
Dean.prototype.getAllPersons = async function() {
	return await getAll('Dean', `SELECT * FROM dean`);
}
Dean.prototype.getPersonByCNP = async function(CNP) {
	return await getByCNP('Dean', `SELECT * FROM dean WHERE CNP = :id`, CNP);
}

function Student(CNP = 'unknown', birthDate = Date.now(), name = 'unknown', gender = 'unknown', college = 'unknown', grades = 0) {
	Person.call(this, CNP, birthDate, name, gender);
	this._grades = grades;
	this._college = college;
}
Student.prototype = Object.create(Person.prototype);
Student.prototype.constructor = Student;
Object.defineProperty(Student.prototype, 'grades', {
	get: function() {
		return this._grades;
	},
	set: function(grades) {
		this._grades = grades;
	}
})
Object.defineProperty(Student.prototype, 'college', {
	get: function() {
		return this._college;
	},
	set: function(college) {
		this._college = this.college;
	}
})
Student.prototype.getAllPersons = async function() {
	return await getAll('Student', `SELECT * FROM student`);
}
Student.prototype.getPersonByCNP = async function(CNP) {
	return await getByCNP('Student', `SELECT * FROM student WHERE CNP = :id`, CNP);
}
Student.prototype.increaseGrades = async function(count) {
	modifyStudentGrades(count, this.CNP);
}
Student.prototype.decreaseGrades = async function(count) {
	modifyStudentGrades(count * (-1), this.CNP);
}
Student.prototype.dropOut = async function() {
		Delete('DELETE FROM student WHERE CNP= :id', this._CNP);
}


/*  ------------------ TESTING FUNCTIONS ----------------------*/

async function getAndDropOutStudent() {
	let p;
	try {
		p = await Student.prototype.getPersonByCNP('00008');
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
		p = await Employee.prototype.getPersonByCNP('00006');
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
		p = await Employee.prototype.getAllPersons();
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
		p = await Student.prototype.getPersonByCNP('000011');
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