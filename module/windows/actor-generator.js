export class DLActorGenerator extends FormApplication {
   static get defaultOptions() {
      const options = super.defaultOptions;
      options.id = 'sheet-modifiers';
      options.classes = ["mosh", "sheet", "actor", "character"];
      options.template = 'systems/mosh/templates/dialogs/actor-generator-dialog.html';
      options.width = 800;
      options.dragDrop = [{ dragSelector: null, dropSelector: ".dropitem" }];
      return options;
   }

   /* -------------------------------------------- */
   /**
    * Add the Entity name into the window title
    * @type {String}
    */
   get title() {
      return `${this.object.name}: ${game.i18n.localize("Mosh.CharacterGenerator.name")}`;
   }
   /* -------------------------------------------- */

   /**
    * Construct and return the data object used to render the HTML template for this form application.
    * @return {Object}
    */
   async getData() {
      //if (this.object.system.class.uuid != null){
      //   this.updateClass(this.object.system.class.uuid);
      //}
      let data = this.object;

      data.system.class = [];
      data.system.class.value = "";
      data.system.class.skills = [];
      data.system.class.skills.uuid = [];
      return data;
   }
   /* -------------------------------------------- */

   async rollDices(dices, html, id, chatmsg = "") {

      if (html.find(`img[id="${id}"]`).prop('hidden') == false) {
         let roll = await new Roll(dices).roll();
         if (chatmsg != "") {
            await roll.toMessage({ flavor: chatmsg });
         }
         //console.log(id + "->" + roll.total)
         html.find(`img[id="${id}"]`).prop('hidden', true);
         html.find(`input[id="${id}"]`).prop('hidden', false);
         html.find(`input[id="${id}"]`).prop('value', roll.total);
      }
   }


   /* todo: remove this functions and set the values as configuration */
   async rollStrength(html) {
      this.rollDices("2d10+25", html, `system.stats.strength.value`, `Rolling for Strength stat`)
   }

   async rollSpeed(html) {
      this.rollDices("2d10+25", html, `system.stats.speed.value`, `Rolling for Speed stat`)
   }
   async rollIntellect(html) {
      this.rollDices("2d10+25", html, `system.stats.intellect.value`, `Rolling for Intellect stat`)
   }
   async rollCombat(html) {
      this.rollDices("2d10+25", html, `system.stats.combat.value`, `Rolling for Combat stat`)
   }
   async rollHealth(html) {
      this.rollDices("1d10+10", html, `system.health.max`, `Rolling for Health`)
   }
   async rollSanity(html) {
      this.rollDices("2d10+10", html, `system.stats.sanity.value`, `Rolling for Sanity save`)
   }
   async rollFear(html) {
      this.rollDices("2d10+10", html, `system.stats.fear.value`, `Rolling for Fear save`)
   }
   async rollBody(html) {
      this.rollDices("2d10+10", html, `system.stats.body.value`, `Rolling for Body save`)
   }
   async rollCredits(html) {
      this.rollDices("2d10*10", html, `system.credits.value`, `Rolling for Credits`)
   }

   async rollTable(html, id, tableId, type = "input") {

      if (html.find(`img[id="` + id + `.value"]`).prop('hidden') == false && html.find(`img[id="system.class.value"]`).prop('value') != "") {

         let table = await fromUuid(tableId);
         let tableResult = await table.draw({ displayChat: true });

         let tableRoll = tableResult.results[0].range[0];

         let resultText = "";
         let resultUuid = [];
         for (var i = 0; i < tableResult.results.length; i++) {
            if (tableResult.results[i].type == "pack") {
               if (type == "ul") {
                  this._element.find(`ul[id="${id}.text"]`).append(`<li>${tableResult.results[i].text}</li>`);
               } else {
                  resultText += tableResult.results[i].text + "; ";
               }
               resultUuid.push(tableResult.results[i].documentId);
            } else if (tableResult.results[i].type == "text") {
               let tableTextmatch = tableResult.results[i].text.match(/(.*)(@UUID.*)/i);
               if (type == "ul") {
                  this._element.find(`ul[id="${id}.text"]`).append(`<li>${await TextEditor.enrichHTML(tableTextmatch[2].replace(/(\<br\s\/>)+/i, ""), { async: true })}</li>`);
               }
               else {
                  resultText += tableTextmatch[1].replace(/(\<br\s\/>)+/i, "");
               }
               /**we need to keep only the id of the item, not the complete uuid string (for now) */
               resultUuid.push(tableTextmatch[2].replace(/(])+(.*)/i, "").replace(/(.*)(\.)/i, ""));
            }
         }

         html.find(`img[id="` + id + `.value"]`).prop('hidden', true);
         html.find(`input[id="` + id + `.value"]`).prop('hidden', false);
         html.find(`input[id="` + id + `.value"]`).prop('value', tableRoll);
         html.find(`input[id="` + id + `.text"]`).prop('hidden', false);
         html.find(`input[id="` + id + `.text"]`).prop('value', resultText);
         html.find(`input[id="` + id + `.uuid"]`).prop('value', resultUuid);

      }

   }


   async rollPatch(html) {
      if (this.patchTable == null) {
         ui.notifications.error("You need a class with defined patch table.");//TODO, localize
      }
      await this.rollTable(html, "system.class.patch", this.patchTable);

   }
   async rollTrinket(html) {
      if (this.trinketTable == null) {
         ui.notifications.error("You need a class with defined trinket table.");//TODO, localize
      }
      await this.rollTable(html, "system.class.trinket", this.trinketTable);

   }
   async rollLoadout(html) {
      if (this.loadoutTable == null) {
         ui.notifications.error("You need a class with defined loadout table.");//TODO, localize
         return;
      }
      await this.rollTable(html, "system.class.loadout", this.loadoutTable, "ul");

   }

   async rollEverything(html) {
      await this.rollStrength(html);
      await this.rollSpeed(html);
      await this.rollIntellect(html);
      await this.rollCombat(html);
      await this.rollHealth(html);
      await this.rollFear(html);
      await this.rollSanity(html);
      await this.rollBody(html);
      await this.rollCredits(html);
      await this.rollPatch(html);
      await this.rollTrinket(html);
      await this.rollLoadout(html);
   }

   async fixedSkillOptionPopup(html, skillPopupOptions) {
      return new Promise((resolve) => {
         let buttons_options = {};
         for (let j = 0; j < skillPopupOptions.length; j++) {
            buttons_options[j] = {
               icon: '<i class="fas fa-check"></i>',
               label: skillPopupOptions[j].name,
               callback: () => resolve(skillPopupOptions[j].uuid),
            };
         }
         let d = new Dialog({
            title: game.i18n.localize("Mosh.CharacterGenerator.StatOptionPopupTitle"),
            content: `<p>${game.i18n.localize("Mosh.CharacterGenerator.StatOptionPopupText")}</p>`,
            buttons: buttons_options,
            default: "1",
            //render: html => console.log("Register interactivity in the rendered dialog"),
            //close: html => console.log("This always is logged no matter which option is chosen")
         });
         d.render(true);
      });
   }

   async updateSkillHtmlUl(html, skillsUuid) {
      //html.find(`ul[id="system.class.skils.text"]`).empty();
      let new_skills =  await html.find(`input[id="system.class.skills.uuid"]`).prop("value").split(",").filter(Boolean);
      for (let i = 0; i < skillsUuid.length; i++) {
         let skill = null;
         if(Array.isArray(skillsUuid[i])){
            //we have skill options, display popup to choose
            let options = [];
            for (let j = 0; j < skillsUuid[i].length; j++) {
               let skill = await fromUuid(skillsUuid[i][j]);
               options.push({"name":skill.name,"uuid":skill.uuid});
            }
            let skill_uuid = await this.fixedSkillOptionPopup(html,options);
            skill = await fromUuid(skill_uuid);

         }else{         
            //fixed skill, just add it to the list
            skill = await fromUuid(skillsUuid[i]);
         }
         new_skills.push(skill.uuid);
         /**we need to keep only the Uuid of the item, not the complete string (for now) */
         let li_html = `<li><img src="${skill.img}" title="${skill.name}" width="24" height="24"/> ${await TextEditor.enrichHTML(skill.name, { async: true })}</li>`;
         html.find(`ul[id="system.class.skils.text"]`).append(li_html);
         
      }
      html.find(`input[id="system.class.skills.uuid"]`).prop("value", new_skills.join(","));
      return new_skills;
   }

   async popUpSkillOptions(skillPopupOptions) {

      for (let i = 0; i < skillPopupOptions.master_full_set; i++) {
         await this.showSkillDialog('systems/mosh/templates/dialogs/actor-generator/actor-generator-skill-option-full-master-dialog.html');

      }
      for (let i = 0; i < skillPopupOptions.expert_full_set; i++) {
         await this.showSkillDialog('systems/mosh/templates/dialogs/actor-generator/actor-generator-skill-option-full-expert-dialog.html');

      }
      for (let i = 0; i < skillPopupOptions.trained; i++) {
         await this.showSkillDialog('systems/mosh/templates/dialogs/actor-generator/actor-generator-skill-option-single-dialog.html', "Trained");

      }
      for (let i = 0; i < skillPopupOptions.expert; i++) {
         await this.showSkillDialog('systems/mosh/templates/dialogs/actor-generator/actor-generator-skill-option-single-dialog.html', "Expert");

      }
      for (let i = 0; i < skillPopupOptions.master; i++) {
         await this.showSkillDialog('systems/mosh/templates/dialogs/actor-generator/actor-generator-skill-option-single-dialog.html', "Master");

      }
      //console.log(existingSkills);
      //return skillsUuid;
   }

   async showSkillDialog(template, exclusive = false) {

      let skillsUuid = this.skillsUuid;

      let all_skills = await this.getAllSkills();
      all_skills.forEach((element, index) => {
         all_skills[index].disabled = (skillsUuid.includes(element.uuid) ? "disabled" : "");
      });


      let skillPopupData = {
         title: game.i18n.localize("Mosh.CharacterGenerator.SkillOption.PopupTitle"),
         existingSkills: skillsUuid,
         skills: {
            trained: all_skills.filter(i => i.system.rank == "Trained"),
            expert: all_skills.filter(i => i.system.rank == "Expert"),
            master: all_skills.filter(i => i.system.rank == "Master"),
         }
      };
      if (exclusive) {
         skillPopupData.description = game.i18n.localize("Mosh.CharacterGenerator.SkillOption.Popup" + exclusive + "Description");
         switch (exclusive) {
            case "Master":
               skillPopupData.skills = all_skills.filter(i => i.system.rank == "Master" && i.system.prerequisite_ids.filter(item => skillsUuid.includes(item)).length > 0);
               break;
            case "Expert":
               skillPopupData.skills = all_skills.filter(i => i.system.rank == "Expert" && i.system.prerequisite_ids.filter(item => skillsUuid.includes(item)).length > 0);
               break;
            case "Trained":
               skillPopupData.skills = all_skills.filter(i => i.system.rank == "Trained");
               break;
         }
      }

      let popUpContent = await renderTemplate(template, skillPopupData);

      return new Promise((resolve) => {
         let d = new Dialog({
            title: game.i18n.localize("Mosh.CharacterGenerator.SkillOption.PopupTitle"),
            content: popUpContent,
            buttons: {
               "1": {
                  icon: '<i class="fas fa-check"></i>',
                  label: "Save",
                  callback: (html) => {
                     let form = html.find('form')[0];
                     let formData = new FormData(form);
                     let new_skills = [];
                     formData.forEach((value, key) => {
                        if (value != "") {
                           new_skills.push(value);
                           this.skillsUuid.push(value);
                        }
                     });

                     this.updateSkillHtmlUl(this._element, new_skills);
                     resolve();
                  }
               },
            },
            default: "1",
         });
         d.render(true);
      });
   }

   async showOptionsDialog(option_1, option_2) {
      let popupData = {
         option_1: option_1,
         option_2: option_2,
      }
      let popUpContent = await renderTemplate("systems/mosh/templates/dialogs/actor-generator/actor-generator-skill-option-choice-dialog.html", popupData);
      
      return new Promise((resolve) => {
         let d = new Dialog({
            title: game.i18n.localize("Mosh.CharacterGenerator.SkillOption.PopupTitle"),
            content: popUpContent,
            window:{width: 500,},
            buttons: {
               "1": {
                  icon: '<i class="fas fa-check"></i>',
                  label: game.i18n.localize("Mosh.CharacterGenerator.SkillOption.ChoiceWord") + " 1",
                  callback: () => {
                     resolve(option_1);
                  }
               },
               "2": {
                  icon: '<i class="fas fa-check"></i>',
                  label: game.i18n.localize("Mosh.CharacterGenerator.SkillOption.ChoiceWord") + " 2",
                  callback: () => {
                     resolve(option_2);
                  }
               },
            },
         });
         d.render(true);
      });
   }

   async applyClassSkills(html) {
      let class_uuid = html.find(`input[id="system.class.uuid"]`).prop("value");
      if (class_uuid == "") {
         ui.notifications.error(game.i18n.localize("Mosh.CharacterGenerator.SkillOption.Classerror"));
      }
      let classObject = await fromUuid(class_uuid);
      await html.find(`ul[id="system.class.skils.text"]`).empty();
      await html.find(`input[id="system.class.skills.uuid"]`).prop("value", "");

      this.skillsUuid = classObject.system.base_adjustment.skills_granted.slice();
      this.skillsUuid = await this.updateSkillHtmlUl(html, this.skillsUuid);


      let option_skills_1 = classObject.system.selected_adjustment.choose_skill_and;
      await this.popUpSkillOptions(option_skills_1);
      let option_skills_2 = classObject.system.selected_adjustment.choose_skill_or;
      const isEmptyOption1 = Object.values(option_skills_2.option_1).every(x => x === null || x === '' || x === 0);
      const isEmptyOption2 = Object.values(option_skills_2.option_2).every(x => x === null || x === '' || x === 0);
      let option_skills_2_choosed = {}
      if (isEmptyOption1 == false && isEmptyOption2 == false) {
         //we need to choose-> render popup with both options
         option_skills_2_choosed = await this.showOptionsDialog(option_skills_2.option_1,option_skills_2.option_2);
      } else if (isEmptyOption1 == false) {
         //there is only option 1 (edge case) but we go with it.
         option_skills_2_choosed = option_skills_2.option_1;
      } else if (isEmptyOption2 == false) {
         //there is only option 2 (edge case) but we go with it.
         option_skills_2_choosed = option_skills_2.option_2;
      }
      await this.popUpSkillOptions(option_skills_2_choosed);
   }

   async updateClass(classUuid, randomCharacter = false) {

      const droppedObject = await fromUuid(classUuid);
      if (droppedObject.type != "class") {
         return;
      }
      this._element.find(`input[id="system.class.value"]`).prop("value", droppedObject.name);

      const prev_uuid = this._element.find(`input[id="system.class.uuid"]`).prop("value");
      if (prev_uuid != null) {
         //we already had a class, so we remove previously applied bonuses and skill

         //remove previous bonuses
         this._element.find(`input[name$="bonus"]`).prop("value", null)

         //posible-todo: un-do the rolls of patch, trinket and loadout?
      }

      this._element.find(`input[id="system.class.uuid"]`).prop("value", classUuid);
      this._element.find(`input[id="system.class.traumaresponse"]`).prop("value", droppedObject.system.trauma_response);
      this.trinketTable = droppedObject.system.roll_tables.trinket;
      this.patchTable = droppedObject.system.roll_tables.patch;
      this.loadoutTable = droppedObject.system.roll_tables.loadout;

      /**
       *  Skills
       * */

      await this.applyClassSkills(this._element);

      /**
       * Stats
       */
      ///try{
      //let statsandsaves = JSON.parse(droppedObject.system.statsandsaves.replaceAll("<p>","").replaceAll("</p>","").replaceAll("<div>","").replaceAll("</div>","").replaceAll("&nbsp;",""));
      let fix_stats_and_saves = droppedObject.system.base_adjustment;

      Object.entries(fix_stats_and_saves).forEach(([key, value]) => {
         if (key != "skills_granted") {
            //this sets all the bonuses of base_adjustment including max_wounds
            this._element.find(`input[name="system.stats.${key}.bonus"]`).prop("value", value);
         }
      });

      //stats options
      let option_stats_and_saves = droppedObject.system.selected_adjustment.choose_stat;
      if (option_stats_and_saves.modification) {
         let buttons_options = {};
         for (let j = 0; j < option_stats_and_saves.stats.length; j++) {
            let prev_bonus = this._element.find(`input[name="system.stats.${option_stats_and_saves.stats[j]}.bonus"]`).prop("value");
            buttons_options[j] = {
               icon: '<i class="fas fa-check"></i>',
               label: option_stats_and_saves.stats[j],//.replace(/\.bonus/i,"").replace(/(.*)\.+/i,""),
               callback: () => this._element.find(`input[name="system.stats.${option_stats_and_saves.stats[j]}.bonus"]`).prop("value", (parseInt(option_stats_and_saves.modification) + parseInt(prev_bonus)))
            };
         }
         let d = new Dialog({
            title: game.i18n.localize("Mosh.CharacterGenerator.StatOptionPopupTitle"),
            content: `<p>${game.i18n.localize("Mosh.CharacterGenerator.StatOptionPopupText")} (${option_stats_and_saves.modification})</p>`,
            buttons: buttons_options,
            default: "1",
            //render: html => console.log("Register interactivity in the rendered dialog"),
            //close: html => console.log("This always is logged no matter which option is chosen")
         });
         d.render(true);
      }
      return;
   }

   async _onDrop(event) {
      await super._onDrop(event);
      const droppedUuid = TextEditor.getDragEventData(event);
      if (droppedUuid.type != "Item") {
         return;
      }
      await this.updateClass(droppedUuid.uuid);
      //this._render();
   }

   async getAllSkills() {
      /**TODO: Get only player skills ?¿ there is no way to tell pet skills apart */
      let skills = game.items.filter(i => i.type == "skill");

      for (const [compendium_key, compendium_value] of game.packs.entries()) {
         let skillCompendium = await compendium_value.getDocuments({ type: "skill" });
         if (skillCompendium.length > 0) {
            skills = skills.concat(skillCompendium)
         }
      }
      return skills;
   }

   async fill_class_options(html) {

      let class_options = game.items.filter(i => i.type == "class");

      for (const [class_key, class_value] of class_options.entries()) {

         html.find(`datalist[id="class_options"]`).append(
            `<option class="class_option" data-uuid="${class_value.uuid}" value="${class_value.name}">world.Item</option>`
         );
      }

      let compendiums = game.packs;

      for (const [compendium_key, compendium_value] of compendiums.entries()) {
         let classes = await compendium_value.getDocuments({ type: "class" });
         for (const [class_key, class_value] of classes.entries()) {
            html.find(`datalist[id="class_options"]`).append(
               `<option class="class_option" data-uuid="${class_value.uuid}" value="${class_value.name}">${class_value.pack}</option>`
            );
         }
      }
   }
   activateListeners(html) {
      super.activateListeners(html);

      html.ready(ev => {
         this.fill_class_options(html);
      });

      /** Stats  */
      html.find(`img[id="system.stats.strength.value"]`).click(ev => {
         this.rollStrength(html)
      });
      html.find(`img[id="system.stats.speed.value"]`).click(ev => {
         this.rollSpeed(html)
      });
      html.find(`img[id="system.stats.intellect.value"]`).click(ev => {
         this.rollIntellect(html)
      });
      html.find(`img[id="system.stats.combat.value"]`).click(ev => {
         this.rollCombat(html)
      });

      /** health */
      html.find(`img[id="system.health.max"]`).click(ev => {
         this.rollHealth(html)
      });

      /**Saves */
      html.find(`img[id="system.stats.sanity.value"]`).click(ev => {
         this.rollSanity(html)
      });
      html.find(`img[id="system.stats.fear.value"]`).click(ev => {
         this.rollFear(html)
      });
      html.find(`img[id="system.stats.body.value"]`).click(ev => {
         this.rollBody(html)
      });

      /** credits */

      html.find(`img[id="system.credits.value"]`).click(ev => {
         this.rollCredits(html)
      });

      /** Redo Skills */
      html.find(`i[id="system.class.skills.redo"]`).click(ev => {
         this.applyClassSkills(html)
      });

      /** Roll everything button */
      html.find(`div[id="roll.everything"]`).click(ev => {
         this.rollEverything(html)
      });

      /** Class input
       * when changed will lockup if its a defined class item and apply the apropiate modifiers
       * 
       */
      html.find(`input[id="system.class.value"]`).change(ev => {
         let class_name = html.find(`input[id="system.class.value"]`).prop('value');
         if (class_name == "") {
            //class name is empty, no class selected.
            return;
         }
         let class_option = html.find(`option[class="class_option"][value="${class_name}"]`).prop('dataset');
         if (class_option == null) {
            //class name is not part of the option, leave the string, and dont process uuid.
            return;
         }
         //we have a valid class item to process.
         this.updateClass(class_option["uuid"]);

      });


      /** Roll patch */
      html.find(`img[id="system.class.patch.value"]`).click(ev => {
         this.rollPatch(html)
      });
      /** Roll trinket */
      html.find(`img[id="system.class.trinket.value"]`).click(ev => {
         this.rollTrinket(html)
      });
      /** Roll loadout */
      html.find(`img[id="system.class.loadout.value"]`).click(ev => {
         this.rollLoadout(html)
      });


      /** Save and submit */
      html.find(`div[id="submit"]`).click(ev => {
         this.submit()
      });
   }

   /**
    * This method is called upon form submission after form data is validated
    * @param event {Event}       The initial triggering submission event
    * @param formData {Object}   The object of validated form data with which to update the object
    * @private
    */
   async _updateObject(event, formData) {

      let data = {
         "system.credits.value": formData["system.credits.value"],
         "system.stats.strength.value": formData["system.stats.strength.value"] + (formData["system.stats.strength.bonus"] || 0),
         "system.stats.speed.value": formData["system.stats.speed.value"] + (formData["system.stats.speed.bonus"] || 0),
         "system.stats.intellect.value": formData["system.stats.intellect.value"] + (formData["system.stats.intellect.bonus"] || 0),
         "system.stats.combat.value": formData["system.stats.combat.value"] + (formData["system.stats.combat.bonus"] || 0),
         "system.health.value": formData["system.health.max"] + (formData["system.health.mod"] || 0),
         "system.health.max": formData["system.health.max"] + (formData["system.health.mod"] || 0),
         "system.stats.sanity.value": formData["system.stats.sanity.value"] + (formData["system.stats.sanity.bonus"] || 0),
         "system.stats.fear.value": formData["system.stats.fear.value"] + (formData["system.stats.fear.bonus"] || 0),
         "system.stats.body.value": formData["system.stats.body.value"] + (formData["system.stats.body.bonus"] || 0),
      }
      if (formData["system.stats.max_wounds.bonus"]) {
         //max_wounds represent the bonus, so an android get 1 fro a total of 3 (2+1),
         data["system.hits.max"] = 2 + parseInt(formData["system.stats.max_wounds.bonus"]);
      }
      else {
         data["system.hits.max"] = 2;
      }

      if (formData["name"]) {
         data["name"] = formData["name"];
      }
      if (formData["system.class.value"]) {
         data["system.class.value"] = formData["system.class.value"];
         data["system.class.uuid"] = formData["system.class.uuid"];
         data["system.other.stressdesc.value"] = formData["system.class.traumaresponse"];
      }
      /*
      ChatMessage.create({content:`Character Rolls<br />
         STATS<br />
         Strength: ${data["system.stats.strength.value"]} = ${formData["system.stats.strength.value"]}+${formData["system.stats.strength.bonus"]}<br />
         Speed: ${data["system.stats.speed.value"]} = ${formData["system.stats.speed.value"]}+${formData["system.stats.speed.bonus"]}<br />
         Intellect: ${data["system.stats.intellect.value"]} = ${formData["system.stats.intellect.value"]}+${formData["system.stats.intellect.bonus"]}<br />
         Combat: ${data["system.stats.combat.value"]} = ${formData["system.stats.combat.value"]}+${formData["system.stats.combat.bonus"]}<br />
         SAVES<br />
         Sanity: ${data["system.stats.sanity.value"]} = ${formData["system.stats.sanity.value"]}+${formData["system.stats.sanity.bonus"]}<br />
         Fear: ${data["system.stats.fear.value"]} = ${formData["system.stats.fear.value"]}+${formData["system.stats.fear.bonus"]}<br />
         Body: ${data["system.stats.body.value"]} = ${formData["system.stats.body.value"]}+${formData["system.stats.body.bonus"]}<br />
         <br />
         Health: ${data["system.health.max"]}<br/>
         Extra wounds: ${formData["system.stats.max_wounds.bonus"]}<br/>
         Credits: ${data["system.credits.value"]}   <br />
            <br />
            Trinket roll:   <br />
            Patch roll:    <br />
            Loadout roll   <br />`});
        */

      if (formData["system.removepreviousitems"]) {
         let itemTypesToDelete = ["item", "armor", "weapon", "skill", "condition"];
         let itemsToDelete = this.object.items.filter(item => itemTypesToDelete.includes(item.type));
         await this.object.deleteEmbeddedDocuments("Item", itemsToDelete.map(item => item.id));
      }
      if (formData["system.class.loadout.uuid"]) {
         let loadoutItems = formData["system.class.loadout.uuid"].split(",");
         for (var i = 0; i < loadoutItems.length; i++) {
            await this.object.modifyItem(loadoutItems[i], 1);
         }
      }
      if (formData["system.class.patch.uuid"]) {
         await this.object.modifyItem(formData["system.class.patch.uuid"], 1);
      }
      if (formData["system.class.trinket.uuid"]) {
         await this.object.modifyItem(formData["system.class.trinket.uuid"], 1);
      }
      if (formData["system.class.skills.uuid"]) {
         let skillsItems = formData["system.class.skills.uuid"].split(",");
         for (var i = 0; i < skillsItems.length; i++) {
            await this.object.modifyItem(skillsItems[i], 1);
         }
      }
      this.object.update(data);
   }

}