import * as THREE from 'three';
import { Capsule } from 'three/addons/math/Capsule.js';
//import InputHandler from "./input.js";

export default class Player{

	constructor(_scene, _x, _y, _z, _scale){
		//Adds the player to the scene:
			this.f_radius = _scale * .5;
			//this.playerGeometry = new Capsule( new THREE.Vector3( 0, 0.35, 0 ), new THREE.Vector3( 0, 1, 0 ), 0.35 );
			this.playerGeometry = new THREE.CapsuleGeometry( this.f_radius, this.f_radius, 2, 8);
			
			//this.playerGeometry = new THREE.SphereGeometry( this.f_radius, 8, 8);
			//this.playerGeometry = new THREE.BoxGeometry( this.f_radius, this.f_radius, this.f_radius);
			this.playerGeometry.translate(0, this.f_radius * 1.5, 0); // Moves the geometry up so the bottom is at y=0
			this.playerMaterial = new THREE.MeshPhongMaterial( { color: 0xff0000 } );
			this.player = new THREE.Mesh( this.playerGeometry, this.playerMaterial );
			
			this.player = new THREE.Mesh( this.playerGeometry, this.playerMaterial );
			_scene.add( this.player );
			this.player.position.set(_x, _y, _z);
			this.player.visible = true;
			
		//Wall collision detector (wc means wall collision):
			this.wcMaterial = new THREE.LineBasicMaterial( {color: 0x0000ff});
			this.wcMaterial.opacity = 0.9;
			
			this.wcGeometry = new THREE.BoxGeometry( 1 * _scale, _scale * .2, 1 * _scale );
			this.wcBox = new THREE.Mesh( this.wcGeometry, this.wcMaterial );
			_scene.add( this.wcBox );
			this.wcBox.visible = false;	
			
		//Code for player sprite:
			this.spriteMap = new THREE.TextureLoader().load( 'assets/sprites/MarioTest.png' );
			//this.spriteMap = new THREE.TextureLoader().load( 'assets/sprites/custom_characters/ShrekMan (Nehemiah).png' );
			//this.spriteMap.colorSpace = SRGBColorSpace;
			this.spriteMaterial = new THREE.SpriteMaterial( { map: this.spriteMap, color: 0xffffff, transparent: true});
			
			this.sprite = new THREE.Sprite( this.spriteMaterial );
			this.sprite.scale.set(_scale * 1.5, _scale * 1.5, _scale * 1.5);
			this.sprite.position.set(_x, _y, _z);
			_scene.add( this.sprite );
				
		
		//Other variables used by player:
			this.f_scale = _scale;
			this.f_wallCollisionRadius = 1.1 * _scale;
			this.b_flying = false;
			this.f_gravity = .2;
			this.f_depthUp = 0.009;
			this.f_wcOffsetLR = .5 * this.f_scale;
			this.int_wcTimer = 0;
			this.b_onGround = false;
			this.b_hitWall = false;
			this.b_drifting = false;
			
			this.playerOnFloor = false;
			
			this.f_speed = .75 * 1;
			this.f_acceleration = 0.0;
			
			this.f_stat_acceleration = 0.005;
			this.f_stat_handling = .02;
			
			
			this.int_cameraSpd = 1;
	}
	
