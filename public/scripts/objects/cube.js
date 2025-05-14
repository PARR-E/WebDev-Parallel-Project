import * as THREE from 'three';

export default class Cube{

	constructor(_scene, _x, _y, _z, _scale){
		//Adds the cube to the scene:
			this.cubeGeometry = new THREE.BoxGeometry( _scale, _scale, _scale );
			this.cubeMaterial = new THREE.MeshPhongMaterial( { color: 0x00ffff } );
			this.cube = new THREE.Mesh( this.cubeGeometry, this.cubeMaterial );
			_scene.add( this.cube );
			this.cube.position.set(_x, _y, _z);
	}
	
	fn_getType(){
		return "cube";
	}
	
	fn_animate(){
		//Cube rotation:
			this.cube.rotation.x += -0.002;
			this.cube.rotation.y += 0.02;
	}
}