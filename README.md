# UniBo Lessons to Google Calendar
A library for Google Script to easily insert UniBo's class schedule into your own calendar.

Main functions
- Inserting (and updating) lessons on the calendar
- Email notification of any changes
- Ability to disregard some lessons (ex. that reserved for L-Z)
- Ability to select only certain courses in a curriculum
- Ability to automatically enter all courses of a year

## Table of contents
- [How to use the library](#how-to-use-the-library)
- [Example code](#example-code)
- [Available methods](#available-methods)
- [Do you want to contribute?](#do-you-want-to-contribute)
- [External resources](#external-resources)

## How to use the library
1. [Create a standalone project](https://developers.google.com/apps-script/guides/projects#create_a_project_from) on [Google Script](https://script.google.com/)
2. Add the following Script ID as [library](https://developers.google.com/apps-script/guides/libraries#add_a_library_to_your_script_project) ```1dcQpP0FJc6SehdmgbkJHKGJHXG3YiMUkkxZmZTEnaqMsOcV4Gnz28Kqy```
3. Write your own code, following the examples below
4. Optionally, set the triggers to run the script automatically

## Example code
```UniBoLessons``` is the identifier of the library
> If your degree programme has different curricula, please see [Avaible method](#avaiblemethods) > getDegreeProgramme

**Insert a single course**
```js
function checkLessons(){
	const calendar = CalendarApp.getCalendarsByName('University Lessons')[0];
	const mail = "my.mail@example.com";

	const dp = UniBoLessons.getDegreeProgramme("https://corsi.unibo.it/laurea/IngegneriaInformatica/orario-lezioni");
	const course = dp.getCourse("Analisi matematica T-1", 1);
	course.createLessons(calendar, mail);
}
```
**Select a module of a single course**
```js
function checkLessons(){
	const calendar = CalendarApp.getCalendarsByName('University Lessons')[0];
	const mail = "my.mail@example.com";

	const dp = UniBoLessons.getDegreeProgramme("https://corsi.unibo.it/laurea/IngegneriaInformatica/orario-lezioni");
	const course = dp.getCourse("Fondamenti di informatica T-1", 1, ["Modulo 2"]);
	course.createLessons(calendar, mail);
}
```
**Skip some lessons of a single course**

Ex. skips all classes reserved for L-Zs and all classes after Dec. 20
```js
function checkLessons(){
	const calendar = CalendarApp.getCalendarsByName('University Lessons')[0];
	const mail = "my.mail@example.com";

	const dp = UniBoLessons.getDegreeProgramme("https://corsi.unibo.it/laurea/IngegneriaInformatica/orario-lezioni");
	const course = dp.getCourse("Fondamenti di informatica T-1", 1, ["Modulo 2"]);

	course.setSkipLessons(skipLessons);
	course.createLessons(calendar, mail);
}

function skipLessons(event){
	return event.title.includes("L-Z") || new Date(event.start).valueOf() >= new Date(2023, 11, 20);
}
```
**Insert all lessons of a year**
```js
function checkLessons(){
	const calendar = CalendarApp.getCalendarsByName('University Lessons')[0];
	const mail = "my.mail@example.com";

	const dp = UniBoLessons.getDegreeProgramme("https://corsi.unibo.it/laurea/IngegneriaInformatica/orario-lezioni");
	dp.createAllLessonsOfYear(1, calendar, mail);
}
```
**Skip some lessons of a year**

Ex. skips all classes reserved for L-Zs and all classes after Dec. 20
```js
function checkLessons(){
	const calendar = CalendarApp.getCalendarsByName('University Lessons')[0];
	const mail = "my.mail@example.com";

	const dp = UniBoLessons.getDegreeProgramme("https://corsi.unibo.it/laurea/IngegneriaInformatica/orario-lezioni");
	dp.setSkipLessons(skipLessons);
	dp.createAllLessonsOfYear(1, calendar, mail);
}

function skipLessons(event){
	return event.title.includes("L-Z") || new Date(event.start).valueOf() >= new Date(2023, 11, 20);
}
```

## Available methods
**Main**
- **getDegreeProgramme(lessonsUrl, curriculum)**

	Creates a new DegreeProgramme object.

	| Parameter | Type | Required | Default | Description |
	| --- | --- | --- | --- | --- |
	| lessonsUrl | String | Yes | | Link to the class schedule page on the course website (ex. https://corsi.unibo.it/laurea/IngegneriaInformatica/orario-lezioni) |
	| curriculum | String | Optional | "" | Curriculum code, if the course of study has multiple curricula. <br>N.B.: Not curriculum name |

	If the past information does not allow lessons from the course site, an exception will be thrown.

	Examples:
	- Course without different curricula
		```js
		const dp = UniBoLessons.getDegreeProgramme("https://corsi.unibo.it/laurea/IngegneriaInformatica/orario-lezioni");
		```
	- Course with different curricula
		```js
		const dp = UniBoLessons.getDegreeProgramme("https://corsi.unibo.it/laurea/IngegneriaAutomazione/orario-lezioni", "C50-000");
		```
		or
		```js
		const dp = UniBoLessons.getDegreeProgramme("https://corsi.unibo.it/laurea/IngegneriaAutomazione/orario-lezioni?anno=1&curricula=C50-000");
		```
		In this second case, the "anno" information is ignored
	> **Don't know how to find to the curriculum code?**
	Open the class schedule page on the course website, copy the link and pass it as a subject...it will contain the code and the library will automatically find it

**DegreeProgramme**
- **getCourse**

	Creates a new Course object

	| Parameter | Type | Required | Default | Description |
	| --- | --- | --- | --- | --- |
	| name | String | Yes | | Name of the course (es. "Analisi matematica T-1") |
	| year | int | Yes | | Year of the course (es. 1)
	| modules | String[] | Optional | ["*"] | 	Array of the modules of the course (es. ["Modulo 1", "L-Z"]) or ["*"] for all modules
	> <code>name</code> is compared with the beginning of the course name on the course site
	It is compared with the beginning of the course name on the course site.
	Ex. For *FONDAMENTALI DI INFORMATICA T-1 / (A-K) / (1) MODULO 1* simply pass *FONDAMENTALI DI INFORMATICA T-1*

- **createAllLessonsOfYear**

	Insert all lessons of the passed year into the passed calendar, or update it, and send a report to the passed mail
	
	(Each module will be treated as a different course, so each module will send a separate report)

	| Parameter | Type | Required | Default | Description |
	| --- | --- | --- | --- | --- |
	| year | int | Yes | | Year of the course (es. 1) |
	| calendar | Calendar | Yes | | Calendar object where to insert the lessons |
	| mail | String | Yes | | Mail where to send the report |

- **setSkipLessons**

	Set the expression to skip lessons for all courses

	| Parameter | Type | Required | Default | Description |
	| --- | --- | --- | --- | --- |
	| expression | Function | Yes | | Function that takes a lesson and returns true if the lesson has to be skipped |

	The function will be passed the json representation of the lesson as a single parameter. To find out the structure of the json you can use the *getJsonLessonsWeb* method of a course to get an array with all the lessons of the course.

- **deleteAllFutureLessonsOfYear**
	Delete all future lessons of the year from the passed calendar

	| Parameter | Type | Required | Default | Description |
	| --- | --- | --- | --- | --- |
	| year | int | Yes | | Year of the course (es. 1) |
	| calendar | Calendar | Yes | | Calendar object where to delete the lessons

**Course**
- **createLessons**

	Insert lessons into the passed calendar, or update it, and send a report to the passed mail

	| Parameter | Type | Required | Default | Description |
	| --- | --- | --- | --- | --- |
	| calendar | Calendar | Yes | | Calendar object where to insert the lessons |
	| mail | String | Yes | | Mail where to send the report |

	If no lessons are found on the course site, a console information is printed but program execution continues.
	
	In eleminating lessons not on the course site, those whose description begins with "Aggiunta manualmente" are ignored. You can then use this wording to manually enter any additional lessons

- **setCustomTeamsLink**

	Set custom teams link for the course

	| Parameter | Type | Required | Default | Description |
	| --- | --- | --- | --- | --- |
	| link | String | Yes | | Teams link |

- **setSkipLessons**

	Set the expression to skip lessons

	| Parameter | Type | Required | Default | Description |
	| --- | --- | --- | --- | --- |
	| expression | Function | Yes | | Function that takes a lesson and returns true if the lesson has to be skipped

	The function will be passed the json representation of the lesson as a single parameter. To find out the structure of the json you can use the *getJsonLessonsWeb* method to get an array with all the lessons of the course.

- **deleteAllFutureLessons**

	Delete all future lessons of the course from the passed calendar

	| Parameter | Type | Required | Default | Description |
	| --- | --- | --- | --- | --- |
	| calendar | Calendar | Yes | | Calendar object where to delete the lessons

- **getJsonLessonsWeb**

	Return a JSON array of all future lessons from the course website (intended for utility purposes).

	| Parameter | Type | Required | Default | Description |
	| --- | --- | --- | --- | --- |
	| log | Boolean | Optional | True | Enable logging (ex. no lessons found)

## Do you want to contribute?
The code is open source so everyone can use it, improve it and customize it as they wish.
If you want to propose changes you can open an Issue and start a discussion (if you prefer, you can also write in Italian), if you are a developer you can also propose your own implementation.
Not sure where to start? Here's a short list of additions to consider
- add the ability to customize the color of a course
- add the ability to customize the location and description template
- add the ability to customize the name of the lessons
- etc.

## External resources
This library makes use of the following projects 
- https://github.com/google/diff-match-patch 