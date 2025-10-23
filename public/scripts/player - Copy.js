import * as THREE from 'three';
import { Capsule } from 'three/addons/math/Capsule.js';
import { Octree } from 'three/addons/math/Octree.js';
import { OctreeHelper } from 'three/addons/helpers/OctreeHelper.js';
//import InputHandler from "./input.js";

//Declaring constants:
	const b_showCapsule = false;

	const int_CC = new WeakMap();

	const f_stat_speed = new WeakMap();
	const f_stat_acceleration = new WeakMap();
	const f_stat_handling = new WeakMap();

	const f_baseMaxSpeed = new WeakMap();
	const f_baseMaxTurning = new WeakMap();
	const f_baseAcceletation = new WeakMap();

	const int_numLaps = new WeakMap();
	const int_numChecks = new WeakMap();
	const int_numKeys = new WeakMap();

export default class Player{

	constructor(_scene, [_x, _y, _z], _scale, _numChecks, _numKeys, _int_numLaps){
			this.f_radius = _scale * .7;													//Radius of the player's collisions.
			this.f_scale = _scale;															//The scale of the player.
		//Add the player to the scene:
			this.playerGeometry = new THREE.SphereGeometry( this.f_radius, 8, 8);				
			this.playerMaterial = new THREE.MeshPhongMaterial( { color: 0xff0000 } );
			this.player = new THREE.Mesh( this.playerGeometry, this.playerMaterial );		//Player collision with objects. Represents the player's XYZ (possible change XYZ to be separate like objects).
			_scene.add( this.player );
			this.player.position.set(_x, _y, _z);
			this.player.visible = false;

		//Collision capsule:
			this.worldCollider = new Capsule( new THREE.Vector3( _x, _y, _z ), new THREE.Vector3( _x, _y + this.f_radius, _z ), this.f_radius );	//Collider with the map.
			this.worldCollider.visible = true;
		if(b_showCapsule){
			//Visualize collision capsule:
				this.capsuleGeom = new THREE.CapsuleGeometry(this.f_radius, this.f_radius * .35, 8, 16);
				this.capsuleMat = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
				this.capsuleMesh = new THREE.Mesh(this.capsuleGeom, this.capsuleMat);			//Mesh to visualize the collision capsule.
				_scene.add(this.capsuleMesh);
			//Visualize where collision capsule top and bottom are:
				this.visGeometry = new THREE.SphereGeometry( .1, 6, 6);	
				this.startVis = new THREE.Mesh( this.visGeometry, new THREE.MeshPhongMaterial( { color: 0x00ff00 } ));
				this.endVis = new THREE.Mesh( this.visGeometry, this.playerMaterial );
				_scene.add(this.startVis);
				_scene.add(this.endVis);
		}
		
		//Code for player sprite:
			this.spriteMap = new THREE.TextureLoader().load( 'assets/sprites/MarioTest.png' ); //Load the image
			this.spriteMaterial = new THREE.SpriteMaterial( { 
				map: this.spriteMap, 
				transparent: true,
				alphaTest: 0.75,				//Helps discard transparent pixels.
				color: 0xffffff
			});
			this.sprite = new THREE.Sprite( this.spriteMaterial );							//The sprite itself.
			this.sprite.scale.set(_scale * 1.5, _scale * 1.5, _scale * 1.5);
			this.sprite.position.set(_x, _y, _z);
			_scene.add( this.sprite );
		
		//Player states:
			this.b_flying = false;															//When true, player is in free-cam mode.
			this.f_gravity = .125;															//Rate the player moves down per frame.
			this.b_onGround = false;														//Player is on ground when true.
			this.b_hitWall = false;															//True when collider collides w/ a wall.
			this.b_drifting = false;														//True when player is drifting.
			this.b_standstill = false;														//True when player is standstill drifitng.
			this.b_inOffroad = false;														//True when collider is in offroad.
			int_CC.set(this, 150);
		//Stats:
			f_stat_speed.set(this, 3);														//@ 150cc, stat 3 is ~80kmh.
			f_stat_acceleration.set(this, 3);
			f_stat_handling.set(this, 3);
			
		//Movement variables:
			f_baseMaxSpeed.set(this, .005 * int_CC.get(this) + f_stat_speed.get(this) * .01);	//The player's max speed.	
			this.f_maxSpeed = f_baseMaxSpeed.get(this);										//The current max speed.
			this.f_speed = 0.0;																//The current amount the player moves forwards per frame.
			this.f_steeringSpeedOffset = 0.001;

			f_baseAcceletation.set(this, f_stat_acceleration.get(this) * 0.0017);
			this.f_acceleration = f_baseAcceletation.get(this);								//The amount of speed the player gains while accelerating.

			f_baseMaxTurning.set(this, f_stat_handling.get(this) * 0.007);											//Max turning speed.
			this.maxTurning = f_baseMaxTurning.get(this);
			this.f_turning = 0.0;															//The amount the player rotates per frame.
			this.f_turningDirec = 1;
			this.f_jumpHeight = -0.125;

			this.int_cameraSpd = .75;															//Speed the camera moves while flying.
			
		//For checking if laps:
			this.b_finished = false;														//True if the player has completed all the laps.
			this.b_inOrder = true;															//True if the player is passing the key checkpoints in order.
			int_numLaps.set(this, _int_numLaps);													//Total # of laps.
			this.int_lap = 1;																//This player's current lap.
			this.int_courseProgress = 0;													//Number of checkpoints passed.
			int_numChecks.set(this, _numChecks);														//Total # of checkpoints.
			
			int_numKeys.set(this, _numKeys);														//Total # of key checkpoints.
			this.int_keysPassed = 0;														//Number of key checkpoints passed.
			this.int_expectedKey = 0;														//Index of the next expected key checkpoint.
			this.int_lastKey = -1;															//Index of the last key checkpoint passed.
			var lapsParagraph = document.getElementById("p_laps");
			lapsParagraph.innerHTML = "LAP " + this.int_lap + " / " + int_numLaps.get(this);
	}
	
