//Last uploaded:		6/8/25		5:44 PM		0.0.7 (Laps & Checkpoints)
//Current version:		0.0.8 (CSS & Nuanced Turning)
//Features added since last version: 
//	- Made the CSS elements and viewport size more responsive/dynamic.
//	- Made it so the scrollbar doesn't show up when fullscreen.
//	- Fixed the pixel ratio for 4K displays.
//	- Added item box and item box row objects.
//	- Timer now pauses when player finsihes all laps.
//	- Pause button now pauses timer.
//	- Game now recognises Shift as an input.
//	- Added onstant variables to player.js.
//	- Checkpoint & object locations scale with map scale.
//	- More nuanced turning (slow down, then back up in a U-curve).
//	- Standstill drifting.
//	- Airtime reduces speed (not counting jumping).
//	- Sliding while drifting (based on the player's current speed).

//Bugs to fix:
// 	- Not handling multiple inputs well while drifting. 
//	- Progress when going backwards in a track.

//COMMAND: npx vite

//Imports:
	import * as THREE from 'three';
	import WebGL from 'three/addons/capabilities/WebGL.js';
	import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
	
	import { Octree } from 'three/addons/math/Octree.js';
	import { OctreeHelper } from 'three/addons/helpers/OctreeHelper.js';
	
//Class imports:
	import gameLoop from "./GameLoop.js";
	import InputHandler from "./input.js";
	import Player from "./player.js";
	//Objects:
		import Checkpoint from "./objects/checkpoint.js";
		import Pipe from "./objects/pipe.js";
		import ItemBox from "./objects/itemBox.js";
		import ItemBoxRow from "./objects/itemBoxRow.js";

//Variable initializations:
	const a_objects = [];
	const a_checkpoints = [];
	
	const worldOctree = new Octree();		//Collision detector initialization.
	const offroadOctree = new Octree();		//Offroad detector initialization.
	
	var str_map = "SNES MC1";
	var f_mapScale = 1;
	var v_mapPos = new THREE.Vector3(0, 60, 0);
	var b_updateHUD = true;
	
	let int_numKeys;
	
//Displaying username:
	//Do AJAX call to get name from getName.php, and append it to p_name.
	var url = "scripts/getName.php";
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.onreadystatechange = fn_displayName;
	request.send(null);
	
	function fn_displayName(){
		if(b_updateHUD && request.readyState == 4){	//4 makes sure that data has been gotten back.
			
			var nameButton = document.getElementById("p_name");
			nameButton.innerHTML = "Logged in as " + request.responseText;
		}
	}
	
	
//Map scale:
	if(str_map == "testcourse1"){
		f_mapScale = 2;
		v_mapPos = new THREE.Vector3(36,8,-3);
	}
	else if(str_map == "3DS Daisy Hills"){
		f_mapScale = 0.09;
		v_mapPos = new THREE.Vector3(245,260,6);
	}
	else if(str_map == "N64 Mario Raceway"){
		f_mapScale = .75;
		v_mapPos = new THREE.Vector3(-220, 35, -35);
	}
	else if(str_map == "N64 Block Fort"){
		f_mapScale = 1.25;
		v_mapPos = new THREE.Vector3(0, 60, 0);
	}
	else if(str_map == "SNES MC1"){
		f_mapScale = 1.2;
		v_mapPos = new THREE.Vector3(40, 20, 25);
	}
	else if(str_map == "Wii Toad's Factory"){
		v_mapPos = new THREE.Vector3(-272, 40, -181);
	}
	else if(str_map == "WiiU Toad Harbor"){
		f_mapScale = 0.07;
		v_mapPos = new THREE.Vector3(-85, 50, 121);
	}
	

//Print a message if browser doesn't support WebGL2:
	if ( WebGL.isWebGL2Available() ) {
		// Initiate function or other initializations here
		//animate();
	} 
	else {
		const warning = WebGL.getWebGL2ErrorMessage();
		document.getElementById( 'container' ).appendChild( warning );
	}

