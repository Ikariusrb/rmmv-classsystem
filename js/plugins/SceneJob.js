/*=============================================================================
 * Job Scene - UI for changing classes
 * By Hooptie
 * SceneJob.js
 * Version: 0.9
 * Free for commercial and non commercial use.
 *=============================================================================*/
 /*:
 * @plugindesc UI for changing classes in RMMV
 * @author Hooptie
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 * 
 * This plugin provides a UI for changing classes. It requires
 * ChangeClass.js to add it to the main menus.
 * 
 * ============================================================================
 * Latest Version
 * ============================================================================
 * 
 * Get the latest version of this at https://github.com/Ikariusrb/rmmv-classsystem
 * 
 */

var Imported = Imported || {};

Imported["HPT.SceneJob"] = true;

var HPT = HPT || {};

(function($) {
	
	//-----------------------------------------------------------------------------
	// Scene_Job
	//
	// The scene class for the Job screen.
	
	function Scene_Job() {
		this.initialize.apply(this, arguments);
	}
	
	Scene_Job.prototype = Object.create(Scene_ItemBase.prototype);
	Scene_Job.prototype.constructor = Scene_Job;
	
	Scene_Job.prototype.initialize = function() {
		Scene_ItemBase.prototype.initialize.call(this);
	};
	
	Scene_Job.prototype.create = function() {
		Scene_ItemBase.prototype.create.call(this);
		this.createHelpWindow();
		this.createJobTypeWindow();
		this.createStatusWindow();
		this.createJobWindow();
		this.createActorWindow();
		this.refreshActor();
	};
	
	Scene_Job.prototype.createJobTypeWindow = function() {
		var wy = this._helpWindow.height;
		this._jobTypeWindow = new Window_JobType(0, wy);
		this._jobTypeWindow.setHelpWindow(this._helpWindow);
		this._jobTypeWindow.setHandler('job',    this.commandJob.bind(this));
		this._jobTypeWindow.setHandler('cancel',   this.popScene.bind(this));
		this._jobTypeWindow.setHandler('pagedown', this.nextActor.bind(this));
		this._jobTypeWindow.setHandler('pageup',   this.previousActor.bind(this));
		this.addWindow(this._jobTypeWindow);
	};
	
	Scene_Job.prototype.createStatusWindow = function() {
		var wx = this._jobTypeWindow.width;
		var wy = this._helpWindow.height;
		var ww = Graphics.boxWidth - wx;
		var wh = this._jobTypeWindow.height;
		this._statusWindow = new Window_SkillStatus(wx, wy, ww, wh);
		this.addWindow(this._statusWindow);
	};
	
	Scene_Job.prototype.createJobWindow = function() {
		var wx = 0;
		var wy = this._statusWindow.y + this._statusWindow.height;
		var ww = Graphics.boxWidth;
		var wh = Graphics.boxHeight - wy;
		this._jobWindow = new Window_JobList(wx, wy, ww, wh);
		this._jobWindow.setHelpWindow(this._helpWindow);
		this._jobWindow.setHandler('ok',     this.onJobOk.bind(this));
		this._jobWindow.setHandler('cancel', this.onJobCancel.bind(this));
		this._jobTypeWindow.setJobWindow(this._jobWindow);
		this.addWindow(this._jobWindow);
	};
	
	Scene_Job.prototype.refreshActor = function() {
		var actor = this.actor();
		this._jobTypeWindow.setActor(actor);
		this._statusWindow.setActor(actor);
		this._jobWindow.setActor(actor);
		this._jobTypeWindow.refresh();
		this._statusWindow.refresh();
		this._jobWindow.refresh();
	};
	
	Scene_Job.prototype.user = function() {
		return this.actor();
	};
	
	Scene_Job.prototype.commandJob = function() {
		this._jobWindow.activate();
		this._jobWindow.selectLast();
	};
	
	Scene_Job.prototype.onJobOk = function() {
        var item = this.item();
		var actor = this.actor();
		actor.changeClass(item.id, true);
		actor.clearEquips();
		this.refreshActor();
		this._jobWindow.deselect();
		this._jobTypeWindow.activate();
	};
	
	Scene_Job.prototype.item = function() {
        return this._jobWindow.item();
    };
	
	Scene_Job.prototype.onJobCancel = function() {
		this._jobWindow.deselect();
		this._jobTypeWindow.activate();
	};
	
	Scene_Job.prototype.playSeForItem = function() {
		SoundManager.playUseSkill();
	};
	
	Scene_Job.prototype.useItem = function() {
		Scene_ItemBase.prototype.useItem.call(this);
		this._statusWindow.refresh();
		this._jobWindow.refresh();
	};
	
	Scene_Job.prototype.onActorChange = function() {
		this.refreshActor();
		this._jobTypeWindow.activate();
	};
	
	//-----------------------------------------------------------------------------
	// Window_JobType
	//
	// 
	
	function Window_JobType() {
		this.initialize.apply(this, arguments);
	}
	
	Window_JobType.prototype = Object.create(Window_Command.prototype);
	Window_JobType.prototype.constructor = Window_JobType;
	
	Window_JobType.prototype.initialize = function(x, y) {
		Window_Command.prototype.initialize.call(this, x, y);
		this._actor = null;
	};
	
	Window_JobType.prototype.windowWidth = function() {
		return 240;
	};
	
	Window_JobType.prototype.setActor = function(actor) {
		if (this._actor !== actor) {
			this._actor = actor;
			this.refresh();
			this.selectLast();
		}
	};
	
	Window_JobType.prototype.numVisibleRows = function() {
		return 4;
	};
	
	Window_JobType.prototype.makeCommandList = function() {
		this.addCommand("Job", 'job', true );
	};
	
	Window_JobType.prototype.update = function() {
		Window_Command.prototype.update.call(this);
		if (this._skillWindow) {
			this._skillWindow.setStypeId(this.currentExt());
		}
	};
	
	Window_JobType.prototype.setJobWindow = function(jobWindow) {
		this._jobWindow = jobWindow;
		this.update();
	};
	
	Window_JobType.prototype.selectLast = function() {
		this.select(0);
	};


	//-----------------------------------------------------------------------------
	// Window_JobList
	//
	// The window for selecting a job on the job screen.
	
	function Window_JobList() {
		this.initialize.apply(this, arguments);
	}
	
	Window_JobList.prototype = Object.create(Window_Selectable.prototype);
	Window_JobList.prototype.constructor = Window_JobList;
	
	Window_JobList.prototype.initialize = function(x, y, width, height) {
		Window_Selectable.prototype.initialize.call(this, x, y, width, height);
		this._actor = null;
		this._stypeId = 0;
		this._data = [];
	};
	

	
	Window_JobList.prototype.setActor = function(actor) {
		if (this._actor !== actor) {
			this._actor = actor;
			this.refresh();
			this.resetScroll();
		}
	};
	
	Window_JobList.prototype.setStypeId = function(stypeId) {
		if (this._stypeId !== stypeId) {
			this._stypeId = stypeId;
			this.refresh();
			this.resetScroll();
		}
	};
	
	Window_JobList.prototype.maxCols = function() {
		return 2;
	};
	
	Window_JobList.prototype.spacing = function() {
		return 48;
	};
	
	Window_JobList.prototype.maxItems = function() {
		return this._data ? this._data.length : 1;
	};
	
	Window_JobList.prototype.item = function() {
		return this._data && this.index() >= 0 ? this._data[this.index()] : null;
	};
	
	Window_JobList.prototype.isCurrentItemEnabled = function() {
		return this.isEnabled(this._data[this.index()]);
	};
	
	Window_JobList.prototype.includes = function(item) {
		return item && item.stypeId === this._stypeId;
	};
	
	Window_JobList.prototype.isEnabled = function(item) {
		return  this._actor.currentClass() != item;
	};
	
	Window_JobList.prototype.makeJobList = function() {
		if (this._actor) {
			this._data = $dataClasses.filter(function(item) {
				  if (item != null) {
    				  return item.name;
				  }
			});
		} else {
			this._data = [];
		}
	};
	
	Window_JobList.prototype.selectLast = function() {
		var skill;
		if ($gameParty.inBattle()) {
			skill = this._actor.lastBattleSkill();
		} else {
			skill = this._actor.lastMenuSkill();
		}
		var index = this._data.indexOf(skill);
		this.select(index >= 0 ? index : 0);
	};
	
	Window_JobList.prototype.drawItem = function(index) {
		var job = this._data[index];
		if (job) {
			var costWidth = this.costWidth();
			var rect = this.itemRect(index);
			rect.width -= this.textPadding();
			this.changePaintOpacity(this.isEnabled(job));
			this.drawItemName(job, rect.x, rect.y, rect.width - costWidth);
			this.drawSkillCost(job, rect.x, rect.y, rect.width);
			this.changePaintOpacity(1);
		}
	};
	
	Window_JobList.prototype.costWidth = function() {
		return this.textWidth('000');
	};
	
	Window_JobList.prototype.drawSkillCost = function(skill, x, y, width) {
		if (this._actor.skillTpCost(skill) > 0) {
			this.changeTextColor(this.tpCostColor());
			this.drawText(this._actor.skillTpCost(skill), x, y, width, 'right');
		} else if (this._actor.skillMpCost(skill) > 0) {
			this.changeTextColor(this.mpCostColor());
			this.drawText(this._actor.skillMpCost(skill), x, y, width, 'right');
		}
	};
	
	Window_JobList.prototype.updateHelp = function() {
		this.setHelpWindowItem(this.item());
	};
	
	Window_JobList.prototype.refresh = function() {
		this.makeJobList();
		this.createContents();
		this.drawAllItems();
	};

	

	HPT.Scene_Job = Scene_Job;
	HPT.Window_JobType = Window_JobType;
	HPT.Window_JobList = Window_JobList;

})(HPT);