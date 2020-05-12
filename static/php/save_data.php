<?php

	// Create a database connection
	$mysqli = mysqli_connect("chost4.is.ed.ac.uk","wwwbramleylabppl_neil","M2B(BKwEYa5.RXQ9", "wwwbramleylabppl_expdata");

	if (mysqli_connect_errno($mysqli)) {
		echo "Failed to connect to MySQL: " . mysqli_connect_error();
	}

	// Get values passed from JS
	$ip = $_SERVER['REMOTE_ADDR'];
    $subjectID = $_POST['token'];
    $date_end = $_POST['date'];
    $time_end = $_POST['time'];
    $instructions_duration = $_POST['instructions_duration'];
    $task_duration = $_POST['task_duration'];
    $age_year = $_POST['age'];
    $education_year = $_POST['education'];
    $feedback = $_POST['feedback'];
    $choices_2No = $_POST['choices_2No'];
    $choices_4No = $_POST['choices_4No'];
    $choices_8No = $_POST['choices_8No'];
    $choices_2Low = $_POST['choices_2Low'];
    $choices_4Low = $_POST['choices_4Low'];
    $choices_8Low = $_POST['choices_8Low'];
    $choices_2High = $_POST['choices_2High'];
    $choices_4High = $_POST['choices_4High'];
    $choices_8High = $_POST['choices_8High'];   
    $sum_reward = $_POST['sum_reward'];   
    $money = $_POST['money'];   

	//Create a query

	$query = "INSERT INTO yuyan_sl (ip, subjectID, date_end, time_end, instructions_duration, task_duration, age_year, education_year, feedback, choices_2No, choices_4No, choices_8No, choices_2Low, choices_4Low, choices_8Low, choices_2High, choices_4High, choices_8High, sum_reward, money) VALUES ('{$ip}', '{$subjectID}', '{$date_end}', '{$time_end}', '{$instructions_duration}', '{$task_duration}', '{$age_year}', '{$education_year}', '{$feedback}', '{$choices_2No}', '{$choices_4No}', '{$choices_8No}', '{$choices_2Low}', '{$choices_4Low}', '{$choices_8Low}', '{$choices_2High}', '{$choices_4High}', '{$choices_8High}', '{$sum_reward}', '{$money}')";
	//Do it
	mysqli_query($mysqli, $query);

	//Close connection
	mysqli_close($mysqli);

?>