//Initializing the scene:
	//3 things needed for anything: scene, camera, & renderer.
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000 );	
	//1 of many types of cameras in JS.		  (FOV, aspect ratio, near (objs closer than near, or farther than far won't be rendered), far) 
	//camera.position.set( 0, 0, 0 );
	//camera.lookAt( 0, 10, 0 );
	//scene.fog = new THREE.Fog( 0x88ccee, 0, 50 );

	//Renderer initialization:
	const renderer = new THREE.WebGLRenderer({
		antialias: true,
		alpha: true
	});
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));	//Sets ratio of CSS pixels to actual pixels. 1 is for 1080p screens, 2 is for 4K, 3 is for smartphone.
	renderer.setSize( window.innerWidth, window.innerHeight * .999);
	document.body.appendChild( renderer.domElement );

	//Renderer resize handler:
	window.addEventListener('resize', () => {
		//Update camera:
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();							//Tells three.js to update the camera.

		//Update renderer:
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));	//Order matters. Set ratio, then size.
		renderer.setSize(window.innerWidth, window.innerHeight * .999);

	}, false);

	//Render background:
	if(str_map == "SNES MC1"){
		renderer.setClearColor( 0xe8f870, 1);
		//Adding Checkpoints:
			a_checkpoints.push(new Checkpoint(scene, [30, 14, 7], 1, [.2, 16, 40], 1.5708, true, 0));
			a_checkpoints[0].fn_setGoal();
			a_checkpoints[0].fn_setNextKey(11);
			
			a_checkpoints.push(new Checkpoint(scene, [10, 14, -36], f_mapScale, [.2, 16, 70], 0, false, 1));
			a_checkpoints.push(new Checkpoint(scene, [4, 14, -40], f_mapScale, [.2, 16, 70], 0, false, 2));
			a_checkpoints.push(new Checkpoint(scene, [-2, 14, -46], f_mapScale, [.2, 16, 70], 0, false, 3));
			a_checkpoints.push(new Checkpoint(scene, [-8, 14, -50], f_mapScale, [.2, 16, 80], 0, false, 4));
			a_checkpoints.push(new Checkpoint(scene, [-15, 14, -55], f_mapScale, [.2, 16, 70], 0, false, 5));
			a_checkpoints.push(new Checkpoint(scene, [-20, 14, -55], f_mapScale, [.2, 16, 70], 0, false, 6));
			a_checkpoints.push(new Checkpoint(scene, [-30, 14, -55], f_mapScale, [.2, 16, 70], 0, false, 7));
			a_checkpoints.push(new Checkpoint(scene, [-40, 14, -55], f_mapScale, [.2, 16, 70], 0, false, 8));
			a_checkpoints.push(new Checkpoint(scene, [-50, 14, -55], f_mapScale, [.2, 16, 70], 0, false, 9));
			a_checkpoints.push(new Checkpoint(scene, [-60, 14, -55], f_mapScale, [.2, 16, 70], 0, false, 10));
			a_checkpoints.push(new Checkpoint(scene, [-70, 14, -55], f_mapScale, [.2, 16, 70], 0, true, 11));
			a_checkpoints[11].fn_setNextKey(24);
			a_checkpoints.push(new Checkpoint(scene, [-80, 14, -55], f_mapScale, [.2, 16, 70], 0, false, 12));
			a_checkpoints.push(new Checkpoint(scene, [-90, 14, -55], f_mapScale, [.2, 16, 70], 0, false, 13));
			a_checkpoints.push(new Checkpoint(scene, [-100, 14, -65], f_mapScale, [.2, 16, 50], 0, false, 14));
			a_checkpoints.push(new Checkpoint(scene, [-110, 14, -65], f_mapScale, [.2, 16, 50], 0, false, 15));
			a_checkpoints.push(new Checkpoint(scene, [-116, 14, -65], f_mapScale, [.2, 16, 50], 0, false, 16));
			a_checkpoints.push(new Checkpoint(scene, [-122, 14, -75], f_mapScale, [.2, 16, 35], 0, false, 17));
			
			a_checkpoints.push(new Checkpoint(scene, [-137, 14, -67], f_mapScale, [.2, 16, 30], 1.5708, false, 18));
			a_checkpoints.push(new Checkpoint(scene, [-133, 14, -57], f_mapScale, [.2, 16, 35], 1.5708, false, 19));
			a_checkpoints.push(new Checkpoint(scene, [-130, 14, -48], f_mapScale, [.2, 16, 40], 1.5708, false, 20));
			a_checkpoints.push(new Checkpoint(scene, [-130, 14, -40], f_mapScale, [.2, 16, 40], 1.5708, false, 21));
			a_checkpoints.push(new Checkpoint(scene, [-130, 14, -30], f_mapScale, [.2, 16, 40], 1.5708, false, 22));
			a_checkpoints.push(new Checkpoint(scene, [-130, 14, -20], f_mapScale, [.2, 16, 40], 1.5708, false, 23));
			a_checkpoints.push(new Checkpoint(scene, [-130, 14, -10], f_mapScale, [.2, 16, 40], 1.5708, true, 24));
			a_checkpoints[24].fn_setNextKey(37);
			a_checkpoints.push(new Checkpoint(scene, [-130, 14, 0], f_mapScale, [.2, 16, 40], 1.5708, false, 25));
			a_checkpoints.push(new Checkpoint(scene, [-130, 14, 10], f_mapScale, [.2, 16, 40], 1.5708, false, 26));
			a_checkpoints.push(new Checkpoint(scene, [-130, 14, 20], f_mapScale, [.2, 16, 40], 1.5708, false, 27));
			a_checkpoints.push(new Checkpoint(scene, [-135, 14, 30], f_mapScale, [.2, 16, 33], 1.5708, false, 28));
			a_checkpoints.push(new Checkpoint(scene, [-135, 14, 40], f_mapScale, [.2, 16, 33], 1.5708, false, 29));
			
			
			a_checkpoints.push(new Checkpoint(scene, [-118, 14, 45], f_mapScale, [.2, 16, 50], 0, false, 30));
			a_checkpoints.push(new Checkpoint(scene, [-109, 14, 35], f_mapScale, [.2, 16, 70], 0, false, 31));
			a_checkpoints.push(new Checkpoint(scene, [-100, 14, 32], f_mapScale, [.2, 16, 72], 0, false, 32));
			a_checkpoints.push(new Checkpoint(scene, [-90, 14, 32], f_mapScale, [.2, 16, 72], 0, false, 33));
			a_checkpoints.push(new Checkpoint(scene, [-80, 14, 32], f_mapScale, [.2, 16, 72], 0, false, 34));
			a_checkpoints.push(new Checkpoint(scene, [-70, 14, 32], f_mapScale, [.2, 16, 72], 0, false, 35));
			a_checkpoints.push(new Checkpoint(scene, [-60, 14, 32], f_mapScale, [.2, 16, 72], 0, false, 36));
			a_checkpoints.push(new Checkpoint(scene, [-50, 14, 42], f_mapScale, [.2, 16, 95], 0, true, 37));
			a_checkpoints[37].fn_setNextKey(0);
			a_checkpoints.push(new Checkpoint(scene, [-40, 14, 42], f_mapScale, [.2, 16, 95], 0, false, 38));
			a_checkpoints.push(new Checkpoint(scene, [-30, 14, 42], f_mapScale, [.2, 16, 95], 0, false, 39));
			a_checkpoints.push(new Checkpoint(scene, [-20, 14, 42], f_mapScale, [.2, 16, 95], 0, false, 40));
			a_checkpoints.push(new Checkpoint(scene, [-10, 14, 42], f_mapScale, [.2, 16, 95], 0, false, 41));
			a_checkpoints.push(new Checkpoint(scene, [0, 14, 42], f_mapScale, [.2, 16, 95], 0, false, 42));
			a_checkpoints.push(new Checkpoint(scene, [10, 14, 42], f_mapScale, [.2, 16, 95], 0, false, 43));
			
			
			
			a_checkpoints.push(new Checkpoint(scene, [30, 14, 50], f_mapScale, [.2, 16, 40], 1.5708, false, 47));
			a_checkpoints.push(new Checkpoint(scene, [30, 14, 45], f_mapScale, [.2, 16, 40], 1.5708, false, 48));
			a_checkpoints.push(new Checkpoint(scene, [30, 14, 40], f_mapScale, [.2, 16, 40], 1.5708, false, 49));
			a_checkpoints.push(new Checkpoint(scene, [30, 14, 35], f_mapScale, [.2, 16, 40], 1.5708, false, 50));
			a_checkpoints.push(new Checkpoint(scene, [30, 14, 30], f_mapScale, [.2, 16, 40], 1.5708, false, 51));
			a_checkpoints.push(new Checkpoint(scene, [30, 14, 25], f_mapScale, [.2, 16, 40], 1.5708, false, 52));
			a_checkpoints.push(new Checkpoint(scene, [30, 14, 20], f_mapScale, [.2, 16, 40], 1.5708, false, 53));
			a_checkpoints.push(new Checkpoint(scene, [30, 14, 15], f_mapScale, [.2, 16, 40], 1.5708, false, 54));
			a_checkpoints.push(new Checkpoint(scene, [30, 14, 10], f_mapScale, [.2, 16, 40], 1.5708, false, 55));
			
			int_numKeys = 4;
	}
	else{
		renderer.setClearColor( 0x74bcff, 1);
	}
	

