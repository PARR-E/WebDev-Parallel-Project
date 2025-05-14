//Followed this tutorial: https://youtu.be/YczRHardTJI?si=RBdsB2vITmRuvtNY
export default class InputHandler{
	
	constructor(){
		this.lastkey = [null, null];
		
		this.char_kb_forward = "w";
		this.char_kb_back = "s";
		this.char_kb_left = "a";
		this.char_kb_right = "d";
		this.char_kb_accelerate = " ";
		//this.char_kb_brake = 16;
		this.char_kb_drift = "j";
		this.char_kb_item = "k";
		this.char_kb_rear = "l";
		this.char_kb_pause = "p";
		this.char_kb_LB = "q";
		this.char_kb_RB = "e";
		this.char_kb_fly = "f";
		
		this.b_kb_forward = false;
		this.b_kb_back = false;
		this.b_kb_left = false;
		this.b_kb_right = false;
		this.b_kb_accelerate = false;
		//this.b_kb_brake = false;
		this.b_kb_drift = false;
		this.b_kb_item = false;
		this.b_kb_rear = false;
		this.b_kb_pause = false;
		this.b_kb_LB = false;
		this.b_kb_RB = false;
		this.b_kb_fly = false;
		
		window.addEventListener('keydown', (e) => {
			switch(e.key){
				case this.char_kb_forward:
					this.lastkey[1] = "PRESS " + this.char_kb_forward;
					this.b_kb_forward = true;
					break;
				case this.char_kb_back:
					this.lastkey[1] = "PRESS " + this.char_kb_back;
					this.b_kb_back = true;
					break;
				case this.char_kb_left:
					this.lastkey[1] = "PRESS " + this.char_kb_left;
					this.b_kb_left = true;
					break;
				case this.char_kb_right:
					this.lastkey[1] = "PRESS " + this.char_kb_right;
					this.b_kb_right = true;
					break;
				case this.char_kb_accelerate:
					this.lastkey[1] = "PRESS " + this.char_kb_accelerate;
					this.b_kb_accelerate = true;
					break;
				/*case event.keyCode === this.char_kb_break:
					this.lastkey[1] = "PRESS " + this.char_kb_break;
					break;*/
				case this.char_kb_drift:
					this.lastkey[1] = "PRESS " + this.char_kb_drift;
					this.b_kb_drift = true;
					break;
				case this.char_kb_item:
					this.lastkey[1] = "PRESS " + this.char_kb_item;
					this.b_kb_item = true;
					break;
				case this.char_kb_rear:
					this.lastkey[1] = "PRESS " + this.char_kb_rear;
					this.b_kb_rear = true;
					break;
				case this.char_kb_pause:
					this.lastkey[1] = "PRESS " + this.char_kb_pause;
					this.b_kb_pause = true;
					break;
				case this.char_kb_LB:
					this.lastkey[1] = "PRESS " + this.char_kb_LB;
					this.b_kb_LB = true;
					break;
				case this.char_kb_RB:
					this.lastkey[1] = "PRESS " + this.char_kb_RB;
					this.b_kb_RB = true;
					break;
				case this.char_kb_fly:
					this.lastkey[1] = "PRESS " + this.char_kb_fly;
					this.b_kb_fly = true;
					break;
				default:
					break;
			}
			
			console.log(this.lastkey);
			if(this.lastkey[0] != this.lastkey[1]){
				//console.log("pressed");
			}
		});
		
		
		window.addEventListener('keyup', (e) => {
			switch(e.key){
				case this.char_kb_forward:
					this.lastkey[1] = "RELEASE " + this.char_kb_forward;
					this.b_kb_forward = false;
					break;
				case this.char_kb_back:
					this.lastkey[1] = "RELEASE " + this.char_kb_back;
					this.b_kb_back = false;
					break;
				case this.char_kb_left:
					this.lastkey[1] = "RELEASE " + this.char_kb_left;
					this.b_kb_left = false;
					break;
				case this.char_kb_right:
					this.lastkey[1] = "RELEASE " + this.char_kb_right;
					this.b_kb_right = false;
					break;
				case this.char_kb_accelerate:
					this.lastkey[1] = "RELEASE " + this.char_kb_accelerate;
					this.b_kb_accelerate = false;
					break;
				/*case event.keyCode === this.char_kb_break:
					this.lastkey[1] = "RELEASE " + this.char_kb_break;
					break;*/
				case this.char_kb_drift:
					this.lastkey[1] = "RELEASE " + this.char_kb_drift;
					this.b_kb_drift = false;
					break;
				case this.char_kb_item:
					this.lastkey[1] = "RELEASE " + this.char_kb_item;
					this.b_kb_item = false;
					break;
				case this.char_kb_rear:
					this.lastkey[1] = "RELEASE " + this.char_kb_rear;
					this.b_kb_rear = false;
					break;
				case this.char_kb_pause:
					this.lastkey[1] = "RELEASE " + this.char_kb_pause;
					this.b_kb_pause = false;
					break;
				case this.char_kb_LB:
					this.lastkey[1] = "RELEASE " + this.char_kb_LB;
					this.b_kb_LB = true;
					break;
				case this.char_kb_RB:
					this.lastkey[1] = "RELEASE " + this.char_kb_RB;
					this.b_kb_RB = true;
					break;
				case this.char_kb_fly:
					this.lastkey[1] = "RELEASE " + this.char_kb_fly;
					this.b_kb_fly = false;
					break;
				default:
					break;
			}
			
			console.log(this.lastkey);
		});
	}
	
