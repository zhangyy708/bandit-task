<?php

	// Create a database connection
	// NOTE!!! THIS LINE HAS BEEN DELETED SINCE THIS DIRECTORY CANNOT LINK TO THE DATABASE

	if (mysqli_connect_errno($mysqli)) {
		echo "Failed to connect to MySQL: " . mysqli_connect_error();
	};

    // Get values passed from JS
	$ip = $_SERVER['REMOTE_ADDR'];
    $subjectID = $_POST['subID'];
    $date_submit = date('Y-m-d');
    $duration_read = $_POST['duration_read'];
    $duration_task = $_POST['duration_task'];
    $duration_fill = $_POST['duration_fill'];
    $age_year = $_POST['age'];
    $gender = $_POST['gender'];
    $education_year = $_POST['education'];
    $strategy1 = $_POST['strategy1'];
    $strategy2 = $_POST['strategy2'];
    $feedback = $_POST['feedback'];
    $choices_2No = $_POST['choices_2No'];
    $choices_4No = $_POST['choices_4No'];
    $choices_8No = $_POST['choices_8No'];
    $choices_2Low = $_POST['choices_2Low'];
    $choices_4Low = $_POST['choices_4Low'];
    $choices_8Low = $_POST['choices_8Low'];
    $choices_2Mid = $_POST['choices_2Mid'];
    $choices_4Mid = $_POST['choices_4Mid'];
    $choices_8Mid = $_POST['choices_8Mid'];
    $choices_2High = $_POST['choices_2High'];
    $choices_4High = $_POST['choices_4High'];
    $choices_8High = $_POST['choices_8High'];
    $rewards_2No = $_POST['rewards_2No'];
    $rewards_4No = $_POST['rewards_4No'];
    $rewards_8No = $_POST['rewards_8No'];
    $rewards_2Low = $_POST['rewards_2Low'];
    $rewards_4Low = $_POST['rewards_4Low'];
    $rewards_8Low = $_POST['rewards_8Low'];
    $rewards_2Mid = $_POST['rewards_2Mid'];
    $rewards_4Mid = $_POST['rewards_4Mid'];
    $rewards_8Mid = $_POST['rewards_8Mid'];
    $rewards_2High = $_POST['rewards_2High'];
    $rewards_4High = $_POST['rewards_4High'];
    $rewards_8High = $_POST['rewards_8High']; 
    $conditions = $_POST['conditions'];  
    $sum_reward = $_POST['sum_reward'];   
    $money = $_POST['money'];

	//Create a query
    $query = "INSERT INTO yuyan_sl (ip, subjectID, date_submit, duration_read, duration_task, duration_fill, 
                                    age_year, gender, education_year, strategy1, strategy2, feedback, 
                                    choices_2No, choices_4No, choices_8No, choices_2Low, choices_4Low, 
                                    choices_8Low, choices_2Mid, choices_4Mid, choices_8Mid, choices_2High, 
                                    choices_4High, choices_8High, 
                                    rewards_2No, rewards_4No, rewards_8No, rewards_2Low, rewards_4Low, 
                                    rewards_8Low, rewards_2Mid, rewards_4Mid, rewards_8Mid, rewards_2High, 
                                    rewards_4High, rewards_8High, conditions, sum_reward, money) 
              VALUES ('{$ip}', '{$subjectID}', '{$date_submit}', '{$duration_read}', '{$duration_task}', '{$duration_fill}', 
                      '{$age_year}', '{$gender}', '{$education_year}', '{$strategy1}', '{$strategy2}', '{$feedback}', 
                      '{$choices_2No}', '{$choices_4No}', '{$choices_8No}', '{$choices_2Low}', '{$choices_4Low}', 
                      '{$choices_8Low}', '{$choices_2Mid}', '{$choices_4Mid}', '{$choices_8Mid}', '{$choices_2High}', 
                      '{$choices_4High}', '{$choices_8High}',
                      '{$rewards_2No}', '{$rewards_4No}', '{$rewards_8No}', '{$rewards_2Low}', '{$rewards_4Low}', 
                      '{$rewards_8Low}', '{$rewards_2Mid}', '{$rewards_4Mid}', '{$rewards_8Mid}', '{$rewards_2High}', 
                      '{$rewards_4High}', '{$rewards_8High}', '{$conditions}', '{$sum_reward}', '{$money}')";
	
	//Do it
	mysqli_query($mysqli, $query);

	//Close connection
	mysqli_close($mysqli);

?>
