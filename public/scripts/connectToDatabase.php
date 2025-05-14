<?php
/*connectToDatabase.php
This file handles the connection to the database CrowDB.
Values for location, password, username, etc should be secure.

*/

//include("../../../../htpasswd/database.inc");

$dbLocation = "localhost";
$dbName = "crowDB";
$dbUsername = "jaredcrow";
$dbPassword = "201544";

if (!isset($dbLocation))
{
    echo "Database location is missing.<br>
          Connection script now terminating.";
    exit(0);
}

if (!isset($dbUsername))
{
    echo "Database username is missing.<br>
          Connection script now terminating.";
    exit(0);
}

if (!isset($dbPassword))
{
    echo "Database password is missing.<br>
          Connection script now terminating.";
    exit(0);
}

if (!isset($dbName))
{
    echo "Database name is missing.<br>
          Connection script now terminating.";
    exit(0);
}

$db = mysqli_connect($dbLocation,
                     $dbUsername,
                     $dbPassword,
                     $dbName);

if (mysqli_connect_errno() || ($db == null))
{
    printf("Database connection failed: %s<br>
           Connection script now terminating.",
           mysqli_connect_error());
    exit(0);
}
/*else
{
	$query = "INSERT INTO Player(
		username,
		password,
		ID,
		VR,
		BR,
		timePlayed,
		bestTime_SNESMC1,
		bestTime_N64Raceway
	)
	VALUES (
		'John Doe',
		'12345',
		0,
		1000,
		1000,
		0.0,
		NULL,
		NULL
	);";
	mysqli_query($db, $query);
}*/
?>

