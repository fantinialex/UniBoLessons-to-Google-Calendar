/**
 * Creates a new DegreeProgramme object
 *
 * @param {String} lessonsUrl url of the class schedule page of the degree programme (es. "https://corsi.unibo.it/laurea/IngegneriaInformatica/orario-lezioni")
 * @param {String} [curriculum=""] curriculum code of the degree programme
 * @return {DegreeProgramme} degree programme object
 */
function getDegreeProgramme(lessonsUrl, curriculum = ""){
	return new DegreeProgramme(lessonsUrl, curriculum);
}