//Loading objects into the scene:
	//Loading a 3D model (followed this tutorial https://youtu.be/WBe3xrV4CPM?si=qzzC8TYFBhorqRcs):
	const loader = new GLTFLoader();
	let courseModel;
	loader.load( 'assets/models/'+ str_map +'/main.glb',		//I should make a method for this. 
		function ( gltf ) {
			
			courseModel = gltf.scene;
			courseModel.position.set(0,0,0);
			courseModel.scale.set(f_mapScale, f_mapScale, f_mapScale);
			courseModel.visible = true;
			
			courseModel.updateMatrixWorld(true);
			worldOctree.fromGraphNode( courseModel );
			
			scene.add( courseModel );
			
		}, 
		undefined, function ( error ) {
			console.error( error );
		} 
	);
	
	let offroadModel;
	loader.load( 'assets/models/'+ str_map +'/offroad.glb', 
		function ( gltf ) {
			offroadModel = gltf.scene;
			offroadModel.position.set(0,0,0);
			offroadModel.scale.set(f_mapScale, f_mapScale, f_mapScale);
			offroadModel.visible = false;
			
			offroadModel.updateMatrixWorld(true);
			offroadOctree.fromGraphNode( offroadModel );
			
			scene.add( offroadModel );
		}, 
		undefined, function ( error ) {
			console.error( error );
		} 
	);
	
	let skyboxModel;
	loader.load( 'assets/models/'+ str_map +'/skybox.glb', 
		function ( gltf ) {
			skyboxModel = gltf.scene;
			skyboxModel.position.set(0,0,0);
			skyboxModel.visible = true;
			scene.add( skyboxModel );
		}, 
		undefined, function ( error ) {
			console.error( error );
		} 
	);
		
	//Adding cubes:
		a_objects.push(new ItemBoxRow(scene, [-53, 7.1, -61], f_mapScale, loader, 6, .85, 1));
	//Adding pipes:
		a_objects.push(new Pipe(scene, [-102, 7.19, -74.5], f_mapScale, 1));
		a_objects.push(new Pipe(scene, [-102, 7.19, -65], f_mapScale, 1));
		a_objects.push(new Pipe(scene, [-116, 7.19, -66], f_mapScale, 1));
		a_objects.push(new Pipe(scene, [-116, 7.19, -81], f_mapScale, 1));
		a_objects.push(new Pipe(scene, [-119.7, 7.19, 27], f_mapScale, 1));
		a_objects.push(new Pipe(scene, [-103, 7.22, 40], f_mapScale, 1));
		a_objects.push(new Pipe(scene, [-93, 7.22, 35.5], f_mapScale, 1));
		a_objects.push(new Pipe(scene, [-52, 7.22, 21], f_mapScale, 1));
		
	//Adding solid objects to the octree:
		for(let i = 0; i < a_objects.length; i++){
			if(a_objects[i].fn_getSolid()){
				worldOctree.fromGraphNode(a_objects[i].fn_getCollider());
			}
			
		}

	
	
	//A light is required for MeshPhongMaterial to be seen.
	//From a tutorial:
	function fn_addLight( position, _intensity ) {

		const color = 0xfffde6;
		//const light = new THREE.DirectionalLight( color, _intensity );
		//const light = new THREE.AmbientLight( color, _intensity );
		//scene.add( light );	
		const fillLight1 = new THREE.HemisphereLight( color, 0x77756a, 3 );
		fillLight1.position.set( 2, 2, 1 );
		scene.add( fillLight1 );

	}
	fn_addLight( [ - 3, 1, 1 ], 2.4);
	//fn_addLight( [ - 50, 200, 40 ], 10 );
	//fn_addLight( [ 2, 1, .5 ], 3);


