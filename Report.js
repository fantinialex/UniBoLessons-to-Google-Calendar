class Report{

	constructor(course, mail){
		this.course = course;
		this.mail = mail;
		this.report = "";
	}

	/**
	 * Reset the report
	 *
	 */
	reset(){
		this.report = "";
	}

	/**
	 * Report the addition of a lesson
	 *
	 * @param {Lesson} lesson lesson added
	 */
	lessonAdd(lesson){
		this.report += "<b>Aggiunta lezione:</b><br>"
		this.report += lesson.toString()+"<br><br>";
		console.log("Creata "+lesson.title+" del "+lesson.start);
	}

	/**
	 * Report the update of a lesson
	 *
	 * @param {Lesson} o old lesson
	 * @param {Lesson} n new lesson
	 */
	lessonUpdate(o, n){
		this.report += "<b>Aggiornata lezione:</b><br>"
		this.report += Report.highlightDifferences(o.toString(), n.toString())+"<br><br>";
		console.log("Aggiornata "+o.title+" del "+o.start);
	}

	/**
	 * Report the deletion of a lesson
	 *
	 * @param {Lesson} lesson lesson deleted
	 */
	lessonDelete(lesson){
		this.report += "<b>Cancellata lezione:</b><br>"
		this.report += lesson.toString()+"<br><br>";
		console.log("Eliminata "+lesson.title+" del "+lesson.start);
	}

	/**
	 * Report error of a lesson
	 *
	 * @param {Lesson} lesson lesson with error
	 */
	lessonError(lesson){
		this.report += "<b>ERRORE lezione:</b><br>"
		this.report += lesson.toString()+"<br><br>";
		console.log("Errore "+lesson.title+" del "+lesson.start);
	}

	/**
	 * Report connection error to the course website
	 *
	 * @param {Error} e error
	 */
	connectionError(e){
		this.report += "Non è stato possibile ottenere l'elenco delle lezioni dal sito del corso<br>";
		this.report += "Errore: "+e+"<br><br>";
		console.log("Errore di connessione");
		console.log(e);
	}

	/**
	 * Report no lessons found on the course website
	 *
	 */
	noLessons(){
		console.log("Non sono state trovate lezioni per "+this.course.name+", controllare i parametri passati");
	}

	/**
	 * Send the report via email
	 *
	 */
	send(){
		if(this.report != "" && this.mail != "")
			MailApp.sendEmail({
				to: this.mail,
				subject: "Report lezioni "+this.course.name,
				htmlBody: this.report
			});
		this.reset();
	}

	/**
	 * Highlight differences between two strings
	 *
	 * @param {String} o old string
	 * @param {String} n new string
	 * @return {String} html string with differences highlighted
	 */
	static highlightDifferences(o, n){
		let dmp = new diff_match_patch();
		const diffs = dmp.diff_main(o, n);
		dmp.diff_cleanupSemantic(diffs);

		//custom html for diffs: highlight diffs for lines
		let result = "";
		for(let i=0; i<diffs.length; i++){
			switch(diffs[i][0]){
				case 0:{
					const tmp = diffs[i][1].split("<br>");
					const from = i-1>=0 && !diffs[i-1][1].endsWith("<br>") ? 1 : 0;
					const to = i+1 < diffs.length && !diffs[i+1][1].startsWith("<br>") ? tmp.length-1 : tmp.length;
					for(let c=from; c<to; c++)
						result += tmp[c]+"<br>";
					}break;
				case -1:
				case 1:{
					const color = diffs[i][0] == -1 ? "#ffe6e6" : "#e6ffe6";
					result += "<span style='background-color:"+color+"'>";

					//find previous
					let previous = "";
					if(!diffs[i][1].startsWith("<br>")){
						for(let j=i-1; j>=0; j--)
							if(diffs[j][0] == 0){
								let tmp = diffs[j][1].split("<br>");
								previous = tmp[tmp.length-1];
								break;
							}
						result += previous;
					}

					//diff
					result += "<b>"+diffs[i][1]+"</b>";

					//find next
					let next = "";
					if(!diffs[i][1].endsWith("<br>")){
						for(let j=i+1; j<diffs.length; j++)
							if(diffs[j][0] == 0){
								next = diffs[j][1].split("<br>")[0];
								break;
							}
						result += next;
					}

					result += "</span>" + ((previous != "" || next != "") ? "<br>" : "");

					//if there is only one diff and it isn't a line change, report the whole line
					if(!((i-1>=0 && diffs[i-1][0]!=0) || (i+1<diffs.length && diffs[i+1][0]!=0)) && (previous != "" || next != "")){
						const color = diffs[i][0] == 1 ? "#ffe6e6" : "#e6ffe6";
						result += "<span style='background-color:"+color+"'>";
						result += previous;
						result += next;
						result += "</span><br>";
					}

					}break;
			}
		}
		return result;
	}

}