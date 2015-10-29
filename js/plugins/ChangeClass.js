
/*=============================================================================
 * Class Change - Changes to RMMV core to enable class change in game.
 * By Hooptie
 * SceneJob.js
 * Version: 0.9
 * Free for commercial and non commercial use.
 *=============================================================================*/
 /*:
 * @plugindesc Changes to RMMV core to enable  class change in game.
 * @author Hooptie
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 * 
 * This plugin makes the necessary changes to RMMV core to allow
 * players to change classes in game. It requires SceneJob.js.
 * 
 * ============================================================================
 * Latest Version
 * ============================================================================
 * 
 * Get the latest version of this at https://github.com/Ikariusrb/rmmv-classsystem
 * 
 */


var Imported = Imported || {};

if (Imported['HPT.SceneJob'] === undefined) {
  console.log('This plugin requires the HPT SceneJob plugin to work.');
  throw new Error("This plugin requires the HPT SceneJob plugin work.");
}


(function() {

	// Add handler for "job" selection to the main menu
	var _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function() {
		_Scene_Menu_createCommandWindow.call(this);
        this._commandWindow.setHandler('job',     this.commandPersonal.bind(this));
	}
	
	// Replace the Game_Actor.changeClass function to fix a bug in the original.
	Game_Actor.prototype.changeClass = function(classId, keepExp) {
		if (keepExp) {
			this._exp[classId] = this.currentExp();
		}
		this._classId = classId;
		this.changeExp(this._exp[this._classId] || 0, false);
		this.refresh();
	};

	Game_Actor.prototype.clearEquips = function() {
		var slots = this.equipSlots();
		var maxSlots = slots.length;
		for (var i = 0; i < maxSlots; i++) {
			this.changeEquip(i,null);
		}
	}
	
	Window_MenuCommand.prototype.addMainCommands = function() {
		var enabled = this.areMainCommandsEnabled();
		if (this.needsCommand('item')) {
			this.addCommand(TextManager.item, 'item', enabled);
		}
		if (this.needsCommand('skill')) {
			this.addCommand(TextManager.skill, 'skill', enabled);
		}
		this.addCommand('Job','job', enabled);
		if (this.needsCommand('equip')) {
			this.addCommand(TextManager.equip, 'equip', enabled);
		}
		if (this.needsCommand('status')) {
			this.addCommand(TextManager.status, 'status', enabled);
		}
	};
	
	Scene_Menu.prototype.onPersonalOk = function() {
		switch (this._commandWindow.currentSymbol()) {
		case 'skill':
			SceneManager.push(Scene_Skill);
			break;
		case 'equip':
			SceneManager.push(Scene_Equip);
			break;
		case 'job':
			SceneManager.push(HPT.Scene_Job);
			break;
		case 'status':
			SceneManager.push(Scene_Status);
			break;
		}
	};

})();