	//Function for player input and movement:
	fn_play(camera, input){
		if(input.fn_press_fly()){
			var infoParagraph = document.getElementById("info");
			if(this.b_flying){
				infoParagraph.innerHTML = "Use Space to accelerate, WASD to steer, & J to drift/brake.<br /> Press f to toggle free cam.";
				this.b_flying = false;
			}
			else{
				this.b_flying = true;
				infoParagraph.innerHTML = "Use Space to ascend, WASD to move, & J to descend.<br /> Press f to toggle free cam.";
				this.f_speed = 0.0;
				camera.rotation.set(0,0,0);
				//camera.position.set( -54, 120, 114 );
				//camera.lookAt(-40, 0, -20);
			}
			console.log("FLY TOGGLE");
		}
		
		if(this.b_flying){
			//Horizontal movement:
				if(input.fn_hold_forward()){
					//camera.position.z -= 1;
					camera.position.z -= Math.cos(camera.rotation.y) * this.int_cameraSpd;
					camera.position.x -= Math.sin(camera.rotation.y) * this.int_cameraSpd;
				}
				if(input.fn_hold_back()){
					//camera.position.z += 1;
					camera.position.z += Math.cos(camera.rotation.y) * this.int_cameraSpd;
					camera.position.x += Math.sin(camera.rotation.y) * this.int_cameraSpd;
				}
				if(input.fn_hold_left()){
					//camera.rotation.y += .02;
					camera.position.z += Math.sin(camera.rotation.y) * this.int_cameraSpd;
					camera.position.x -= Math.cos(camera.rotation.y) * this.int_cameraSpd;
				}
				if(input.fn_hold_right()){
					//camera.rotation.y -= .02;
					camera.position.z -= Math.sin(camera.rotation.y) * this.int_cameraSpd;
					camera.position.x += Math.cos(camera.rotation.y) * this.int_cameraSpd;
				}
			//Rotation:	
				if(input.fn_hold_item()){
					camera.rotation.y += f_baseMaxTurning.get(this) + .005;
				}
				if(input.fn_hold_rear()){
					camera.rotation.y -= f_baseMaxTurning.get(this) + .005;
				}
			
			//Vertical movement:
				if(input.fn_hold_accelerate()){
					camera.position.y += .4;
				}
				if(input.fn_hold_drift()){
					camera.position.y -= .4;
				}
		}
		else if(!this.b_finished){
			//Drifting:
				//Jumping:
				if(input.fn_hold_accelerate() && input.fn_press_drift() && this.b_onGround && this.f_speed > 0.05){
					this.f_gravity = this.f_jumpHeight;				
				}
				
				if(input.fn_hold_drift() && input.fn_hold_accelerate() && this.b_onGround){
					if(this.f_speed <= 0.05	){
						this.b_standstill = true;
						
						if(this.f_speed < 0){
							this.f_speed += 0.001;
						}
					}
					this.b_drifting = true;
					console.log("b_drifting = " + this.b_drifting);	
				}
				else{
					this.b_drifting = false;
					this.b_standstill = false;
				}
				
			
			//Accelerating:
				if(this.b_onGround || this.f_gravity < 0){
					if(input.fn_hold_accelerate() && !this.b_standstill){
						this.f_speed += this.f_acceleration;
					}
					else if(!input.fn_hold_accelerate() && input.fn_hold_drift()){	//Brake/reverse
						this.f_speed -= 0.02;
					}
					else
					{
						this.f_speed -= 0.007;
					}
				}
				else{		//Lose speed when in the air (not jumping):
					this.f_speed -= 0.0005;
				}
				
				
			//When in offRoad:
			if(this.b_inOffroad){
				this.f_maxSpeed = f_baseMaxSpeed.get(this) / 2;
			}
			else{
				this.f_maxSpeed = f_baseMaxSpeed.get(this);
			}
			
			//Controlling acceleration:
			if(this.f_speed > this.f_maxSpeed)
			{
				this.f_speed = this.f_maxSpeed;
			}
			if(this.f_speed < 0 && !input.fn_hold_drift())
			{
				this.f_speed = 0;
			}
			if(this.f_speed < 0 && input.fn_hold_drift() && input.fn_hold_accelerate())
			{
				this.f_speed = 0;
			}
			else if(this.f_speed < -0.2 && input.fn_hold_drift()){
				this.f_speed = -0.2;
			}
			
			if(this.b_finished && this.f_speed < 0){
				this.f_speed = 0;
			}

			//Steering:	
				if((input.fn_hold_left() || input.fn_hold_right()) && (!this.f_speed == 0 || this.b_standstill)){
					//console.log("TURNING");
					if(input.fn_hold_left()){
						this.f_turningDirec = 1;
					}
					if(input.fn_hold_right()){
						this.f_turningDirec = -1;
					}
					
					this.f_turning += 0.0013 * this.f_turningDirec;
					//console.log("f_turning = " + this.f_turning);
					if(Math.abs(this.f_turning) > this.maxTurning){
						this.f_turning = this.maxTurning * this.f_turningDirec;
						//console.log("HIT");
					}
					
					//Loss of speed when steering:
					if(!this.b_drifting && this.b_onGround){
						console.log("LOSING SPEED FROM STEERING");
						this.f_acceleration -= this.f_steeringSpeedOffset;
						this.f_steeringSpeedOffset *= .005;						//% of the vaue that decays.
						//	- LATER NEED TO MAKE THIS CURVE BOUNCE BACK UP, AND ACCOUNT FOR DIFFERENT CCs.

						if(this.f_steeringSpeedOffset < 0.0001){
							this.f_steeringSpeedOffset = 0;
							//console.log("SHOULD BE ZERO");
						}
					}
				}
				else{	//When not steering:
					if(this.f_turning < 0.001 && this.f_turning > -0.001){	//If steering speed is close to 0, make it 0.
						this.f_turning = 0;
						this.f_turningDirec = 0;
					}
					else{														//Else, decrease steering rate.
						this.f_turning -= 0.00175 * this.f_turningDirec;
					}
					this.f_steeringSpeedOffset = this.f_speed * 0.01;
					this.f_acceleration = f_baseAcceletation.get(this);
				}

				
			//Steering while drifting:
				if(this.b_drifting){		//If drifitng, can turn tighter.
					this.maxTurning = f_baseMaxTurning.get(this) * 1.25; 
				}
				else{
					this.maxTurning = f_baseMaxTurning.get(this);
				}
			
			//Gravity:
				this.f_gravity += 0.012;
				if(this.f_gravity > 2.5){
					this.f_gravity = 2.5;
				}
				this.player.position.y -= this.f_gravity;
				this.worldCollider.start.y -= this.f_gravity;
			
			//Update player's position:
				this.player.position.x -= Math.sin(this.player.rotation.y) * this.f_speed;
				this.player.position.z -= Math.cos(this.player.rotation.y) * this.f_speed;
				this.player.rotation.y += this.f_turning;
			//Update world collider:
				this.worldCollider.start.set(this.player.position.x, this.player.position.y, this.player.position.z);
				this.worldCollider.end.set(this.worldCollider.start.x, this.worldCollider.start.y + this.f_radius * .35, this.worldCollider.start.z);
			
			//this.playerCollider.start.x -= Math.sin(this.player.rotation.y) * this.f_acceleration;
			//this.playerCollider.start.z -= Math.cos(this.player.rotation.y) * this.f_acceleration;
			
			this.b_onGround = false;
		}
	}
	
