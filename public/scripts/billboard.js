//COMMAND: npx serve
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function main() {
	//Creating renderer:
	const canvas = document.querySelector( '#c' );
	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );
	
	//Creating camera:
	const fov = 75;
	const aspect = 2; // the canvas default
	const near = 0.1;
	const far = 1000;
	const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.set( 10, 2, 5 );
	
	//Orbit controls:
	const controls = new OrbitControls( camera, canvas );
	controls.target.set( 0, 2, 0 );
	controls.minPolarAngle = 0;
	controls.maxPolarAngle = Math.PI / 2;
	controls.update();

	const scene = new THREE.Scene();
	
	//Adding light source to scene:
	function addLight( position ) {

		const color = 0xFFFFFF;
		const intensity = 3;
		const light = new THREE.DirectionalLight( color, intensity );
		light.position.set( ...position );
		scene.add( light );
		scene.add( light.target );

	}
	addLight( [ - 3, 1, 1 ] );
	addLight( [ 2, 1, .5 ] );
	
	//Creates a sprite:
	function makeSprite(_x, _y, _z) {
		
		const pipeMap = new THREE.TextureLoader().load( 'assets/sprites/pipe.png' );
		const pipeMaterial = new THREE.SpriteMaterial( { map: pipeMap, color: 0xffffff } );

		const pipeSprite = new THREE.Sprite( pipeMaterial );
		pipeSprite.scale.set(1, 1, 1);
		pipeSprite.position.set(_x, _y, _z);
		scene.add( pipeSprite );
		
	}
	
	
	//Loop to place a grid of pipes:
	for ( let z = - 50; z <= 50; z += 10 ) {
		for ( let x = - 50; x <= 50; x += 10 ) {
			makeSprite(x, .5, z);
		}
	}
	
	//Add a ground plane & background:
	scene.background = new THREE.Color( 'lightblue' );
		const size = 400;
		const geometry = new THREE.PlaneGeometry( size, size );
		const material = new THREE.MeshPhongMaterial( { color: 'gray' } );
		const mesh = new THREE.Mesh( geometry, material );
		mesh.rotation.x = Math.PI * - 0.5;
		scene.add( mesh );
	
	
	//Rendering:
	function resizeRendererToDisplaySize( renderer ) {

		const canvas = renderer.domElement;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const needResize = canvas.width !== width || canvas.height !== height;
		if ( needResize ) {
			renderer.setSize( width, height, false );
		}
		return needResize;
	}

	function render() {

		if ( resizeRendererToDisplaySize( renderer ) ) {
			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
		}

		renderer.render( scene, camera );

		requestAnimationFrame( render );

	}
	requestAnimationFrame( render );

}

main();