//Adding player:
	const input = new InputHandler();
	const player1 = new Player(scene, [v_mapPos.x, v_mapPos.y, v_mapPos.z], 1, a_checkpoints.length, int_numKeys, 5);

//Variable initializations for game loop:
	//camera.position.z = 5;
	let spd = 0.000001;
	var int_frames = 0;
	let f_secs;
	var int_secsElapsed = 0;
	let timer = performance.now();
	var b_paused = false;
	var coordsButton = document.getElementById("p_coords");
	var int_skyBoxRotation = 0;
	
	
	const raycaster_course = new THREE.Raycaster();
	const direction_course = new THREE.Vector3(0, 1, 0); // Ray direction
	const raycaster_walls = new THREE.Raycaster();
	const direction_horizontal = new THREE.Vector3(1, 0, 0);
	
	const directions = [
		new THREE.Vector3(1, 0, 0),  // Right
		new THREE.Vector3(-1, 0, 0), // Left
		new THREE.Vector3(0, 0, 1),  // Forward
		new THREE.Vector3(0, 0, -1), // Backward
	];
	
	//const direction_horizontal = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0)];
	//const direction_right = new THREE.Vector3(1, 0, 0); // Ray direction
	//const direction_left = new THREE.Vector3(-1, 0, 0); // Ray direction
	let intersects;
	let intersectsLeft;
	let intersectsRight;

