<!--This is login.php-->
<?php
session_start();
include "scripts/connectToDatabase.php";			//Make sure directory is correct!

if(isset($_POST['username']) && isset($_POST['password'])){		//Making sure username & password from the form have value.
	
	//Validate data from the form:
	function validate($data){
		$data = trim($data);
		$data = stripslashes($data);
		$data = htmlspecialchars($data);
		return $data;
	}

	//Store username & password into variables:
	$username = validate($_POST['username']);
	$password = validate($_POST['password']);

	//If username or password is empty, display an error message:
	if(empty($username)){
		header("Location: index.html?error=Username is Required");
		exit();
	}
	else if(empty($password)){
		header("Location: index.html?error=Password is Required");
		exit();
	}
	
	//Query the database:
	$query = "SELECT * FROM Player WHERE username='$username' AND password='$password'";
	$result = mysqli_query($db, $query);

	if(mysqli_num_rows($result) === 1){
		$row = mysqli_fetch_assoc($result);
		
		//If password & username are in the DB:
		if($row['username'] === $username && $row['password'] === $password){
			//echo "Logged in.";
			
			//Save username & id to the session to persist across pages.
			$_SESSION['username'] = $row['username'];
			$_SESSION['ID'] = $row['ID'];
			
			header("Location: game.html");
			exit();
			
		}
		else{
			//If username/password doesn't match w/ the database.
			header("Location: index.html?error=Incorrect Username or Password");
			
		}
	}
	else{
		//If username/password isn't valid:
		header("Location: index.html?error=Invalid Username or Password");
		
	}
}
/*else {
    header("Location: index.php");
    exit();
}*/

//How to display error in index.php (according to ChatGPT)
/*
<?php if (isset($_GET['error'])): ?>
    <p style="color:red;"><?php echo $_GET['error']; ?></p>
<?php endif; ?>
*/
?>