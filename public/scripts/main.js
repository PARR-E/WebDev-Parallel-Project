//Last uploaded:		4/8/25		3:25 PM		0.0.5 (Better Collision and Offroad)
//Current version:		0.0.6 (Laps & Better Steering)
//Features added since last version: 
//	- Collision with pipes (need to change later).
//	- Changed order of collision capsule.

//COMMAND: npx vite

//Imports:
	import * as THREE from 'three';
	import WebGL from 'three/addons/capabilities/WebGL.js';
	import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
	
	import Stats from 'three/addons/libs/stats.module.js';
	import { Octree } from 'three/addons/math/Octree.js';
	import { OctreeHelper } from 'three/addons/helpers/OctreeHelper.js';
	
	import { Capsule } from 'three/addons/math/Capsule.js';
	import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
//Class imports:
	import gameLoop from "./GameLoop.js";
	import InputHandler from "./input.js";
	import Player from "./player.js";
	import Cube from "./objects/cube.js";
	import Pipe from "./objects/pipe.js";

//Variable initializations:
	const worldOctree = new Octree();		//Collision detector initialization.
	const offroadOctree = new Octree();		//Offroad detector initialization.
	
	var str_map = "N64 Mario Raceway";
	var f_mapScale = 1;
	var v_mapPos = new THREE.Vector3(0, 60, 0);
	
//Displaying username:
	//Do AJAX call to get name from getName.php, and append it to p_name.
	var url = "scripts/getName.php";
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.onreadystatechange = fn_displayName;
	request.send(null);
	
	function fn_displayName(){
		if(request.readyState == 4){	//4 makes sure that data has been gotten back.
			
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
		f_mapScale = .6;
		v_mapPos = new THREE.Vector3(-175, 35, -35);
	}
	else if(str_map == "N64 Block Fort"){
		f_mapScale = 1.05;
		v_mapPos = new THREE.Vector3(0, 60, 0);
	}
	else if(str_map == "SNES MC1"){
		v_mapPos = new THREE.Vector3(32, 20, 50);
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
	const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );	
	//1 of many types of cameras in JS.		  (FOV, aspect ratio, near (objs closer than near, or farther than far won't be rendered), far) 
	camera.position.set( 0, 0, 0 );
	//camera.lookAt( 0, 10, 0 );
	//scene.fog = new THREE.Fog( 0x88ccee, 0, 50 );

	//Renderer initialization:
	const renderer = new THREE.WebGLRenderer({alpha: true});
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	//Render background:
	if(str_map == "SNES MC1"){
		renderer.setClearColor( 0xe8f870, 1);
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
		const arr_objects = [];
		arr_objects.push(new Cube(scene, -55, 7.2, -60, 1));		//Cube #0
		arr_objects.push(new Cube(scene, -54, 7.2, -55.5, 1));	//Cube #1
		arr_objects.push(new Cube(scene, -54.5, 7.2, -52, 1));	//Cube #2
		arr_objects.push(new Cube(scene, -52, 7.2, -58, 1));		//Cube #3
		arr_objects.push(new Cube(scene, -51, 7.2, -54.5, 1));	//Cube #4
		arr_objects.push(new Cube(scene, -51.5, 7.2, -51, 1));	//Cube #5
	//Adding pipes:
		arr_objects.push(new Pipe(scene, -102, 7.22, -74.5, 2));
		arr_objects.push(new Pipe(scene, -102, 7.22, -65, 2));
		arr_objects.push(new Pipe(scene, -116, 7.22, -66, 2));
		arr_objects.push(new Pipe(scene, -116, 7.22, -81, 2));
		arr_objects.push(new Pipe(scene, -119.7, 7.22, 27, 2));
		arr_objects.push(new Pipe(scene, -103, 7.22, 40, 2));
		arr_objects.push(new Pipe(scene, -93, 7.22, 35.5, 2));
		arr_objects.push(new Pipe(scene, -52, 7.22, 21, 2));
		
	//Adding solid objects to the octree:
		for(let i = 0; i < arr_objects.length; i++){
			if(arr_objects[i].fn_getType() == "pipe"){
				worldOctree.fromGraphNode(arr_objects[i].fn_getCollider());
			}
			
		}

	//Adding line & cube:
		//Material for the line & circle:
		const material = new THREE.LineBasicMaterial( {color: 0x00ff00} );

	//A light is required for MeshPhongMaterial to be seen:
	/*const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
	directionalLight.position.set (1, 1, 3);
	//directionalLight.position.z = 3;
	scene.add(directionalLight);*/
	
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
	const player1 = new Player(scene, v_mapPos.x, v_mapPos.y, v_mapPos.z, 1, worldOctree);

//Variable initializations for game loop:
	//camera.position.z = 5;
	let spd = 0.000001;
	var int_frames = 0;
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
			if((currentTime - timer) >= 1000){
				//Displaying FPS:
					var fpsButton = document.getElementById("p_fps");
					var float_fps = int_frames;
					fpsButton.innerHTML = "FPS = " + float_fps;
				
				timer = currentTime;
				int_frames = 0;
				int_secsElapsed += 1;
			}
			
			var timeButton = document.getElementById("p_time");
			var str_secs = Math.abs((currentTime - timer) / 1000 + int_secsElapsed).toString();
			timeButton.innerHTML = "Time = " + str_secs.slice(0, 5);
			
			
		if(!b_paused){
			//Object animations:
			for(let i = 0; i < arr_objects.length; i++){
				arr_objects[i].fn_animate();
				//if(arr_objects[i].fn_getIsSolid()){
					//arr_objects[i].fn_wallCheck();
				//}
			}
			
			//Player input:
			player1.fn_play(camera, input);
				
			coordsButton.innerHTML = ("XYZ = (" + camera.position.x.toFixed(2) + ", " + camera.position.y.toFixed(2) + ", " + camera.position.z.toFixed(2) + ")");
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

//NEED THIS FOR HTML FILE TO RECOGNIZE FUNCTIONS:
//window.fn_pause= fn_pause;