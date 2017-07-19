const Game = function(game){}

Game.prototype = {
	preload: function() {

		//loading assets -- https://phaser.io/tutorials/making-your-first-phaser-game/part2
		this.game.load.image('circle','asset/circle.png')
		this.game.load.image('background', 'asset/tile.png')
	},
	create: function(){
		//set width and height based on width/height properties of game argument
		var width= this.game.width
		var height= this.game.height

		//Setting world boundaries http://phaser.io/docs/2.4.4/Phaser.World.html#setBounds
		this.game.world.setBounds(-width, -height, width*2, height*2);
		this.game.stage.backgroundColor = '#444'

		//initialize physics and groups. Arcade is running by default, but others need direct activation
		//http://phaser.io/docs/2.5.0/Phaser.Physics.html#startSystem
		this.game.physics.startSystem(Phaser.Physics.P2JS)

		this.game.snakes = [];

		//create player snake and fix camera
		var snake = new Snake (this.game, 'circle', 0, 0);
        this.game.camera.follow(snake.head);

	},
	//update loop
	update: function() {
		for (var i = this.game.snakes.length - 1; i >= 0; i--){
			this.game.snakes[i].update();
		}
	}

}