	fn_animate(){
		
	}
	
	fn_onGround(_depth){
		//this.f_gravity = .2;
		//this.player.position.y +=  _depth;
	}
	
	fn_hitWall(_depth){
		this.player.position.x -= _depth;
		
	}
	
	fn_getPosition(){
		return new THREE.Vector3(this.player.position.x, this.player.position.y, this.player.position.z);
		
	}
	
	fn_setPosition(_x, _y, _z){
		this.player.position.x = _x;
		this.player.position.y = _y;
		this.player.position.z = _z;
		
		this.worldCollider.start.x = _x;
		this.worldCollider.start.y = _y;
		this.worldCollider.start.z = _z;
		//this.playerCollider.end.x = _x;
		//this.playerCollider.end.y = _y;
		//this.playerCollider.end.z = _z;
	}
	
	//Checks for contact with off-road:
	fn_offroad(offroadOctree){
		this.result = offroadOctree.capsuleIntersect( this.worldCollider );
		
		if ( this.result.depth > 1e-10 ) {
			//console.log("In off-road");
			this.b_inOffroad = true;
		}
		else{
			this.b_inOffroad = false;
		}
	}
	
	//Checks for collisions with course and environment:
	fn_collision(worldOctree){
		this.result = worldOctree.capsuleIntersect( this.worldCollider );

		if ( this.result ) {
			//console.log("Depth x = " + this.result.normal.x + ", y = " + this.result.normal.y + ", z = " + this.result.normal.z);

			if ( this.result.depth > 1e-10 ) {
				
				this.worldCollider.translate( this.result.normal.multiplyScalar( this.result.depth ) );
				this.player.position.set(this.worldCollider.start.x, this.worldCollider.start.y, this.worldCollider.start.z);
				
				
				this.f_gravity = 0.125;
				this.b_onGround = true;
			}
			
			//Wall collision:
			if(Math.abs(this.result.normal.x) > 0.1 || Math.abs(this.result.normal.z) > 0.1) {
				this.b_hitWall = true;
			}
		}
	}
	
	
	
	
	
