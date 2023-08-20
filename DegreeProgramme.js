class DegreeProgramme{

	constructor(lessonsUrl, curriculum){
		this.lessonsUrl = lessonsUrl.split("?")[0]; //remove query string

		this.curriculum = curriculum;
		if(this.curriculum === "" && lessonsUrl.includes("curricula")) //priority to curriculum passed
			this.curriculum = lessonsUrl.split("curricula=")[1].split("&")[0];

		//check if info are correct
		try{
			this.getLessonsOfYear_(1);
		}
		catch(e){
			throw new Error("Informazioni DegreeProgramme non corrette");
		}
		this.skipLessons = () => false;
	}

	/**
	 * Creates a new Course object.
	 *
	 * @param {String} name name of the course (es. "Analisi matematica T-1")
	 * @param {Number} year year of the course (es. 1)
	 * @param {String[]} [modules=["*"]] array of the modules of the course (es. ["Modulo 1", "L-Z"]) or ["*"] for all modules
	 * @return {Course} course object
	 */
	getCourse(name, year, modules=["*"]){
		return new Course(this, name, modules, year);
	}

	/**
	 * Returns a JSON array of all lessons of a year of the degree programme
	 *
	 * @param {Number} year year of the course (es. 1)
	 * @return {JSON[]} array of courses
	 */
	getLessonsOfYear_(year){
		const url = this.lessonsUrl+"/@@orario_reale_json?curricula="+this.curriculum+"&anno="+year;
		return JSON.parse(UrlFetchApp.fetch(url).getContentText());
	}

	/**
	 * Returns an array of all courses of a year of the degree programme
	 *
	 * @param {Number} year year of the course (es. 1)
	 * @return {Course[]} array of courses
	 */
	getCoursesOfYear_(year){
		const lessons = this.getLessonsOfYear_(year);
		const courses = lessons.map(lesson => lesson.title);
		return [...new Set(courses)].map(course => this.getCourse(course, year)); 
	}


	/**
	 * Insert all lessons of the passed year into the passed calendar, or update it, and send a report to the passed mail
	 * (Each module will be treated as a different course)
	 *
	 * @param {Number} year year of the course (es. 1)
	 * @param {Calendar} calendar calendar object where to insert the lessons
	 * @param {String} mail mail where to send the report
	 */
	createAllLessonsOfYear(year, calendar, mail){
		this.getCoursesOfYear_(year).forEach(course => course.setSkipLessons(this.skipLessons).createLessons(calendar, mail));
	}

	/**
	 * Set the expression to skip lessons for all courses
	 *
	 * @param {Function} expression function that takes a lesson and returns true if the lesson has to be skipped
	 * @return {DegreeProgramme} object itself
	 */
	setSkipLessons(expression){
		this.skipLessons = expression;
		return this;
	}

	/**
	 * Delete all future lessons of the year from the passed calendar
	 *
	 * @param {Number} year year of the course (es. 1)
	 * @param {Calendar} calendar calendar object where to delete the lessons
	 */
	deleteAllFutureLessonsOfYear(year, calendar){
		this.getCoursesOfYear_(year).forEach(course => course.deleteAllFutureLessons(calendar));
	}

}