class Lesson{

	constructor(course, title, start, end, location, description){
		this.course = course;
		this.title = title;
		this.start = start;
		this.end = end;
		this.location = location;
		this.description = description;
	}

	/**
	 * To string
	 *
	 * @return {String} String representation of the lesson
	 */
	toString(){
		return this.title+"<br>"+ (this.location ? this.location+"<br>" : "") + "Start: "+this.start+"<br>End: "+this.end+"<br>"+this.description.replaceAll("\n", "<br>");
	}

	/**
	 * Compare two lessons
	 *
	 * @param {Lesson} that Lesson to compare
	 * @param {Boolean} deep If true, also compare location, description and end date
	 * @return {Boolean} True if the lessons are equal, false otherwise
	 */
	equals(that, deep){
		const deepChecks = this.end.valueOf() === that.end.valueOf() && this.description === that.description && this.location === that.location;
		return this.title === that.title && this.start.valueOf() === that.start.valueOf() && (deep ? deepChecks : true);
	}
}

class CalendarLesson extends Lesson{

	constructor(course, calendarEvent){
		super(course, calendarEvent.getTitle(), calendarEvent.getStartTime(), calendarEvent.getEndTime(), calendarEvent.getLocation(), calendarEvent.getDescription());
		this.calendarEvent = calendarEvent;
	}

	/**
	 * Delete the lesson from the calendar
	 *
	 */
	delete(){
		this.calendarEvent.deleteEvent();
	}
}

class WebLesson extends Lesson{

	constructor(course, lesson){
		super(course, lesson.title, new Date(lesson.start), new Date(lesson.end), "", "");
		this.createLocationAndDescription(lesson);
	}

	/**
	 * Create the lesson in the calendar
	 *
	 * @param {calendar} calendar calendar object where to create the lesson
	 */
	create(calendar){
		calendar.createEvent(this.title, this.start, this.end, {location: this.location, description: this.description});
	}

	/**
	 * Update the lesson in the calendar
	 *
	 * @param {calendar} calendar calendar object where to update the lesson
	 * @param {CalendarLesson} calendarLesson calendar lesson to update
	 */
	update(calendar, calendarLesson){
		calendarLesson.delete();
		this.create(calendar);
	}

	/**
	 * Create location and description of the lesson
	 *
	 * @param {JSON[]} event JSON rappresentation of the lesson
	 */
	createLocationAndDescription(event){
		//location
		this.location = "";
		if(event.aule.length > 0){
			let locations = event.aule.map(aula => aula.des_indirizzo);
			locations = [...new Set(locations)]; //remove duplicates
			if(locations.length === 1) //not set if not unique
				this.location = locations[0];
		}

		//description
		this.description = "";
		if(event.docente) //in some cases it's null (e.g. multiple rooms)
			this.description += "DOCENTE: "+event.docente+"\n\n";
		this.description += "CFU: "+event.cfu+"\n\n";
		if(event.note !== "")
			this.description += "NOTE:\n"+event.note+"\n\n";

		if(event.teledidattica)
			this.description += "La lezione si svolge solo ONLINE";
		else if(event.aule.length > 0){
			event.aule.forEach(aula => {
				this.description += "AULA: "+aula.des_edificio+" - "+aula.des_piano;
				if(this.location === "")
					this.description += "\n("+aula.des_indirizzo+")"; //if location is not unique, add address
				this.description += "\n\nINFORMAZIONI:\nCapienza: "+aula.raw.capienzaEffettiva;
				
				//services
				if(aula.raw.serviziAula){ //if defined
					const ignoredServices = ["Proiettore", "Lavagna", "Wifi", "Audio"];
					aula.raw.serviziAula
										.map(servizio => servizio.descrizioneBreve)
										.filter(servizio => !ignoredServices.includes(servizio))
										.forEach(servizio => {
											this.description += "\n- "+servizio;
										});
				}

				this.description += "\n\n";
			});
		}
		else
			this.description += "Informazioni aula/online mancanti";

		//teams
		if(this.course.customTeamsLink !== "")
			this.description += "\n\nTEAMS:\n"+this.course.customTeamsLink;
		else if(event.teams !== null)
			this.description += "\n\nTEAMS:\n"+event.teams;

		this.description = this.description.trim();
		return this;
	}
}