	//Functions for pause input:
	fn_press_pause(){
		if(this.b_kb_pause && this.lastkey[0] != this.lastkey[1]){
			return true;
		}
		else{
			return false;
		}
	}
	
	//Function for forward input:
	fn_hold_forward(){
		if(this.b_kb_forward){
			return true;
		}
		else{
			return false;
		}
	}
	//Function for back input:
	fn_hold_back(){
		if(this.b_kb_back){
			return true;
		}
		else{
			return false;
		}
	}
	//Function for left input:
	fn_hold_left(){
		if(this.b_kb_left){
			return true;
		}
		else{
			return false;
		}
	}
	//Function for right input:
	fn_hold_right(){
		if(this.b_kb_right){
			return true;
		}
		else{
			return false;
		}
	}
	
	//Function for accelerate input:
	fn_hold_accelerate(){
		if(this.b_kb_accelerate){
			return true;
		}
		else{
			return false;
		}
	}
	
	//Function for drift input:
	fn_press_drift(){
		if(this.b_kb_drift && this.lastkey[0] != this.lastkey[1]){
			return true;
		}
		else{
			return false;
		}
	}
	fn_hold_drift(){
		if(this.b_kb_drift){
			return true;
		}
		else{
			return false;
		}
	}
	
	//Function for item input:
	fn_hold_item(){
		if(this.b_kb_item){
			return true;
		}
		else{
			return false;
		}
	}
	//Function for rear input:
	fn_hold_rear(){
		if(this.b_kb_rear){
			return true;
		}
		else{
			return false;
		}
	}
	
	//Function for LB input:
	fn_hold_LB(){
		if(this.b_kb_LB){
			return true;
		}
		else{
			return false;
		}
	}
	//Function for RB input:
	fn_hold_RB(){
		if(this.b_kb_RB){
			return true;
		}
		else{
			return false;
		}
	}
	
	//Function for flying toggle input:
	fn_press_fly(){
		if(this.b_kb_fly && this.lastkey[0] != this.lastkey[1]){
			return true;
		}
		else{
			return false;
		}
	}
	
	//Make sure array of inputs updates to kep track of it a :
	fn_updateLastKey(){
		this.lastkey[0] = this.lastkey[1];
		//console.log(this.lastkey);
	}
}