//The game loop:
	gameLoop.addCallback(() => {
		int_frames += 1;
		
		//Time initialization & printintg FPS:
			let currentTime = performance.now();
			if(b_updateHUD && (currentTime - timer) >= 1000){
				//Displaying FPS:
					var fpsButton = document.getElementById("p_fps");
					var float_fps = int_frames;
					fpsButton.innerHTML = "FPS = " + float_fps;
				
				timer = currentTime;
				int_frames = 0;
				int_secsElapsed += 1;
			}
			
			if(b_updateHUD){
				var timeButton = document.getElementById("p_time");
				
				f_secs = Math.abs((currentTime - timer) / 1000 + int_secsElapsed);
				timeButton.innerHTML = "TIME " + fn_formatTime(f_secs);
				//console.log("f_secs = " + f_secs);
			}
			
			
		if(!b_paused){
			b_updateHUD = true;
			
			//Update objects:
			for(let i = 0; i < a_objects.length; i++){
				a_objects[i].fn_animate(int_frames);
				
			}

			//Check for player collision with checkpoints:
			for(let i = 0; i < a_checkpoints.length; i++){
				if(a_checkpoints[i].fn_getDSOC() && a_checkpoints[i].fn_meshCollisionCheck(player1.fn_getHitbox())){
					//var boundingBox = new THREE.Box3().setFromObject(player1.fn_getPlayer());
					player1.fn_checkpointUpdate(a_checkpoints[i]);
					if(player1.fn_isFinished()){
						b_updateHUD = false;
					}
				}
			}
			
			//Player input:
			player1.fn_play(camera, input);
			if(b_updateHUD){
				coordsButton.innerHTML = ("XYZ = (" + camera.position.x.toFixed(2) + ", " + camera.position.y.toFixed(2) + ", " + camera.position.z.toFixed(2) + ")");
			}
		}
		else{
			b_updateHUD = false;
		}
		if(input.fn_press_pause()){
			if(b_paused){
				b_paused = false;
			}
			else{
				b_paused = true;
			}
			console.log("Paused");
		}
		
		//Colision:
			if(offroadModel){
				player1.fn_offroad(offroadOctree, true)
			}
			if(courseModel){
				player1.fn_collision(worldOctree, false);
			}
		
		if(skyboxModel && str_map != "SNES MC1"){
			skyboxModel.rotation.y += 0.0004;
		}
		player1.fn_update(camera, input);
		input.fn_updateLastKey();
		renderer.render( scene, camera );
	});
	gameLoop.start();

//Fime formatting function by ChatGPT:
function fn_formatTime(decimalString) {
    const totalSeconds = parseFloat(decimalString);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const milliseconds = Math.round((totalSeconds % 1) * 1000);

    // Pad seconds and milliseconds
    const paddedSeconds = seconds.toString().padStart(2, '0');
    const paddedMilliseconds = milliseconds.toString().padStart(3, '0');

    return `${minutes}:${paddedSeconds}:${paddedMilliseconds}`;
}