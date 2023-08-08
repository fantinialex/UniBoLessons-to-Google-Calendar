function main(){
  var calendar = CalendarApp.getCalendarsByName('Orario Università')[0];

  for(i=1;i<=3;i++){
    var orario = getOrario(i);
    console.log("Anno "+i);
    if(new Date(orario[0].start) > new Date(2020+i,08) && new Date(orario[0].start) < new Date(2021+i,08)){
      console.log("Procedo con anno "+i);
      fillCalendar(calendar, orario);
    }
  }

}

function fillCalendar(calendar, orario){
  var description;
  var luogo;
  var lessons;
  var crea;

  for(var i=0;i<orario.length;i++){
    crea = false;
    if((!orario[i].title.includes("L-Z") && !orario[i].title.includes("P-Z") && !eventSkip(orario[i])) && new Date(orario[i].start) >= new Date()){

      //console.log(orario[i].title+" del "+orario[i].start);

      //imposto evento
      description = "DOCENTE: "+orario[i].docente+"\n\nCFU: "+orario[i].cfu+"\n\n";

      //note
      if(orario[i].note!="")
        description += "NOTE:\n"+orario[i].note+"\n\n";

      //aula o teledidattica
      if(orario[i].teledidattica){
        description += "La lezione si svolge solo ONLINE";
        luogo = "";
      }
      else if(orario[i].aule.length > 0){
        for(var c=0; c< orario[i].aule.length; c++){
          luogo = orario[i].aule[c].des_indirizzo;
          description += "AULA: "+orario[i].aule[c].des_edificio+" - "+orario[i].aule[c].des_piano+"\n\nINFORMAZIONI:\nCapienza: "+orario[i].aule[c].raw.capienzaEffettiva;
          
          //controllo servizi
          var serviziAula = orario[i].aule[c].raw.serviziAula;
          for(var nServizio in serviziAula){
            var servizio = serviziAula[nServizio].descrizioneBreve;
            if(servizio != "Proiettore" && servizio != "Lavagna" && servizio != "Wifi" && servizio != "Audio")
              description += "\n- "+servizio;
          }
          if(c != orario[i].aule.length-1)
            description += "\n\n";
        }
      }
      else{
        description += "Informazioni aula/online mancanti"
      }

      //teams
      var linkTeams;
      switch(orario[i].title){
        case "Corso 1": 
          linkTeams = "[link personalizzato]";
          break;
        default:
          linkTeams = orario[i].teams;
          break;
      }
      if(linkTeams!=null)
        description += "\n\nTEAMS:\n"+linkTeams;

      //controllo se lezioni fra una e l'altra (elimino eventuali lezioni annullate)
      if(i>0){
        if(!orario[i-1].title.includes("L-Z") && !orario[i-1].title.includes("P-Z") && !eventSkip(orario[i-1]))
          lessons = calendar.getEvents(new Date(orario[i-1].end), new Date(orario[i].start))
        else
          lessons = calendar.getEvents(new Date(orario[i-2].end), new Date(orario[i].start))
        for(var c=0; c<lessons.length; c++){
          console.log("Eliminato "+lessons[c].getTitle()+" del "+lessons[c].getStartTime());
          lessons[c].deleteEvent();
        }
      }
      //controllo se esiste
      lessons = calendar.getEvents(new Date(orario[i].start), new Date(orario[i].end))
      if(lessons.length == 1){
        if(!(lessons[0].getTitle() == orario[i].title &&
            lessons[0].getStartTime().valueOf() == new Date(orario[i].start).valueOf() &&
            lessons[0].getEndTime().valueOf() == new Date(orario[i].end).valueOf() &&
            lessons[0].getDescription() == description)){
              lessons[0].deleteEvent();
              crea = true;
            }
      }
      else{
        for(var c=0; c<lessons.length;c++){
          lessons[c].deleteEvent();
        }
        crea = true;
      }
      if(crea)
        createLesson(calendar, orario[i].title, orario[i].start, orario[i].end, luogo, description);
    }
  }
}

function getOrario(anno) {
  var response = UrlFetchApp.fetch("https://corsi.unibo.it/laurea/IngegneriaInformatica/orario-lezioni/@@orario_reale_json?anno="+anno+"&curricula=")
  var json = response.getContentText();
  var data = JSON.parse(json);
  return data;
}

function createLesson(calendar, name, start, end, location, description){
  calendar.createEvent(name, new Date(start), new Date(end), {location: location, description: description});
  console.log("Creato "+name+" del "+start);
}

function eventSkip(event){
  /*if(event.title == "FONDAMENTI DI TELECOMUNICAZIONI T"
      && new Date(event.start).getDay() == 1
      && event.time == "17:00 - 19:00")
    return 1;
  else if(event.title == "ELETTROTECNICA T / (1) Modulo 1"
      && new Date(event.start).valueOf() == new Date(2023, 03-1, 28, 12,00).valueOf()
      && new Date(event.end).valueOf() == new Date(2023, 03-1, 28, 14,00).valueOf())
    return 1;
  else if(new Date(event.start).valueOf() >= new Date(2023, 5, 7).valueOf() && new Date(event.start).valueOf() <= new Date(2023, 5, 10).valueOf())
    return 1;
  else*/
    return 0;
}