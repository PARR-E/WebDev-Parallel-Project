<?php
//A PHP script that checks if the username exists in the session
//(very simple script).

session_start();

if(isset($_SESSION['username'])){
	echo $_SESSION['username'];
}
else{
	echo "N/A";
}
?>