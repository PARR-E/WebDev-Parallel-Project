import * as THREE from 'three';

export default class Pipe{
	//Tutorial for adding sprites: https://threejs.org/docs/#api/en/objects/Sprite 	

	constructor(_scene, _x, _y, _z, _scale){
		//Adds the pipe sprite to the scene:
			this.pipeMap = new THREE.TextureLoader().load( 'assets/sprites/pipe.png' );
			this.pipeMaterial = new THREE.SpriteMaterial( { map: this.pipeMap, color: 0xffffff} );
			this.pipeSprite = new THREE.Sprite( this.pipeMaterial );
			
			this.pipeSprite.scale.set(_scale, _scale, _scale);
			this.pipeSprite.position.set(_x, _y, _z);
			_scene.add( this.pipeSprite );
			
			//this.boundingCylinder = new THREE.CylinderGeometry( 5, 5, 20, 32 ); 
			
		//Add shadow to scene:
			this.shadowMaterial = new THREE.LineBasicMaterial( {color: 0x000000});
			this.shadowMaterial.opacity = 0.9;
			
			this.shadowGeometry = new THREE.CircleGeometry(.45 * _scale, 32); 
			this.shadow = new THREE.Mesh( this.shadowGeometry, this.shadowMaterial ); 
			_scene.add( this.shadow );
			this.shadow.position.set(_x,_y - .48 * _scale, _z);
			this.shadow.rotation.x = -1.5708;
			
		//Add bounding cylinder to the scene:
			this.colliderGeom = new THREE.CylinderGeometry( _scale * .325, _scale * .325, _scale * .9, 32); 
			this.colliderMat = new THREE.MeshBasicMaterial( {color: 0xffff00} ); 
			this.mesh_collider = new THREE.Mesh( this.colliderGeom, this.colliderMat );
			_scene.add( this.mesh_collider );
			this.mesh_collider.position.set(_x, _y, _z);
			this.mesh_collider.visible = false;
	}	
	
	fn_animate(){
		//this.mesh_collider.position.x += 0.01;			//<- This doesn't update the position of the collider in the octree.
	}
	
	fn_getType(){
		return "pipe";
	}
	
	fn_getCollider(){
		return this.mesh_collider;
	}
	
	
}