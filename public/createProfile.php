<!--This is createProfile.php-->
<?php
session_start();
include "scripts/connectToDatabase.php";			//Make sure directory is correct!

if(isset($_POST['username']) && isset($_POST['newPassword']) && isset($_POST['confirmPassword'])){		//Making sure username & password from the form have value.
	
	//Validate data from the form:
	function validate($data){
		$data = trim($data);
		$data = stripslashes($data);
		$data = htmlspecialchars($data);
		return $data;
	}

	//Store username & password into variables:
	$username = validate($_POST['username']);
	$password = validate($_POST['newPassword']);
	$confirmPassword = validate($_POST['confirmPassword']);

	//If username or password is empty, display an error message:
	if(empty($username)){
		header("Location: newProfile.html?error=Username is Required");
		exit();
	}
	else if(empty($password)){
		header("Location: newProfile.html?error=Password is Required");
		exit();
	}
	else if(empty($confirmPassword)){
		header("Location: newProfile.html?error=Password confirmation is Required");
		exit();
	}
	
	//Query for the database (let the DB do the heavy listing for the ID):
	
	$query = "INSERT INTO Player(
		username,
		password,
		VR,
		BR,
		timePlayed,
		bestTime_SNESMC1,
		bestTime_N64Raceway
	)
	VALUES (
		'$username',
		'$password',
		1000,
		1000,
		0.0,
		NULL,
		NULL
	);";
	
	
	//Make sure username isn't already in the DB:
	$usernameQuery = "SELECT * FROM Player WHERE username='$username'";
	$usernameCheck = mysqli_query($db, $usernameQuery);
	
	if(mysqli_num_rows($usernameCheck) > 0){
		//If username is taken:
		header("Location: newProfile.html?error=Username is already in use.");
	}
	else if($password === $confirmPassword){
		//Username isn't taken:
		$result = mysqli_query($db, $query);		//Returns an ID, not an int or string.
			
		header("Location: index.html");
		exit();
	}
	else{
		header("Location: newProfile.html?error=Passwords don't match.");
	}

	
}

//How to display error in index.php (according to ChatGPT)
/*
<?php if (isset($_GET['error'])): ?>
    <p style="color:red;"><?php echo $_GET['error']; ?></p>
<?php endif; ?>
*/
?>