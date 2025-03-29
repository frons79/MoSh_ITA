import { rolltableConfig } from "./windows/settings-rolltables.js";

export const registerSettings = function () {
  
  game.settings.register('mosh', 'firstEdition', {
    name: "Regole 1e",
    hint: "Utilizzare le regole e la scheda del personaggio della prima edizione.",
    default: true,
    scope: 'world',
    type: Boolean,
    config: true,
    onChange: value => {
      //log the change
      console.log("firstEdition set to " + value)
      //get list of actors
      let actorList = game.actors;
      let actorName = '';
      let maxStart = null;
      let maxEnd = null;
      //only make changes if calm is false
      if (game.settings.get('mosh','useCalm') === false) {
        //if setting is now true
        if (value) {
          //loop through all actors and update their maximum stress
            //get list of actors
            let actorList = game.actors;
            //loop through each actor
            actorList.forEach(function(actor){ 
              //loop through each result
              if (actor.type === 'character') {
                //set character name
                actorName = actor.name;
                //set current values
                maxStart = actor.system.other.stress.max;
                //set max stress to 20
                actor.update({'system.other.stress.max': 20});
                //set final values
                actorList = game.actors;
                maxEnd = 20;
                //log change
                console.log(actorName + " stress.max changed from " + maxStart + " to " + maxEnd);
                //rerender this sheet
                actor.render();
              }
            });
        //if value is now false
        } else {
          //loop through all actors and update their maximum stress
            //get list of actors
            let actorList = game.actors;
            //loop through each actor
            actorList.forEach(function(actor){ 
              //loop through each result
              if (actor.type === 'character') {
                //set character name
                actorName = actor.name;
                //set current values
                maxStart = actor.system.other.stress.max;
                //set max stress to 999
                actor.update({'system.other.stress.max': 999});
                //set final values
                actorList = game.actors;
                maxEnd = 999;
                //log change
                console.log(actorName + " stress.max changed from " + maxStart + " to " + maxEnd);
                //rerender this sheet
                actor.render();
              }
            });
        }
      } else {
        //get list of actors
        let actorList = game.actors;
        //loop through each actor
        actorList.forEach(function(actor){ 
          //loop through each result
          if (actor.type === 'character') {
            //log change
            console.log("Prima edizione passata a " + value);
            //rerender this sheet
            actor.render();
          }
        });
      }
    }
  });

  game.settings.register('mosh', 'macroTarget', {
    name: "Obiettivo della macro",
    hint: "Chi dovrebbe essere l'obiettivo delle macro??",
    default: "character",
    scope: 'world',
    type: String,
    choices: {
      "character": "Personaggio attualmente selezionato per il giocatore",
      "token": "Pedina attualmente selezionata nella scena"
    },
    config: true,
    onChange: value => {
      //log the change
      console.log("Obiettivo macro impostato su " + value)
    }
  });

  game.settings.register('mosh', 'critDamage', {
    name: "Danni da colpo critico",
    hint: "Quale dovrebbe essere il danno in caso di colpo critico?",
    default: "advantage",
    scope: 'world',
    type: String,
    choices: {
      "advantage": "Tira con vantaggio",
      "doubleDamage": "Raddoppia il danno risultante",
      "doubleDice": "Raddoppia i dadi dei danni",
      "maxDamage": "Il massimo danno possibile",
      "weaponValue": "Fare riferimento al danno critico di ogni arma",
      "none": "Nessun danno critico"
    },
    config: true,
    onChange: value => {
      //log the change
      console.log("Colpi critici impostati su " + value)
    }
  });

  game.settings.register('mosh', 'damageDiceTheme', {
    name: "Damage Dice Theme",
    hint: "If DiceSoNice is installed, what theme should be applied to damage dice?",
    default: "damage",
    scope: 'world',
    type: String,
    config: true,
    onChange: value => {
      //log the change
      console.log("Il tema dei dadi dei danni è impostato su " + value)
    }
  });

  game.settings.register('mosh', 'panicDieTheme', {
    name: "Tema dei dadi di panico",
    hint: "Se è installato DiceSoNice, quale tema dovrebbe essere applicato ai dadi di panico??",
    default: "panic",
    scope: 'world',
    type: String,
    config: true,
    onChange: value => {
      //log the change
      console.log("Tema dei dadi di panico impostato su " + value)
    }
  });

  game.settings.register('mosh', 'hideWeight', {
    name: "Nascondi il peso (0e)",
    hint: "Nascondere la meccanica 0e del peso nell'elenco degli oggetti per giocatori e navi??",
    default: true,
    scope: 'world',
    type: Boolean,
    config: true,
    onChange: value => {
      //log the change
      console.log("hideWeight impostato su " + value)
    }
  });
  
  game.settings.register('mosh', 'useCalm', {
    name: "Utilzizare la Calma?",
    hint: "Utilizza il sistema traaa.sh Calm invece di Stress..",
    default: false,
    scope: 'world',
    type: Boolean,
    config: true,
    onChange: value => {
      //log the change
      console.log("useCalm impostato su " + value);
      //get list of actors
      let actorList = game.actors;
      let actorName = '';
      let minStart = null;
      let valueStart = null;
      let maxStart = null;
      let labelStart = '';
      let minEnd = null;
      let valueEnd = null;
      let maxEnd = null;
      let labelEnd = '';
      //if setting is now true
      if (value) {
        //loop through all actors and update their stress values
        actorList.forEach(function(actor){ 
          //loop through each result
          if (actor.type === 'character') {
            //set character name
            actorName = actor.name;
            //set current values
            minStart = actor.system.other.stress.min;
            valueStart = actor.system.other.stress.value;
            maxStart = actor.system.other.stress.max;
            labelStart = actor.system.other.stress.label;
            //convert min stress to max calm
            actor.update({'system.other.stress.max': Math.round(85-(actor.system.other.stress.min*3))});
            maxEnd = Math.round(85-(actor.system.other.stress.min*3));
            //set min stress to 0
            actor.update({'system.other.stress.min': 0});
            minEnd = 0;
            //convert stress to calm
            actor.update({'system.other.stress.value': Math.round(85-(actor.system.other.stress.value*3))});
            valueEnd = Math.round(85-(actor.system.other.stress.value*3));
            //set stress label to Calm
            actor.update({'system.other.stress.label': 'Calm'});
            labelEnd = 'Calm';
            //log change
            console.log(actorName + " stress.min changed from " + minStart + " to " + minEnd);
            console.log(actorName + " stress.value changed from " + valueStart + " to " + valueEnd);
            console.log(actorName + " stress.max changed from " + maxStart + " to " + maxEnd);
            console.log(actorName + " stress.label changed from " + labelStart + " to " + labelEnd);
            //rerender this sheet
            actor.render();
          }
        });
      //if value is now false
      } else {
        //loop through all actors and update their stress values
        actorList.forEach(function(actor){ 
          //loop through each result
          if (actor.type === 'character') {
            //set character name
            actorName = actor.name;
            //set current values
            minStart = actor.system.other.stress.min;
            valueStart = actor.system.other.stress.value;
            maxStart = actor.system.other.stress.max;
            labelStart = actor.system.other.stress.label;
            //convert maximum calm to min stress
              //set min stress to 20 if > 20
              if (Math.round((85-actor.system.other.stress.max)/3) > 20) {
                actor.update({'system.other.stress.min': 20});
                minEnd = 2;
              //set min stress to 2 if < 2
              } else if (Math.round((85-actor.system.other.stress.max)/3) < 2) {
                actor.update({'system.other.stress.min': 2});
                minEnd = 2;
              //regular value
              } else {
                actor.update({'system.other.stress.min': Math.round((85-actor.system.other.stress.max)/3)});
                minEnd = Math.round((85-actor.system.other.stress.max)/3);
              }
            //set max stress based on current system setting
            if (game.settings.get('mosh','firstEdition')) {
              //set max stress to 20
              actor.update({'system.other.stress.max': 20});
              maxEnd = 20;
            } else {
              //set max stress to 999
              actor.update({'system.other.stress.max': 999});
              maxEnd = 999;
            }
            //convert calm to stress
            actor.update({'system.other.stress.value': Math.round((85-actor.system.other.stress.value)/3)});
            valueEnd = Math.round((85-actor.system.other.stress.value)/3);
            //set stress label to Stress
            actor.update({'system.other.stress.label': 'Stress'});
            labelEnd = 'Stress'
            //log change
            console.log(actorName + " stress.min changed from " + minStart + " to " + minEnd);
            console.log(actorName + " stress.value changed from " + valueStart + " to " + valueEnd);
            console.log(actorName + " stress.max changed from " + maxStart + " to " + maxEnd);
            console.log(actorName + " stress.label changed from " + labelStart + " to " + labelEnd);
            //rerender this sheet
            actor.render();
          }
        });
      }

    }
  });

  game.settings.register('mosh', 'androidPanic', {
    name: "Utilizzare le tabelle di panico dell'Androide?",
    hint: "Aggiunge tabelle specifiche per l'Androide per le prove di Panico e Calma.",
    default: false,
    scope: 'world',
    type: Boolean,
    config: true,
    onChange: value => {
      //log the change
      console.log("androidPanic impostato su " + value)
    }
  });

  game.settings.register('mosh', 'autoStress', {
    name: "Aumento automatico dello stress in caso di fallimenti?",
    hint: "Gestisce automaticamente l'aumento di stress in caso di fallimento di un tiro.",
    default: true,
    scope: 'world',
    type: Boolean,
    config: true,
    onChange: value => {
      //log the change
      console.log("autoStress impostato su " + value)
    }
  });

  game.settings.registerMenu('mosh', 'rolltableSelector', {
    name: "Configurazione tabelle cliccabili",
    label: "Scegli le tabelle",
    hint: "Personalizza quali tabelle vengano utilizzate.",
    icon: "fa-solid fa-list",
    type: rolltableConfig
  });

  game.settings.register('mosh', 'table0ePanicStressNormal', {
    scope: 'world',
    config: false,
    type: String,
    default: "1vCm4ElRPotQXgNB"
  });

  game.settings.register('mosh', 'table0ePanicStressAndroid', {
    scope: 'world',
    config: false,
    type: String,
    default: "egJ11m2mJM3HBd6d"
  });

  game.settings.register('mosh', 'table0ePanicCalmNormal', {
    scope: 'world',
    config: false,
    type: String,
    default: "kqKpQAXyLTEEyz6Z"
  });

  game.settings.register('mosh', 'table0ePanicCalmAndroid', {
    scope: 'world',
    config: false,
    type: String,
    default: "VW6HQ29T7zClNIZ6"
  });

  game.settings.register('mosh', 'table1ePanicStressNormal', {
    scope: 'world',
    config: false,
    type: String,
    default: "ypcoikqHLhnc9tNs"
  });

  game.settings.register('mosh', 'table1ePanicStressAndroid', {
    scope: 'world',
    config: false,
    type: String,
    default: "aBnY19jlhPXzibCt"
  });

  game.settings.register('mosh', 'table1ePanicCalmNormal', {
    scope: 'world',
    config: false,
    type: String,
    default: "MOYI6Ntj5OVFYk06"
  });

  game.settings.register('mosh', 'table1ePanicCalmAndroid', {
    scope: 'world',
    config: false,
    type: String,
    default: "GCtYeCCQVQJ5M6SE"
  });

  game.settings.register('mosh', 'table1eWoundBluntForce', {
    scope: 'world',
    config: false,
    type: String,
    default: "31YibfjueXuZdNLb"
  });

  game.settings.register('mosh', 'table1eWoundBleeding', {
    scope: 'world',
    config: false,
    type: String,
    default: "ata3fRz3uoPfNCLh"
  });

  game.settings.register('mosh', 'table1eWoundGunshot', {
    scope: 'world',
    config: false,
    type: String,
    default: "XjDU2xFOWEasaZK0"
  });

  game.settings.register('mosh', 'table1eWoundFireExplosives', {
    scope: 'world',
    config: false,
    type: String,
    default: "lqiaWwh5cGcJhvnu"
  });

  game.settings.register('mosh', 'table1eWoundGoreMassive', {
    scope: 'world',
    config: false,
    type: String,
    default: "uVfC1CqYdojaJ7yR"
  });

  game.settings.register('mosh', 'table0eDeath', {
    scope: 'world',
    config: false,
    type: String,
    default: "cZOHlhEJcYGZsQBM"
  });

  game.settings.register('mosh', 'table1eDeath', {
    scope: 'world',
    config: false,
    type: String,
    default: "W36WFIpCfMknKgHy"
  });

  game.settings.register('mosh', 'table1eDistressSignal', {
    scope: 'world',
    config: false,
    type: String,
    default: "UxAjAqUTjYTcCbS8"
  });

  game.settings.register('mosh', 'table1eMegadamageEffects', {
    scope: 'world',
    config: false,
    type: String,
    default: "AqGWwoWXzijFs427"
  });

  game.settings.register('mosh', 'table1eMaintenance', {
    scope: 'world',
    config: false,
    type: String,
    default: "kqz8GsFVPfjvqO0N"
  });

  game.settings.register('mosh', 'table1eBankruptcy', {
    scope: 'world',
    config: false,
    type: String,
    default: "BsfdIl7CJNs1PViS"
  });

};
