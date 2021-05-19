import enemy from '../entity/Enemy';
import Heart from '../entity/Heart';
import Ground from '../entity/Ground';
import Flagpole from '../entity/Flagpole'
import Mario from '../entity/Mario'
import Bullet from '../entity/Bullet';
import Star from '../entity/Star';
import io from 'socket.io-client';
import SoldierPlayer from '../entity/SoldierPlayer'
import Phaser from 'phaser'
import MuzzleFlash from '../entity/MuzzleFlash';

const numberOfFrames = 15;

export default class SynthwaveScene extends Phaser.Scene {
  constructor() {
    super('SynthwaveScene');

    this.scene = this;
    this.fire = this.fire.bind(this);
    // this.hit = this.hit.bind(this);
    this.createBackgroundElement = this.createBackgroundElement.bind(this);
    this.color = 'Blue';

    this.createStar = this.createStar.bind(this)
    this.createHeart = this.createHeart.bind(this);
    // this.createMario = this.createMario.bind(this)
  }

  preload() {
    //loading bar
    this.scene.get('TitleScene').displayLoadingBar(this, "ma, you've been bad")
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

     //Crouching Soldier
     this.load.spritesheet(`${this.color}SoldierCrouching`, `assets/spriteSheets/${this.color}/Gunner_${this.color}_Crouch.png`, {
      frameWidth: 48,
      frameHeight: 39,
    })

    this.load.spritesheet('mario', 'assets/spriteSheets/mario_enemy.png', {
      frameWidth: 30,
      frameHeight: 37,
    });

    this.load.spritesheet('flagpole', 'assets/spriteSheets/flagpoles_sheet.png', {
      frameWidth: 32,
      frameHeight: 168,
    })
    this.load.spritesheet('heart', 'assets/spriteSheets/heart.png', {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.image('ground', 'assets/sprites/ground-juan-test.png');
    this.load.image('brandon', 'assets/sprites/brandon.png');
    this.load.image('bullet', 'assets/sprites/SpongeBullet.png');
    this.load.image('muzzleFlash', 'assets/sprites/MuzzleFlash.png');
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
    this.load.audio('shooting', 'assets/audio/shooting.wav');
    this.load.audio('scream', 'assets/audio/scream.wav');
    this.load.audio('background-music', 'assets/audio/synthwave_scene/synthwave-palms.wav');
  }

  createGround(tileWidth, count) {
    const height = this.game.config.height;
    for (let i=0; i<count; i++) {
      let newGround = this.groundGroup.create(i*tileWidth, height, 'road').setOrigin(0, 1).setScale(3.5).refreshBody();
      newGround.body.allowGravity = false
      newGround.body.immovable = true
    }
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
    
    //timer
   

    //scene.otherPlayer=null;
    this.socket.on("currentPlayers", function (arg) {
      const  players  = arg;
      console.log('players--->', players)
      Object.keys(players).forEach(function (id) {
        if (players[id].playerId !== scene.socket.id) {
          //console.log('movestate--->', players[id].moveState)
          // const x = players[id].moveState.x
          // const y = players[id].moveState.y
          //const facingLeft = players[id].moveState.facingLeft
          scene.otherPlayer = new SoldierPlayer(scene, 60, 400, `${scene.color}SoldierIdle`, scene.socket,).setSize(14, 32).setOffset(15, 7).setScale(2.78);
          // scene.otherPlayer.facingLeft = facingLeft
          // if(facingLeft) {
          //   scene.otherPlayer.flipX = !scene.otherPlayer.flipX
          // }
          //note: to address variable characters
          scene.add.existing(scene.otherPlayer)
          scene.physics.add.collider(scene.otherPlayer, scene.groundGroup)
          //'this' context here is the function; need to grab the 'this' that is the scene (i.e. 'scene')
          //turn game on
          //if(Object.keys(players).length===2) scene.scene.resume()
        }
      });
    });

    this.socket.on("newPlayer", function (arg) {
      const playerInfo  = arg;
     //need to add socket id to player?
      scene.otherPlayer = new SoldierPlayer(scene, 60, 400, `${scene.color}SoldierIdle`, scene.socket,).setSize(14, 32).setOffset(15, 7).setScale(2.78);
      //note: to address variable characters
      scene.add.existing(scene.otherPlayer)
      scene.physics.add.collider(scene.otherPlayer, scene.groundGroup)
    });

    this.socket.on("playerMoved", function (moveState){
      
      //scene.otherPlayer.updateMovement({right: {isDown:true}})
      if(scene.otherPlayer){
      scene.otherPlayer.updateOtherPlayerMovement(moveState)
      if(moveState.up) {
        scene.otherPlayer.updateOtherPlayerJump(moveState, scene.jumpSound)
      }
      scene.otherPlayer.updateOtherPlayerInAir()
    }
    })
      
      

    //mute the previous scene
    this.game.sound.stopAll();

    //Set up background
    const width = this.game.config.width;
    const height = this.game.config.height;
    this.add.image(width * 0.5, height * 0.46, 'sky').setOrigin(0.5).setScale(3.5).setScrollFactor(0)
    this.createBackgroundElement(504, 'mountains', 2*numberOfFrames, 0.15)
    this.createBackgroundElement(168, 'palms-back', 5*numberOfFrames, 0.3)
    this.createBackgroundElement(448, 'palms', 2*numberOfFrames, 0.45)

    this.groundGroup = this.physics.add.group();
    this.createGround(168, 5*numberOfFrames);

    // Create game entities
    // << CREATE GAME ENTITIES HERE >>
    this.player = new SoldierPlayer(this, 60, 400, `${scene.color}SoldierIdle`, this.socket).setSize(14, 32).setOffset(15, 7).setScale(2.78);
    this.player.setCollideWorldBounds(true); //stop player from running off the edges
    this.physics.world.setBounds(0, null, width * numberOfFrames, height, true, true, false, false) //set world bounds only on sides

    //check other players moves and if collision between players:




    //set up camera
    const cam = this.cameras.main;
    cam.startFollow(this.player);
    cam.setBounds(0, 0, width * numberOfFrames, height)



    this.physics.add.collider(this.player, this.groundGroup)
    this.cursors = this.input.keyboard.createCursorKeys();
    this.createAnimations();

    // this.enemy = new enemy(this, 600, 400, 'brandon').setScale(.25)


    // ...
    // this.physics.add.collider(this.enemy, this.groundGroup);
    // this.physics.add.collider(this.enemy, this.player);

    // We're going to create a group for our lasers
    this.bullets = this.physics.add.group({
      classType: Bullet,
      runChildUpdate: true,
      allowGravity: false,
      maxSize: 40     // Important! When an obj is added to a group, it will inherit
                          // the group's attributes. So if this group's gravity is enabled,
                          // the individual lasers will also have gravity enabled when they're
                          // added to this group
    });

    // When the laser collides with the enemy
    // this.physics.add.overlap(
    //   this.bullets,
    //   this.enemy,
    //   this.hit,
    //   null,
    //   this
    // );



    // Create sounds
    // << CREATE SOUNDS HERE >>
    this.backgroundSound = this.sound.add('background-music'); //add background music for this level
    this.backgroundSound.setLoop(true);
    this.backgroundSound.volume = 0.1;
    this.backgroundSound.play();

    this.sound.pauseOnBlur = false; //prevent sound from cutting when you leave tab

    this.jumpSound = this.sound.add('jump');
    this.jumpSound.volume = 0.2;

    this.shootingSound = this.sound.add('shooting');
    // // The laser sound is a bit too loud so we're going to turn it down
    this.shootingSound.volume = 0.03;

    this.screamSound = this.sound.add('scream');
   
    scene.scene.pause()
    scene.scene.launch("WaitingRoom", { socket: scene.socket })

    this.socket.on("startGame", function () {
      scene.scene.resume()
      //console.log('testing')
    })
    
    
    // Create collisions for all entities
    // << CREATE COLLISIONS HERE >>
  }

  // time: total time elapsed (ms)
  // delta: time elapsed (ms) since last update() call. 16.666 ms @ 60fps
  update(time, delta) {
    // << DO UPDATE LOGIC HERE >>
    const scene = this
    this.player.update(time, this.cursors, this.jumpSound, this.fire, this.shootingSound);
    //this.player.update(time, this.cursors, this.jumpSound);
    if (this.muzzleFlash) this.muzzleFlash.update(delta)

    // this.enemy.update(this.screamSound);
    
    // this.mario.update()

    
  }

  fire(x, y, left) {
    // These are the offsets from the player's position that make it look like
    // the laser starts from the gun in the player's hand
    const offsetX = 60;
    const offsetY = 5.5;
    const bulletX =
      this.player.x + (this.player.facingLeft ? -offsetX : offsetX);
    const bulletY = this.player.isCrouching ? this.player.y + offsetY*3.1 : this.player.y + 5 //- offsetY;
    const muzzleX =
      this.player.x + (this.player.facingLeft ? -offsetX*0.95 : offsetX*0.95);
    const muzzleY = this.player.isCrouching ? this.player.y + offsetY*3.1 : this.player.y + 5//- offsetY;

    //create muzzleFlash
    {this.muzzleFlash ? this.muzzleFlash.reset(muzzleX, muzzleY, this.player.facingLeft)
      : this.muzzleFlash = new MuzzleFlash(this, muzzleX, muzzleY, 'muzzleFlash', this.player.facingLeft)}
      // Get the first available laser object that has been set to inactive
      let bullet = this.bullets.getFirstDead();
      // Check if we can reuse an inactive laser in our pool of lasers
      if (!bullet) {
        // Create a laser bullet and scale the sprite down
        bullet = new Bullet(
          this,
          bulletX,
          bulletY,
          'bullet',
          this.player.facingLeft
        ).setScale(3);
        this.bullets.add(bullet);
      }
      // Reset this laser to be used for the shot
      bullet.reset(bulletX, bulletY, this.player.facingLeft);

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
    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('mario', { start: 5, end: 8 }),
      frameRate: 5,
      repeat: -1,
    });
    this.anims.create({
      key: 'crouch',
      frames: this.anims.generateFrameNumbers(`${this.color}SoldierCrouching`, {start:3}),
    });
  }


    // make the laser inactive and insivible when it hits the enemy
    // hit(enemy, bullet) {
    //   bullet.setActive(false);
    //   bullet.setVisible(false);
    // }

}
