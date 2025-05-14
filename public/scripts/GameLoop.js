//Tutorial used: https://youtu.be/ALK0OFQlEto?si=XML3nZSgX_rjWUE1 

class GameLoop{
	constructor(){
		this.flag = false;		//Boolean value that changes based on loop is running or not.
		this.callbacks = [];
	}
	
	addCallback(callback){
		this.callbacks.push(callback);
	}
	removeCallback(callback){
		this.callbacks = this.callbacks.filter(cb => cb != callback);		//"Not the most efficient way, but for the moment is okay."
	}
	
	run(){
		//If flag becomes false, stop running:
		if(!this.flag){
			return;
		}
		//Iterate the array in order to execute every callback we have in the array callbacks:
		this.callbacks.forEach(cb => cb());
		//Native JS function. Is executed when full page is rendered by browser:	
		requestAnimationFrame(this.run.bind(this));		//This makes the function know value of local this.flag.
	}
	start(){
		//If flag is true, cancel start.
		if(this.flag){
			return;
		}
		this.flag = true;
		this.run();
	}
	stop(){
		this.flag = false;
	}
}

const gameLoop = new GameLoop();

export default gameLoop;