	//Function for player input and movement:
	fn_play(camera, input){
		if(input.fn_press_fly()){
			var infoParagraph = document.getElementById("info");
			if(this.b_flying){
				infoParagraph.innerHTML = "Use Space to accelerate, WASD to steer, & J to brake.<br /> Press f to toggle free cam.";
				this.b_flying = false;
			}
			else{
				this.b_flying = true;
				infoParagraph.innerHTML = "Use Space to ascend, WASD to move, & J to descend.<br /> Press f to toggle free cam.";
				this.f_acceleration = 0.0;
				camera.rotation.set(0,0,0);
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
					camera.rotation.y += this.f_stat_handling;
				}
				if(input.fn_hold_rear()){
					camera.rotation.y -= this.f_stat_handling;
				}
			
			//Vertical movement:
				if(input.fn_hold_accelerate()){
					camera.position.y += .4;
				}
				if(input.fn_hold_drift()){
					camera.position.y -= .4;
				}
		}
		else{
			//Drifting:
				if(input.fn_hold_accelerate() && input.fn_press_drift() && this.b_onGround){
					this.b_drifting = true;
					this.f_gravity = -0.12;
				}
				
				if(input.fn_hold_drift() && input.fn_hold_accelerate()){
					this.b_drifting = true;
					console.log("Drifting");
				}
				else{
					this.b_drifting = false;
				}
			
			//Accelerating:
				if(input.fn_hold_drift() && input.fn_hold_accelerate() && !this.b_drifting){
					this.f_acceleration -= 0.01;
				}
				else if(input.fn_hold_accelerate()){
					this.f_acceleration += this.f_stat_acceleration;
				}
				else if(!input.fn_hold_accelerate() && input.fn_hold_drift()){
					this.f_acceleration -= 0.02;
					//this.f_acceleration = 0;
				}
				else
				{
					this.f_acceleration -= 0.01;
				}
			
				
			//Steering:	
				if(input.fn_hold_left()){
					this.player.rotation.y += this.f_stat_handling;
				}
				if(input.fn_hold_right()){
					this.player.rotation.y -= this.f_stat_handling;
				}
				if(!input.fn_hold_drift()){
					this.f_stat_handling = 0.02;
					//if(input.fn_hold_right() || input.fn_hold_left()){
					//	this.f_acceleration -= 0.007;
					//}
				}
				else{
					this.f_stat_handling = 0.025;
				}
			//Drifting:
				
			
			//Controlling acceleration:
			if(this.f_acceleration > this.f_speed)
			{
				this.f_acceleration = this.f_speed;
			}
			if(this.f_acceleration < 0 && !input.fn_hold_drift())
			{
				this.f_acceleration = 0;
			}
			if(this.f_acceleration < 0 && input.fn_hold_drift() && input.fn_hold_accelerate())
			{
				this.f_acceleration = 0;
			}
			else if(this.f_acceleration < -0.2 && input.fn_hold_drift()){
				this.f_acceleration = -0.2;
			}
			
			//Gravity:
				this.f_gravity += 0.011;
				if(this.f_gravity > 2.5){
					this.f_gravity = 2.5;
				}
				this.player.position.y -= this.f_gravity;
				//console.log("gravity = " + this.f_gravity);
			
			this.player.position.x -= Math.sin(this.player.rotation.y) * this.f_acceleration;
			this.player.position.z -= Math.cos(this.player.rotation.y) * this.f_acceleration;
			
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
	}
	
	
	//Checks for collisions with course and environment:
	fn_collision(worldOctree, b_offroad){
		this.result = worldOctree.objectIntersect( this.player );

		this.playerOnFloor = false;

		if ( this.result ) {

			this.playerOnFloor = this.result.normal.y > 0;

			//if ( ! this.playerOnFloor ) {

				//playerVelocity.addScaledVector( this.result.normal, - this.result.normal.dot( playerVelocity ) );

			//}

			if ( this.result.depth >= 1e-10 ) {

				this.player.translate( this.result.normal.multiplyScalar( this.result.depth ) );

			}

		}
	}
	
	fn_checkCollision(raycaster, direction, model, b_offroad){
		this.intersects;
		
		//Collision with walls:
		if(!b_offroad){
			
			this.v_wcPos = new THREE.Vector3(this.wcBox.position.x, this.wcBox.position.y, this.wcBox.position.z);
			raycaster.set(this.v_wcPos, new THREE.Vector3(0, 1, 0));
			
			this.intersects = raycaster.intersectObject(model, true);
			
			
			if (this.intersects.length > 0 /*&& this.intersects[0].distance <= f_radius*/ && this.intersects.length < 2) {
				//fn_wallCollision();
				this.b_hitWall = true;
			}
		}
			
		//Colision with the course (ChatGBT helped with this part):
			this.v_playerPos = new THREE.Vector3(this.player.position.x, this.player.position.y, this.player.position.z);
			raycaster.set(this.v_playerPos, direction);
			
			this.intersects = raycaster.intersectObject(model, true);
			this.f_depthUp = this.intersects.length > 0 ? this.intersects[0].distance : null;
		
			if (this.intersects.length > 0 && this.f_depthUp < 1.6) {			//Adjust the < value here to determine how low/high of a wall to check for.
				if(b_offroad){
					console.log("In off-road");
				}
				else{
					//console.log("Vertical Collision! Depth = " + this.f_depthUp);
					this.f_gravity = 0.1;
					this.player.position.y += this.f_depthUp;
					this.b_onGround = true;
				}
			}
		
	}
	
	
	fn_hitWall(){
		this.b_hitWall = true;
	}
	
	
	fn_update(camera, input){
		//Code to run when wall is hit:
			if(this.b_hitWall){			
				this.f_pushBack = this.f_acceleration * 4;
				this.player.position.x += Math.sin(this.player.rotation.y) * (this.f_pushBack) ;
				this.player.position.z += Math.cos(this.player.rotation.y) * (this.f_pushBack);
				this.f_acceleration -= this.f_acceleration / 2;
				if(this.f_acceleration < 0){
					this.f_acceleration = 0;
				}
				
				//console.log("Wall collision detected! Intsersection = " + this.intersects[0].distance);
				console.log("Wall collision detected!");
				this.b_hitWall = false;
			}
		//Update the wall collision's position:
			this.wcBox.position.set(this.player.position.x, this.player.position.y + this.f_radius, this.player.position.z);
			//this.wcBox.rotation.y = this.player.position.y;
		//Update the sprite's position:
			this.sprite.position.set(this.wcBox.position.x, this.wcBox.position.y + .22 * this.f_scale, this.wcBox.position.z);
		
		//Update camera's position:
			if(!this.b_flying){
				if(input.fn_hold_rear()){
					camera.position.set(this.player.position.x - 4.5 * Math.sin(this.player.rotation.y), this.player.position.y + 2, this.player.position.z - 4.5 * Math.cos(this.player.rotation.y));
					camera.lookAt( this.player.position.x, this.player.position.y + 1.5, this.player.position.z );
				}
				else{
					camera.position.set(this.player.position.x + 5.5 * Math.sin(this.player.rotation.y), this.player.position.y + 2.4, this.player.position.z + 5.5 * Math.cos(this.player.rotation.y));
					camera.lookAt( this.player.position.x, this.player.position.y + 1.8, this.player.position.z );
				}
			}
		
		var hudSpd = document.getElementById("p_spd");
		hudSpd.innerHTML = "Speed = " + this.f_acceleration;
		
	}
	
	fn_getPlayer(){
		return this.player;
	}
}