	fn_update(camera, input){
		//Code to run when wall is hit:
			if(this.b_hitWall){			
				this.f_speed -= this.f_speed / 6;
				if(this.f_speed < 0){
					this.f_speed = 0;
				}
				console.log("Wall collision detected!");
				this.b_hitWall = false;
			}
		
		if(b_showCapsule){
			//Update collision capsule visulizers:
				this.capsuleMesh.position.copy(new THREE.Vector3().addVectors(this.worldCollider.start, this.worldCollider.end).multiplyScalar(0.5));
				this.startVis.position.set(this.worldCollider.start.x, this.worldCollider.start.y, this.worldCollider.start.z);
				this.endVis.position.set(this.worldCollider.end.x, this.worldCollider.end.y, this.worldCollider.end.z);
		}
		
		//Update the sprite's position:
			this.sprite.position.set(this.player.position.x, this.player.position.y + 0.02 * this.f_scale, this.player.position.z);
				
		//Update camera's position:
			if(!this.b_flying){
				//Rear view:
				if(input.fn_hold_rear()){
					camera.position.set(this.player.position.x - 4.5 * Math.sin(this.player.rotation.y), this.player.position.y + 2, this.player.position.z - 4.5 * Math.cos(this.player.rotation.y));
					camera.lookAt( this.player.position.x, this.player.position.y + 1.5, this.player.position.z );

					//Update sprite:
						//this.sprite.material.map = new THREE.TextureLoader().load('assets/sprites/MarioFront.png');
						//this.sprite.material.needsUpdate = true;
				}
				else{
					camera.position.set(this.player.position.x + 5.75 * Math.sin(this.player.rotation.y), this.player.position.y + 2, this.player.position.z + 5.75 * Math.cos(this.player.rotation.y));
					camera.lookAt( this.player.position.x, this.player.position.y + 1.15, this.player.position.z );
				}
			}
			else{
				//camera.lookAt(-40, 0, -20);
			}
		
		var hudSpd = document.getElementById("p_spd");
		var str_spd = (Math.abs(Math.trunc(this.f_speed * 100))).toString();
		
		if(Math.abs(this.f_speed * 100) < 10){
			str_spd = "0" + str_spd;
		}
		
		hudSpd.innerHTML = str_spd + " kmh";
		
		
	}
	
