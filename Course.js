class Course{

	constructor(degreeProgramme, name, modules, year){
		this.degreeProgramme = degreeProgramme;
		this.name = name;
		this.modules = modules;
		this.year = year;
		this.customTeamsLink = "";
		this.skipLessons = () => false;
	}

	/**
	 * Insert lessons into the passed calendar, or update it, and send a report to the passed mail
	 *
	 * @param {Calendar} calendar calendar object where to insert the lessons
	 * @param {String} mail mail where to send the report
	 */
	createLessons(calendar, mail){
		const report = new Report(this, mail);
		let leW;
		try{
			leW = this.getLessonsWeb_(true);
		}
		catch(e){
			report.connectionError(e);
			report.send();
			return;
		}
		const leC = this.getLessonsCalendar_(calendar);

		leW.forEach(lessonW => {
			const foundInCalendar = leC.filter(lessonC => lessonC.equals(lessonW, false));

			switch(foundInCalendar.length){ //check on found events number
				case 0:
					report.lessonAdd(lessonW);
					lessonW.create(calendar);
					break;
				case 1:
					if(!lessonW.equals(foundInCalendar[0], true)){
						report.lessonUpdate(foundInCalendar[0], lessonW);
						lessonW.update(calendar, foundInCalendar[0]);
					}
					break;
				default:
					report.lessonError(lessonW);
					break;
			}
		});

		leC
			.filter(lesson => !lesson.description.startsWith("Aggiunta manualmente")) //not manually added
			.filter(lesson => leW.filter(lessonW => lesson.equals(lessonW, false)).length === 0) //not found in website
			.forEach(lesson => {
				report.lessonDelete(lesson);
				lesson.delete();
			});

		report.send();
	}

	/**
	 * Set custom teams link for the course
	 *
	 * @param {String} link teams link
	 * @return {Course} object itself
	 */
	setCustomTeamsLink(link){
		this.customTeamsLink = link;
		return this;
	}

	/**
	 * Set the expression to skip lessons
	 *
	 * @param {Function} expression function that takes a lesson and returns true if the lesson has to be skipped
	 * @return {Course} object itself
	 */
	setSkipLessons(expression){
		this.skipLessons = expression;
		return this;
	}

	/**
	 * Delete all future lessons of the course from the passed calendar
	 *
	 * @param {Calendar} calendar calendar object where to delete the lessons
	 */
	deleteAllFutureLessons(calendar){
		const report = new Report(this, "");
		this.getLessonsCalendar_(calendar).forEach(lesson => {
			report.lessonDelete(lesson);
			lesson.delete();
		});
	}

	/**
	 * Return an array of extCodes of modules of the course
	 *
	 * @param {Boolean} log enable logging (ex. no lessons found), default true
	 * @return {String[]} Array of extCodes of modules of the course
	 */
	getExtCodes_(log = true){
		const url = this.degreeProgramme.lessonsUrl+"/@@orario_reale_json?curricula="+this.degreeProgramme.curriculum+"&anno="+this.year;

		let options = {}
		if(!log)
			options.muteHttpExceptions = true;

		const lessons = JSON.parse(UrlFetchApp.fetch(url, options).getContentText());
		const filteredLessons = lessons
									.filter(lesson => lesson.title.toUpperCase().startsWith(this.name.toUpperCase())) //filter by name
									.filter(lesson => this.modules.includes("*") || this.modules.some(module => lesson.title.toUpperCase().includes(module.toUpperCase()))) //filter by module
									.map(lesson => lesson.extCode); //get extCode
    	return [...new Set(filteredLessons)]; //remove duplicates
	}

	/**
	 * Return a JSON array of all future lessons from the course website
	 * (intended for utility purposes)
	 *
	 * @param {Boolean} log enable logging (ex. no lessons found), default true
	 * @return {JSON[]} JSON array of all future lessons from the course website
	 */
	getJsonLessonsWeb(log = true){
		const report = new Report(this, "");
		let url = this.degreeProgramme.lessonsUrl+"/@@orario_reale_json?curricula="+this.degreeProgramme.curriculum+"&anno="+this.year;
		const extCodes = this.getExtCodes_(log);
		if(extCodes.length === 0){
			if(log)
				report.noLessons();
			return [];
		}
		extCodes.forEach(extCode => url += "&insegnamenti="+extCode);

		let options = {}
		if(!log)
			options.muteHttpExceptions = true;

		return JSON.parse(UrlFetchApp.fetch(url, options).getContentText());
	}

	/**
	 * Return an array of filtered future lessons from the course website
	 *
	 * @param {Boolean} log enable logging (ex. no lessons found), default true
	 * @return {WebLesson[]} array of filtered future lessons from the course website
	 */
	getLessonsWeb_(log = true){
		return this.getJsonLessonsWeb(log)
				.filter(lesson => new Date(lesson.start).valueOf() >= new Date().setHours(0,0,0,0)) //filter future lessons
				.filter(lesson => !this.skipLessons(lesson)) //ignore lessons that match the skipLessons expression
				.map(lesson => new WebLesson(this, lesson));
	}

	/**
	 * Return an array of future lessons from the calendar
	 *
	 * @param {Calendar} calendar calendar object where to search the lessons
	 * @return {CalendarLesson[]} array of future lessons from the calendar
	 */
	getLessonsCalendar_(calendar){
		const start = new Date(new Date().setHours(0,0,0,0));
		const webLessons = this.getLessonsWeb_(false); //disable log -> no error if server is down
		let end;
		if(webLessons.length !== 0)
			end = new Date(new Date(webLessons[webLessons.length-1].end).valueOf() + 30*24*60*60*1000); //30 days after last lesson
		else
			end = new Date(new Date().setFullYear(start.getFullYear()+1)); //1 year after today
		const events = calendar.getEvents(start, end, {search: this.name}) //search maybe returns events with different name
								.filter(event => event.getTitle().toUpperCase().startsWith(this.name.toUpperCase())) //filter by name
								.filter(event => this.modules.includes("*") || this.modules.some(module => event.getTitle().toUpperCase().includes(module.toUpperCase()))) //filter by module;
		
		return events.map(event => new CalendarLesson(this, event));
	}

}