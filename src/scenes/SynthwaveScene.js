import Player from '../entity/Player';
import enemy from '../entity/Enemy';
import Heart from '../entity/Heart';
import gun from '../entity/Gun';
import Ground from '../entity/Ground';
import Laser from '../entity/Laser';
import Star from '../entity/Star';
import io from 'socket.io-client';
import SoldierPlayer from '../entity/SoldierPlayer'
import Phaser from 'phaser'

const numberOfFrames = 15;

export default class SynthwaveScene extends Phaser.Scene {
  constructor() {
    super('SynthwaveScene');

    this.scene = this;
    this.collectGun = this.collectGun.bind(this);
    this.fireLaser = this.fireLaser.bind(this);
    this.hit = this.hit.bind(this);
    this.createBackgroundElement = this.createBackgroundElement.bind(this);
    this.color = 'Blue';
    
    this.createStar = this.createStar.bind(this)
    
    this.createHeart = this.createHeart.bind(this);
  }

  preload() {
    // Preload Sprites
    // << LOAD SPRITES HERE >>
    // this.load.spritesheet('blueSoldier', 'assets/spriteSheets/josh.png', {
    //   frameWidth: 340,
    //   frameHeight: 460,
    // });

    
    //Running Blue Soldier
      this.load.spritesheet(`${this.color}SoldierRunning`, `assets/spriteSheets/${this.color}/Gunner_${this.color}_Run.png`, {
        frameWidth: 48,
        frameHeight: 39,
      })
    
    
    //Idle Blue Soldier
    this.load.spritesheet(`${this.color}SoldierIdle`, `assets/spriteSheets/${this.color}/Gunner_${this.color}_Idle.png`, {
      frameWidth: 48,
      frameHeight: 39,
    })
    
    //Jumping Blue Soldier
    this.load.spritesheet(`${this.color}SoldierJumping`, `assets/spriteSheets/${this.color}/Gunner_${this.color}_Jump.png`, {
      frameWidth: 48,
      frameHeight: 39,
    })

    this.load.spritesheet('heart', 'assets/spriteSheets/heart.png', {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.image('ground', 'assets/sprites/ground-juan-test.png');
    this.load.image('brandon', 'assets/sprites/brandon.png');
    this.load.image('gun', 'assets/sprites/gun.png');
    this.load.image('laserBolt', 'assets/sprites/laserBolt.png');
    this.load.spritesheet('star', 'assets/spriteSheets/star.png', {
      frameWidth: 16,
      frameHeight: 16,
    })

    //preload background
    this.load.image("sky", "assets/backgrounds/synthwave_scene/back.png");
    this.load.image("mountains", "assets/backgrounds/synthwave_scene/mountains.png");
    this.load.image("palms-back", "assets/backgrounds/synthwave_scene/palms-back.png");
    this.load.image("palms", "assets/backgrounds/synthwave_scene/palms.png");
    this.load.image("road", "assets/backgrounds/synthwave_scene/road.png");

    // Preload Sounds
    // << LOAD SOUNDS HERE >>
    this.load.audio('jump', 'assets/audio/jump.wav');
    this.load.audio('laser', 'assets/audio/laser.wav');
    this.load.audio('scream', 'assets/audio/scream.wav');
    this.load.audio('background-music', 'assets/audio/synthwave_scene/synthwave-palms.wav');
  }

  createGround(tileWidth, count) {
    const height = this.game.config.height;
    for (let i=0; i<count; i++) {
      this.groundGroup.create(i*tileWidth, height, 'road').setOrigin(0, 1).setScale(3.5).refreshBody();
    }
  }

  processCollide() {
    console.log("Dude, stop it!")
  }

  createBackgroundElement(imageWidth, texture, count, scrollFactor) {
    const height = this.game.config.height;
    for (let i=0; i<count; i++) {
      this.add.image(i*imageWidth, height, texture).setOrigin(0, 1).setScale(3.5).setScrollFactor(scrollFactor)
    }
  }
  
  createStar(x, y) {
  //load star
    const star = new Star(this, x, y, 'star').setScale(1.5)
    star.play('rotate-star')
  }

  createHeart(x, y) {
    const heart = new Heart(this, x, y, 'heart');
    heart.play("rotate-heart")
  }

  create() {
    //socket logic
    const scene = this
    this.socket = io();

    scene.otherPlayer=null;

    this.socket.on("currentPlayers", function (arg) {
      const  players  = arg;
      Object.keys(players).forEach(function (id) {
        if (players[id].playerId !== scene.socket.id) {
          scene.otherPlayer = new SoldierPlayer(scene, 100, 400, `${this.color}SoldierIdle`).setScale(2.78);
          //note: to address variable characters
          scene.add.existing(scene.otherPlayer)
          scene.physics.add.collider(scene.otherPlayer, scene.groundGroup)
          //'this' context here is the function; need to grab the 'this' that is the scene (i.e. 'scene')
        }
      });
    });

    this.socket.on("newPlayer", function (arg) {
      const playerInfo  = arg;
     //need to add socket id to player?
      scene.otherPlayer = new SoldierPlayer(scene, 100, 400, `${this.color}SoldierIdle`).setScale(2.78);
      //note: to address variable characters
      scene.add.existing(scene.otherPlayer)
      scene.physics.add.collider(scene.otherPlayer, scene.groundGroup)
    });



    //mute the previous scene
    this.game.sound.stopAll();

    //Set up background
    const width = this.game.config.width;
    const height = this.game.config.height;
    this.add.image(width * 0.5, height * 0.46, 'sky').setOrigin(0.5).setScale(3.5).setScrollFactor(0)
    this.createBackgroundElement(504, 'mountains', 2*numberOfFrames, 0.15)
    this.createBackgroundElement(168, 'palms-back', 5*numberOfFrames, 0.3)
    this.createBackgroundElement(448, 'palms', 2*numberOfFrames, 0.45)

    this.groundGroup = this.physics.add.staticGroup({ classType: Ground });
    this.createGround(168, 5*numberOfFrames);

    // Create game entities
    // << CREATE GAME ENTITIES HERE >>
    this.player = new SoldierPlayer(this, 60, 400, `${this.color}SoldierIdle`, this.socket).setScale(2.78);
    this.player.setCollideWorldBounds(true); //stop player from running off the edges
    this.physics.world.setBounds(0, null, width * numberOfFrames, height, true, true, false, false) //set world bounds only on sides

    //check other players moves and if collision between players:
      this.socket.on("playerMoved", function (data){

      scene.otherPlayer.x = data.x
      scene.otherPlayer.y = data.y
      scene.otherPlayer.setPosition(data.x, data.y)
      scene.physics.add.collider(scene.player, scene.otherPlayer, scene.processCollide);
    })
    
    

    //set up camera
    const cam = this.cameras.main;
    cam.startFollow(this.player);
    cam.setBounds(0, 0, width * numberOfFrames, height)



    this.physics.add.collider(this.player, this.groundGroup)
    this.cursors = this.input.keyboard.createCursorKeys();
    this.createAnimations();

    this.enemy = new enemy(this, 600, 400, 'brandon').setScale(.25)
    
    this.createStar(600, 400); //create a star to test the Heart entity
    this.createHeart(100, 500);
    this.createHeart(120, 500);     //create a heart to test the Heart entity
    
    // ...
    this.physics.add.collider(this.enemy, this.groundGroup);
    this.physics.add.collider(this.enemy, this.player);
    this.gun = new gun(this, 300, 400, 'gun').setScale(0.25);

  // ...
    this.physics.add.collider(this.gun, this.groundGroup);

    this.physics.add.overlap(
      this.player,
      this.gun,
      this.collectGun,    // Our callback function that will handle the collision logic
      null,               // processCallback. Can specify a function that has custom collision
                          // conditions. We won't be using this so you can ignore it.
      this                // The context of 'this' for our callback. Since we're binding
                          // our callback, it doesn't really matter.
    );

    // We're going to create a group for our lasers
    this.lasers = this.physics.add.group({
      classType: Laser,
      runChildUpdate: true,
      allowGravity: false,
      maxSize: 40     // Important! When an obj is added to a group, it will inherit
                          // the group's attributes. So if this group's gravity is enabled,
                          // the individual lasers will also have gravity enabled when they're
                          // added to this group
    });

    // When the laser collides with the enemy
    this.physics.add.overlap(
      this.lasers,
      this.enemy,
      this.hit,
      null,
      this
    );
    


    // Create sounds
    // << CREATE SOUNDS HERE >>
    this.backgroundSound = this.sound.add('background-music'); //add background music for this level
    this.backgroundSound.setLoop(true);
    this.backgroundSound.volume = 0.1;
    this.backgroundSound.play();

    this.sound.pauseOnBlur = false; //prevent sound from cutting when you leave tab

    this.jumpSound = this.sound.add('jump');

    this.laserSound = this.sound.add('laser');
    // The laser sound is a bit too loud so we're going to turn it down
    this.laserSound.volume = 0.5;

    this.screamSound = this.sound.add('scream');

    // Create collisions for all entities
    // << CREATE COLLISIONS HERE >>
  }

  // time: total time elapsed (ms)
  // delta: time elapsed (ms) since last update() call. 16.666 ms @ 60fps
  update(time, delta) {
    // << DO UPDATE LOGIC HERE >>
    this.player.update(this.cursors, this.jumpSound);

    this.gun.update(
      time,
      this.player,
      this.cursors,
      this.fireLaser,
      this.laserSound
    );

    this.enemy.update(this.screamSound);

  }

  fireLaser(x, y, left) {
    // These are the offsets from the player's position that make it look like
    // the laser starts from the gun in the player's hand
    const offsetX = 56;
    const offsetY = 14;
    const laserX =
      this.player.x + (this.player.facingLeft ? -offsetX : offsetX);
    const laserY = this.player.y + offsetY;

      // Get the first available laser object that has been set to inactive
      let laser = this.lasers.getFirstDead();
      // Check if we can reuse an inactive laser in our pool of lasers
      if (!laser) {
        // Create a laser bullet and scale the sprite down
        laser = new Laser(
          this,
          laserX,
          laserY,
          'laserBolt',
          this.player.facingLeft
        ).setScale(0.25);
        this.lasers.add(laser);
      }
      // Reset this laser to be used for the shot
      laser.reset(laserX, laserY, this.player.facingLeft);

  }

  createAnimations() {
    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers(`${this.color}SoldierRunning`),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'jump',
      frames: this.anims.generateFrameNumbers(`${this.color}SoldierJumping`),
      frameRate: 20,
    });
    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers(`${this.color}SoldierIdle`),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'rotate-star',
      frames: this.anims.generateFrameNumbers('star'),
      frameRate: 10,
      repeat: -1,
    })
    this.anims.create({
    key: 'rotate-heart',
      frames: this.anims.generateFrameNumbers('heart'),
      frameRate: 10,
      repeat: -1
    });
  }

    // make the laser inactive and insivible when it hits the enemy
    hit(enemy, laser) {
      laser.setActive(false);
      laser.setVisible(false);
    }

  collectGun(player, gun) {
    // << ADD GAME LOGIC HERE >>
    gun.disableBody(true, true); // (disableGameObj, hideGameObj)
    // Set the player to 'armed'
    this.player.armed = true;
  }

}