	fn_getPlayer(){
		return this.player;
	}
	
	fn_getHitbox(){
		return new THREE.Box3().setFromObject(this.player);
		//return this.player.geometry;
	}
	
	fn_checkpointUpdate(_checkpoint){
		
		if(this.int_courseProgress + 10 >= _checkpoint.fn_getID() && this.b_inOrder){	//Doesn't count checkpoints that are too far ahead.
			this.int_courseProgress = _checkpoint.fn_getID() /*+ (int_numChecks.get(this) + 1) * (this.int_lap - 1)*/;
		}
		
		var idButton = document.getElementById("p_check");
		idButton.innerHTML = "Progress: " + this.int_courseProgress;

		if(_checkpoint.fn_getKey() && this.int_lastKey != _checkpoint.fn_getID()){
			if(_checkpoint.fn_getID() == this.int_expectedKey){
				this.int_expectedKey = _checkpoint.fn_getNextKey();
				//console.log("Next key is " + this.int_expectedKey);
				this.b_inOrder = true;
				this.int_keysPassed += 1;
				
			}
			else{
				if(this.int_keysPassed > 0){	//If passed a checkpoint after first going to the goal:
					this.int_keysPassed -= 1;
					this.int_expectedKey = this.int_lastKey;
				}
				else{							//If passed a checkpoint before first going to the goal:
					this.int_expectedKey = 0;
					//this.int_keysPassed = 0;
					this.int_lastKey = -1;
					this.int_expectedKey = 0;				}
				
				//console.log("Out of order. Next key is " + this.int_expectedKey);
				this.b_inOrder = false;
			}
			//console.log("Last key: " + this.int_lastKey);
			
			//For incremementing laps:
			if(_checkpoint.fn_getGoal() && this.int_keysPassed >= int_numKeys.get(this)){
				this.int_keysPassed = 1;
				this.int_lap += 1;
				
				if(this.int_lap <= int_numLaps.get(this)){
					var lapsParagraph = document.getElementById("p_laps");
					lapsParagraph.innerHTML = "LAP " + this.int_lap + " / " + int_numLaps.get(this);
				}
				else{
					this.b_finished = true;
					var finishParagraph = document.getElementById("p_finish");
					finishParagraph.innerHTML = "FINISH";
				}
			}   
			//console.log("Keys passed: " + this.int_keysPassed + "\n------------");
			
			this.int_lastKey = _checkpoint.fn_getID();
		}
	}

	fn_isFinished(){
		return this.b_finished;
	}
}