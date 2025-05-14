import * as THREE from 'three';
import { Capsule } from 'three/addons/math/Capsule.js';
import { Octree } from 'three/addons/math/Octree.js';
import { OctreeHelper } from 'three/addons/helpers/OctreeHelper.js';
//import InputHandler from "./input.js";

export default class Player{

	constructor(_scene, _x, _y, _z, _scale, worldOctree){
		//Adds the player to the scene:
			this.f_radius = _scale * .7;
			
			//this.playerGeometry = new THREE.CapsuleGeometry( this.f_radius, this.f_radius, 2, 8);
			this.playerGeometry = new THREE.SphereGeometry( this.f_radius, 8, 8);
			this.visGeometry = new THREE.SphereGeometry( .1, 6, 6);
			
			
			//this.playerGeometry.translate(0, this.f_radius, 0); // Moves the geometry up so the bottom is at y=0
			this.playerMaterial = new THREE.MeshPhongMaterial( { color: 0xff0000 } );
			this.playerMaterial2 = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );
			this.player = new THREE.Mesh( this.playerGeometry, this.playerMaterial );
				
			_scene.add( this.player );
			this.player.position.set(_x, _y, _z);
			this.player.visible = false;
		//Collision capsule:
			this.playerCollider = new Capsule( new THREE.Vector3( _x, _y, _z ), new THREE.Vector3( _x, _y + this.f_radius, _z ), this.f_radius );
			this.playerCollider.visible = true;
			//(start, end radius) START IS THE BOTTOM
			
			this.capsuleGeom = new THREE.CapsuleGeometry(this.f_radius, this.f_radius * .35, 8, 16);
			this.capsuleMat = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
			this.capsuleMesh = new THREE.Mesh(this.capsuleGeom, this.capsuleMat);
			this.capsuleMesh.visible = false;
			_scene.add(this.capsuleMesh);
			
			
			this.startVis = new THREE.Mesh( this.visGeometry, this.playerMaterial2 );
			this.endVis = new THREE.Mesh( this.visGeometry, this.playerMaterial );
			this.startVis.visible = false;
			this.endVis.visible = false;
			_scene.add(this.startVis);
			_scene.add(this.endVis);
			
			
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
			this.b_inOffroad = false;
			
			this.f_stat_speed = .75;
			this.f_stat_acceleration = 0.005;
			this.f_stat_handling = .02;
			
			
			this.f_speed = this.f_stat_speed;
			this.f_acceleration = 0.0;
			
			
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
					this.f_gravity = -0.12;				//Jumping
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
				
				
			//When in offRoad:
			if(this.b_inOffroad){
				this.f_speed = this.f_stat_speed / 2;
			}
			else{
				this.f_speed = this.f_stat_speed;
			}
			
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
				this.playerCollider.start.y -= this.f_gravity;
			
			this.player.position.x -= Math.sin(this.player.rotation.y) * this.f_acceleration;
			this.player.position.z -= Math.cos(this.player.rotation.y) * this.f_acceleration;
			
			this.playerCollider.start.set(this.player.position.x, this.player.position.y, this.player.position.z);
			this.playerCollider.end.set(this.playerCollider.start.x, this.playerCollider.start.y + this.f_radius * .35, this.playerCollider.start.z);
			
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
		
		this.playerCollider.start.x = _x;
		this.playerCollider.start.y = _y;
		this.playerCollider.start.z = _z;
		//this.playerCollider.end.x = _x;
		//this.playerCollider.end.y = _y;
		//this.playerCollider.end.z = _z;
	}
	
	//Checks for contact with off-road:
	fn_offroad(offroadOctree){
		this.result = offroadOctree.capsuleIntersect( this.playerCollider );
		
		if ( this.result.depth > 1e-10 ) {
			console.log("In off-road");
			this.b_inOffroad = true;
		}
		else{
			this.b_inOffroad = false;
		}
	}
	
	//Checks for collisions with course and environment:
	fn_collision(worldOctree){
		this.result = worldOctree.capsuleIntersect( this.playerCollider );

		if ( this.result ) {
			//console.log("Depth x = " + this.result.normal.x + ", y = " + this.result.normal.y + ", z = " + this.result.normal.z);

			if ( this.result.depth > 1e-10 ) {
				
				this.playerCollider.translate( this.result.normal.multiplyScalar( this.result.depth ) );
				this.player.position.set(this.playerCollider.start.x, this.playerCollider.start.y, this.playerCollider.start.z);
				
				
				this.f_gravity = 0.1;
				//console.log("Vertical Collision! Depth = " + this.f_depthUp);
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
				this.f_acceleration -= this.f_acceleration / 6;
				if(this.f_acceleration < 0){
					this.f_acceleration = 0;
				}
				console.log("Wall collision detected!");
				this.b_hitWall = false;
			}
			
		//Update collision capsule:
			
			//this.playerCollider.end.set(this.playerCollider.start.x, this.playerCollider.start.y + this.f_radius * .35, this.playerCollider.start.z);
			//this.playerCollider.start.set(this.playerCollider.end.x, this.playerCollider.end.y + this.f_radius, this.playerCollider.end.z);
			this.capsuleMesh.position.copy(new THREE.Vector3().addVectors(this.playerCollider.start, this.playerCollider.end).multiplyScalar(0.5));
			this.startVis.position.set(this.playerCollider.start.x, this.playerCollider.start.y, this.playerCollider.start.z);
			this.endVis.position.set(this.playerCollider.end.x, this.playerCollider.end.y, this.playerCollider.end.z);
			
		//this.player.position.set(this.playerCollider.start.x, this.playerCollider.start.y, this.playerCollider.start.z);
			
		//Update the sprite's position:
			this.sprite.position.set(this.player.position.x, this.player.position.y + 0.02 * this.f_scale, this.player.position.z);
			//this.sprite.position.set(this.playerCollider.end.x, this.playerCollider.end.y + .6 * this.f_scale, this.playerCollider.end.z);
		
		//Update camera's position:
			if(!this.b_flying){
				if(input.fn_hold_rear()){
					camera.position.set(this.player.position.x - 4.5 * Math.sin(this.player.rotation.y), this.player.position.y + 2, this.player.position.z - 4.5 * Math.cos(this.player.rotation.y));
					camera.lookAt( this.player.position.x, this.player.position.y + 1.5, this.player.position.z );
				}
				else{
					camera.position.set(this.player.position.x + 5.75 * Math.sin(this.player.rotation.y), this.player.position.y + 2, this.player.position.z + 5.75 * Math.cos(this.player.rotation.y));
					camera.lookAt( this.player.position.x, this.player.position.y + 1.15, this.player.position.z );
				}
			}
		
		var hudSpd = document.getElementById("p_spd");
		hudSpd.innerHTML = "Speed = " + this.f_acceleration;
		
	}
	
	fn_getPlayer(){
		return this.player;
	}
}