Snake = function(game, spriteKey, x, y) {
	//set game to provided game
	this.game = game;

	//initialize games snakes array, if it doesn't already exist
	if (!this.game.snakes) {
		this.game.snakes = [];
	}

	//add this snake, referred to as 'this'
	this.game.snakes.push(this);
	this.debug = false;
	this.snakeLength = 0;
	this.spriteKey = spriteKey;

	//various quantities that can be changed
	this.scale = 0.6;
	this.fastSpeed = 200;
	this.slowSpeed = 130;
	this.speed = this.slowSpeed;
	this.rotationSpeed = 40;

	//initialize groups and arrays
	this.collisionGroup = this.game.physics.p2.createCollisionGroup();
	this.sections = []; 

	//the head path is an array of points that the head of the snake has traveled through
	this.headPath = [];
	this.food = [];

	this.preferredDistance = 17 * this.scale;
	this.queuedSections = 0;

	this.sectionGroup = this.game.add.group();
	this.head = this.addSectionAtPosition(x,y);
	this.head.name = 'head';
	this.head.snake = this;

	this.lastHeadPosition - new Phaser.Point(this.head.body.x, this.head.body.y);
	//add 30 sections behind the head
	this.initSections(30);

	this.onDestroyedallbacks = [];
	this.onDestroyedContexts = [];
}

//add prototype methods to snake

Snake.prototype = {
	initSections: function(num) {
		//create a certain number of sections behind the head
		//only use this once
		for(var i=1; i<=num; i++) {
			var x = this.head.body.x;
			var y = this.head.body.y + i * this.preferredDistance;
			this.addSectionAtPosition(x,y);
			//A Point object represents a location in a two-dimensional coordinate system
			//where x represents the horizontal axis and y represents the vertical axis. 
			this.headPath.push(new Phaser.Point(x,y));
		}
	},

	addSectionAtPosition: function(x, y) {
		//initialize a new section
		var sec = this.game.add.sprite(x, y, this.spriteKey);
		this.game.physics.p2.enable(sec, this.debug);
		sec.body.setCollisionGroup(this.collisionGroup);
		sec.body.collides([]);
		sec.body.kinematic = true;

		this.snakeLength++;
		this.sectionGroup.add(sec);
		sec.sendToBack();
		sec.scale.setTo(this.scale);

		this.sections.push(sec);

		sec.body.clearShapes();
		sec.body.addCircle(sec.width*0.5);

		return sec;
	},

	addSectionsAfterLast: function(amount) {
		this.queuedSections += amount
	},

	//create update function to move the snake forward
	update: function() {
		var speed = this.speed;
		this.head.body.moveForward(speed);

		//remove last element of array that contains points which head traveled through
		//then move this point to the front and change it's value to where head is located
		var point = this.headPath.pop();
		point.setTo(this.head.body.x, this.head.body.y);
		this.headPath.unshift(point);

		//place each section of the snake on the path of the snake head
		var index = 0
		var lastIndex = null
		for (var i = 0; i < this.snakeLength ; i++) {
			this.sections[i].body.x = this.headPath[index].x;
			this.sections[i].body.y = this.headPath[index].y;

			//hide sections if they are in same position
			if (lastIndex && index == lastIndex) {
				this.sections[i].alpha = 0;		
			} else { this.sections [i].alpha = 1}

			lastIndex = index;

			//find index in head path that next point should be at
			index = this.findNextPointIndex(index)
		}
		//continuously adjust the size of the head path array
		//so that we keep only an array of points we need
		if (index >= this.headPath.length - 1){
			var lastPos = this.headPath[this.headPath.length - 1];
			this.headPath.push(new Phaser.Point(lastPos.x, lastPos.y))
		} else { this.headPath.pop()}

		//this calls onCycleComplete every time a cycle is completed
		//a cycle is the time it takes the second section of a snake to reach
		//where the head of the snake was at the end of the last cycle
		var i = 0;
		var found = false;
		while ( this.headPath[i].x != this.sections[1].body.x &&
			this.headPath[i].y != this.sections[1].body.y) {
			if (this.headPath[i].x == this.lastHeadPosition.x &&
				this.headPath[i].y != this.lastHeadPosition.y) {
					found = true
					break;
			}
			i++;
		}
		if (!found) {
			this.lastHeadPosition = new Phaser.Point(this.head.body.x, this.head.body.y);
			this.onCycleComplete();
		}
	},
	onCycleComplete: function () {
		if(this.queuedSections > 0) {
			var lastSec = this.sections[this.sections.length -1];
			this.addSectionAtPosition(lastSec.body.x, lastSec.body.y)
			this.queuedSections--;
		}
	},

	findNextPointIndex: function(currentIndex) {
		var pt = this.headPath[currentIndex];

		var prefDist = this.preferredDistance;
		var len = 0;
		var dif = len - prefDist;
		var i = currentIndex;
		var prevDif = null;

		while (i+1 < this.headPath.length && (dif === null || dif < 0)) {
			var dist = Util.distanceFormula(
				this.headPath[i].x, this.headPath[i].y,
				this.headPath[i+1].x, this.headPath[i+1].y
			);
			len += dist;
			prevDif = dif;

			dif = len - prefDist;
			i++
		}

		if(prevDif === null || Math.abs(prevDif) > Math.abs(dif)){
			return i;
		} else { return i-1};
	},

	setScale: function(scale) {
		this.scale = scale;
		this.preferredDistance = 17 * this.scale;

		//scale sections and their bodies
		for(var i = 0; i<this.sections.length; i++){
			var sec = this.sections[i];
			sec.scale.setTo(this.scale);
			sec.body.data.shapes[0].radius = this.game.physics.p2.pxm(sec.width*0.5)
		}
	},

	incrementSize: function(){
		this.addSectionsAfterLast(1);
		this.setScale(this.scale * 1.01);
	}
	//Find in the headPath array which point the next section of the snake
	//should be placed, based on the distance between points
}