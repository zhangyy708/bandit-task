$(document).ready(function () {
    // only for debugging ----------------------------------------------------------------------------------------------------
    // var imageSrc = '/bandit-task/static/images'; // Github
    var imageSrc = '/static/images'; // local testing
    
    // initialising variables ------------------------------------------------------------------------------------------------
    // adjustable
    var numTrials = 15; // number of trials
    var fadeTime = 200; // fade out time (after reward being displayed in each trial)
    var stayTime = 200; // result stay time (after reward being displayed in each trial)
    var movePoint = 500; // moving time for the point
    var stayPoint = 100; // point stay time
    var fadePoint = 100; // point fade out time

    var teacher = { // numArms + teacherPerform (see matlab file experiment.m)
        "2Low": [2, 1, 2, 2, 1, 1, 1, 2, 2, 1, 1, 2, 1, 1, 2],
        "2High": [2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        "4Low": [4, 1, 4, 3, 4, 1, 3, 1, 2, 3, 1, 1, 2, 3, 1],
        "4High": [4, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        "8Low": [6, 1, 5, 2, 7, 2, 5, 6, 5, 5, 1, 7, 7, 7, 4],
        "8High": [2, 2, 3, 7, 7, 7, 7, 7, 8, 7, 2, 2, 6, 5, 5]
    };
    
    // random surnames from https://en.geneanet.org/genealogy/ popularity around 1,000,000
    var names = {
        "2No": "None",
        "4No": "None",
        "8No": "None",
        "2Low": "Foster",
        "4Low": "Russell",
        "8Low": "Reed",
        "2High": "Hamilton",
        "4High": "Fisher",
        "8High": "Bennett"
    };

    var ps = { // generated from Beta(2, 2) (see matlab file experiment.m)
        "2No": [0.6587, 0.0749],
        "4No": [0.7287, 0.4253, 0.6671, 0.1911],
        "8No": [0.2965, 0.6915, 0.4265, 0.2132, 0.3079, 0.2206, 0.3604, 0.4732],
        "2Low": [0.7091, 0.5989],
        "4Low": [0.3495, 0.2870, 0.6070, 0.3308],
        "8Low": [0.3553, 0.4551, 0.4378, 0.5093, 0.6155, 0.4025, 0.3933, 0.7649],
        "2High": [0.4356, 0.6446],
        "4High": [0.5069, 0.7603, 0.8165, 0.1660],
        "8High": [0.8031, 0.2143, 0.2514, 0.1146, 0.3846, 0.2437, 0.6357, 0.1272]
    }

    // system
    var isTeacher; // whether their is a demonstrator
    var teacherPerform; // which teacher

    var numArms; // number of arms
    var p = new Array(); // probability array
    var t = Array(numTrials); // teacher's choices array
    var order = new Array(); // doors' order array
    var sumReward = 0; // total rewards a participant already gets
    var tempReward = 0; // rewards in a single game

    var startTime = new Date(); // the time the experiment starts
    var startTaskTime; // the time the task starts
    var subID = generateToken(10); // random ID for each participant
    var year; // birth year of the subject
    var edu; // years of formal education that the subject has received

    var subChoice = { // numArms + teacherPerform
        "2Low": [],
        "2High": [],
        "4Low": [],
        "4High": [],
        "8Low": [],
        "8High": [],
        "2No": [],
        "4No": [],
        "8No": []
    };
    var subChoiceReorder = subChoice; // re-ordered subject choices; this will be sent to database

    var conditions = ["2Low", "2High", "4Low", "4High", "8Low", "8High", "2No", "4No", "8No"];
    conditions.sort(function () { // randomising conditions
        return Math.random() - 0.5;
    });

    var numGames = 1; // initialising; interation inside options()

    // styling ---------------------------------------------------------------------------------------------------------------
    var thisHeight = document.body.clientHeight * 0.9;
    var thisWidth = document.body.clientWidth * 0.9; // width = height * 4/3
    if (thisWidth < thisHeight * 4 / 3) {
        thisHeight = thisWidth * 3 / 4;
    } else {
        thisWidth = thisHeight * 4 / 3;
    }
    var dispWidth = thisHeight * 5 / 6;
    var dispHeight = dispWidth / 2;
    $('#Main').css('min-height', thisHeight);
    $('#Main').css('width', thisWidth);

    var spacing = '<br><br>'; // in trials, the spacing between title and images

    // checking pc or phone/pad
    if (isMobile() || isMobileOrTablet()) {
        alert('Unfortunately, you need to be on a desktop or laptop computer in order to take part in this experiment.' + 
              ' In any case thank you very much for the interest.')
    } else {
        // alert('pc端');
        // para(1); // for testing; changing parameters

        // for testing; fixed parameters
        // numArms = 2; 
        // isTeacher = true;
        // teacherPerform = 'Low';
        // options(1);

        // formal
        expRewardsRandom(); // calculating the expected rewards of random policy
        expRewardsBest(); // calculating the largest total rewards possible
        expRewardsOpt(); // calculating the expected rewards of optimal policy 
        // (always choosing the option with the highest reward rate)
        information();
    }


    // full games -----------------------------------------------------------------------------------------------------------
    // var numGames = 1; // initialising; interation inside options()
    function ran() { // used inside instructions()
        sumReward = sumReward + tempReward;
        tempReward = 0;
        
        if (numGames >= 2) {            
            for (i = 0; i < numTrials; i++) { // re-ordering participants' choices
                var temp = subChoice[numArms + teacherPerform][i];
                subChoiceReorder[numArms + teacherPerform][i] = order[temp - 1];
            };
        };

        if (numGames > conditions.length) {
            end();
        } else {
            numArms = parseInt(conditions[numGames - 1].substring(0, 1));
            isTeacher = conditions[numGames - 1].substring(1) !== "No";
            teacherPerform = conditions[numGames - 1].substring(1);

            order = Array.from({ length: numArms }, (item, index) => index + 1); // generating an array like [1, 2, 3, 4]
            order.sort(function () { // randomising doors' order in a game
                return Math.random() - 0.5;
            });

            for (i = 0; i < numArms; i++) {
                p[i] = ps[conditions[numGames - 1]][order[i] - 1]; // reordering the reward rates
            };

            if (isTeacher) {
                for (i = 0; i < numTrials; i++) {
                    t[i] = order.indexOf(teacher[conditions[numGames - 1]][i]) + 1; // reordering the choices of the teacher
                };
                // isTeacherDisplay = "Yes";
            } else {
                // isTeacherDisplay = "No";
            };
            isTeacherDisplay = names[conditions[numGames - 1]];



            $('#Top').css('height', thisHeight / 20);
            $('#Stage').css('width', dispWidth);
            $('#Stage').css('height', thisHeight * 17 / 20);
            $('#Bottom').css('min-height', thisHeight / 20);

            createDiv('Stage', 'TextBoxDiv0');
            $('#TextBoxDiv0').css('font-size', '16px');
            $('#TextBoxDiv0').css('padding-top', '20%');

            // var title = '<div id="Title"><h2 align="center">' + 'Game No. ' +
            //     '<span style="color:red;">' + numGames + '</span><br>' +
            //     'Number of doors: ' + '<span style="color:red;">' + numArms + '</span><br>' +
            //     'Is there a demonstrator: ' + '<span style="color:red;">' + isTeacherDisplay + '</span><br><br>' +
            //     'You already got ' + '<span style="color:red;">' +
            //     sumReward + '</span> coins in this experiment!' + '</h2><div>';
            var title = '<div id="Title"><h2 align="center">' + 'Game No. <b>' + numGames + '</b><br>' +
                        'Number of doors: <b>' + numArms + '</b><br>' +
                        'Demonstrator: <b>' + isTeacherDisplay + '</b><br><br>' +
                        'You\'ve got <b>' + sumReward + '</b> coins in this study!' + '</h2><div>';
            $('#TextBoxDiv0').html(title);

            var buttons = '<div align="center"><input align="center" type="button" class="btn btn-default"' +
                ' id="toTrial" value="Start!"></div>';
            $('#Bottom').html(buttons); // click button to proceed

            $('#toTrial').click(function () {
                $('#TextBoxDiv0').remove();
                $('#Stage').empty();
                $('#Bottom').empty();
                options(1);
            });

            // setTimeout(function() {
            //     $('#TextBoxDiv0').empty();
            //     $('#TextBoxDiv0').remove();
            //     options(1);
            // }, 1500); 
        };
    };


    // choosing parametres ---------------------------------------------------------------------------------------------------
    function para(pageNum) {
        $('#Top').css('height', thisHeight / 20);
        $('#Stage').css('width', dispWidth);
        $('#Stage').css('min-height', thisHeight * 17 / 20);
        $('#Bottom').css('min-height', thisHeight / 20);
        createDiv('Stage', 'Title');
        createDiv('Stage', 'TextBoxDiv');
        $('#TextBoxDiv').css('font-size', '16px');
        $('#TextBoxDiv').css('padding-top', '20%');

        var title = '<h3 align="center">Choosing parameters for testing the experiment</h3>';

        switch (pageNum) {
            case 1:
                var info1 = '<p align="center">Number of arms<br></p>';

                var buttons = '<div align="center">' +
                    '<input align="center" type="button" class="btn btn-default" id="num2" value="2">' +
                    '<input align="center" type="button" class="btn btn-default" id="num4" value="4">' +
                    '<input align="center" type="button" class="btn btn-default" id="num8" value="8">' +
                    '</div>';

                // var info2 = '<p align="center"><br>Other parameters (under development...)</p>'; 
                $('#Title').html(title)
                $('#TextBoxDiv').html(info1 + buttons);

                $('#num2').click(function () {
                    numArms = 2;
                    $('#TextBoxDiv').remove();
                    $('#Stage').empty();
                    $('#Bottom').empty();
                    para(2);
                });

                $('#num4').click(function () {
                    numArms = 4;
                    $('#TextBoxDiv').remove();
                    $('#Stage').empty();
                    $('#Bottom').empty();
                    para(2);
                });

                $('#num8').click(function () {
                    numArms = 8;
                    $('#TextBoxDiv').remove();
                    $('#Stage').empty();
                    $('#Bottom').empty();
                    para(2);
                });
                break;

            case 2:
                var info1 = '<p align="center">Demonstrator<br>' +
                    '(currently the choices of demonstrators are not properly defined)<br>' +
                    '(and there might be some bug in the first trial)<br>' +
                    '</p>';

                var buttons = '<div align="center">' +
                    '<input align="center" type="button" class="btn btn-default" id="tea0" value="No demonstrator">' +
                    '<input align="center" type="button" class="btn btn-default" id="tea1" value="Low performance">' +
                    '<input align="center" type="button" class="btn btn-default" id="tea2" value="High performance">' +
                    '</div>';

                var info2 = '<p align="center"><br>Other parameters (under development...)</p>';
                $('#Title').html(title)
                $('#TextBoxDiv').html(info1 + buttons + info2);

                $('#tea0').click(function () {
                    isTeacher = false;
                    $('#TextBoxDiv').remove();
                    $('#Stage').empty();
                    $('#Bottom').empty();
                    information();
                });

                $('#tea1').click(function () {
                    isTeacher = true;
                    teacherPerform = 'Low';
                    $('#TextBoxDiv').remove();
                    $('#Stage').empty();
                    $('#Bottom').empty();
                    information();
                });

                $('#tea2').click(function () {
                    isTeacher = true;
                    teacherPerform = 'High';
                    $('#TextBoxDiv').remove();
                    $('#Stage').empty();
                    $('#Bottom').empty();
                    information();
                });

                break;
        };
    };


    // information page ------------------------------------------------------------------------------------------------------
    function information() {
        $('#Top').css('height', thisHeight / 20);
        $('#Stage').css('width', dispWidth);
        $('#Stage').css('min-height', thisHeight * 17 / 20);
        $('#Bottom').css({
            'height': thisHeight / 20,
            'position': 'absolute',
            'width': thisWidth,
            'top': bottomPos
        });
        createDiv('Stage', 'Title');
        createDiv('Stage', 'TextBoxDiv');

        $('#TextBoxDiv').css('font-size', '16px');
        $('#TextBoxDiv').css('padding-top', '5%');

        var title = '<h2 align="center">Information for Participants</h2>'; // header
        // var info = 'Thanks for participating in this experiment!<br><br>' +
        //     'In this experiment, you will be asked to choose repeatedly among multiple options, each of which is associated ' +
        //     'a certain probability of getting additional rewards. Your final compensation will be dependent on your choices. ' +
        //     'More instructions on the task could be found on next pages.<br><br>' +
        //     'Your session should last for up to 10 minutes. You will be paid ￡1~1.5 (based on your choices in the task) ' +
        //     'for your participation. ' +
        //     'You need to be over 18 years old to participate in this study.<br><br>' +
        //     'Please check <a href="webexperiment_consent_gdpr_filled.pdf" target="_blank">this pdf file</a> ' +
        //     'for more information on how your data will be stored and used and your rights to withdraw. ' +
        //     // 'Your personal data will not be shared outside the research team. You have the right to withdraw ' +
        //     // 'at any time, and you can contact the research team after completing this study to withdraw ' +
        //     // 'before August 1st 2020. Your data will be deleted if you withdraw. ' +
        //     'If you have any question about this study, please feel free to contact Y.Zhang-327@sms.ed.ac.uk<br><br><br>' +
        //     'By continuing to next pages, you consent to the following: <br><br>'
        // var ticks = '<input type="checkbox" name="consent" value="consent">I agree to participate in this study.<br>' +
        //     '<input type="checkbox" name="consent" value="consent">' +
        //     'I confirm that I have read and understood how my data will be stored and used.<br>' +
        //     '<input type="checkbox" name="consent" value="consent">' +
        //     'I understand that I have the right to terminate this session at any point. ' +
        //     'If I choose to withdraw after completing the study (before August 1st 2020), ' +
        //     'my data will be deleted at that time.<br>'
        var info = '<div class="scroll_text" id="consent-info">' +
                   '<p><b>Nature of the study.&nbsp;</b>You are invited to participate in a study which involves choosing ' +
                       'repeatedly among multiple pictures, each of which is associated with a certain probability of ' + 
                       'getting additional rewards. Your final compensation in this experiment will be dependent on your ' + 
                       'choices. After the experiment, we will ask you you to provide some basic demographics (e.g., age). ' + 
                       'Your session should last for up to 10 minutes. You will be given full instructions shortly.</p>' +
                    '<p><b>Compensation.&nbsp;</b>You will be paid $1~1.50 for your participation.</p>' + 
                    '<p><b>Risks and benefits.&nbsp;</b>There are no known risks to participation in this study. ' + 
                        'Other than the payment mentioned, there no tangible benefits to you, however you will be ' + 
                        'contributing to our knowledge about reasoning and information integration.</p>' +
                    '<p><b>Confidentiality and use of data.&nbsp;</b>All the information we collect during the course of ' + 
                        'the research will be processed in accordance with Data Protection Law. In order to safeguard your ' + 
                        'privacy, we will never share personal information (like names or dates of birth) with anyone ' + 
                        'outside the research team; if you agree and want to be contacted for future studies, we will add ' + 
                        'your contact details to our secure participant database. Your data will be referred to by a unique ' + 
                        'participant number rather than by name. Please note that we will temporarily collect your worker ID ' + 
                        'to prevent repeated participation, however we will never share this information with anyone outside ' + 
                        'the research team. We will store any personal data (e.g., audio/video recordings, signed forms) ' + 
                        'using a password protected, encrypted hard drive. The anonymized data collected during this study ' + 
                        'will be used for research purposes. With your permission, identifiable data such as recordings may ' + 
                        'also be used for research or teaching purposes, and may be shared with other researchers or with ' + 
                        'the general public (e.g., we may make it available through the world wide web, or use it in TV or ' + 
                        'radio broadcasts).</p>' +
                    '<p><b>What are my data protection rights?&nbsp;</b>The University of Edinburgh is a Data Controller ' + 
                        'for the information you provide. You have the right to access information held about you. Your ' +
                        'right of access can be exercised in accordance with Data Protection Law. You also have other ' + 
                        'rights including rights of correction, erasure and objection.  For more details, including the ' + 
                        'right to lodge a complaint with the Information Commissioner’s Office, please visit ' + 
                        'www.ico.org.uk. Questions, comments and requests about your personal data can also be sent to ' + 
                        'the University Data Protection Officer at <a href="mailto:dpo@ed.ac.uk">dpo@ed.ac.uk</a>.</p>' +
                    '<p><b>Voluntary participation and right to withdraw.&nbsp;</b>Your participation is voluntary, and ' + 
                        'you may withdraw from the study at any time and for any reason. If you withdraw from the study ' + 
                        'during or after data gathering, we will delete your data and there is no penalty or loss of ' + 
                        'benefits to which you are otherwise entitled.</p>' +
                    '<p>If you have any questions about what you’ve just read, please feel free to ask, or contact us later. ' +
                        'You can contact us by email at <a href="mailto:bramleylab@ed.ac.uk">bramleylab@ed.ac.uk</a>. This ' + 
                        'project has been approved by PPLS Ethics committee. If you have questions or comments regarding ' + 
                        'your own or your child’s rights as a participant, they can be contacted at 0131 650 4020 or ' + 
                        '<a href="mailto:ppls.ethics@ed.ac.uk">ppls.ethics@ed.ac.uk</a>.</p>' +
                    '<p>By accepting this HIT, you consent to the following:</p>' + 
                    '<ol>' + 
                        '<li><b>I agree to participate in this study.</b></li>' + 
                        '<li>I confirm that I am at least <b>18 years</b> old or older. </li>' +
                        '<li>I confirm that I have read and understood <b>how my data will be stored and used</b>.</li>' +
                        '<li>I understand that I have the right to <b>terminate this session</b> at any point. </li>' +
                    '</ol>' +
                '</div>';
        var title2 = '<h2 align="center">Thank you for joining our experiment</h2>';
        var info2 = '<div id="reminder">' + 
                        '<p>Please note that:</p>' +
                        '<ul>' +
                            '<li>You will have to complete a comprehension quiz before you can start the experiment.</li>' +
                            '<li>Please minimize the chances of possible distractions -' +
                            ' switch off messengers, music, etc.</li>' +
                            '<li>Please use full-screen mode.</li>' +
                            '<li>You <b>can not</b> use a mobile phone or tablet.</li>' + 
                            // '<li>You <b>can only</b> participate if you use Google Chrome.</li>' +
                            '<li>Do not refresh this page during the experiment.</li>' +
                        '</ul>' +
                    '</div>';

        $('#Title').html(title);
        $('#TextBoxDiv').html(info);

        $('.scroll_text').css({
            'height': thisHeight * 14 / 20,
            'overflow': 'scroll'});

        var buttons = '<div align="center"><input align="center" type="button" class="btn btn-default"' +
            ' id="toReminder" value="Accept HIT" disabled></div>';
        var buttons2 = '<div align="center"><input align="center" type="button" class="btn btn-default"' +
            ' id="startExp" value="Understood"></div>';
        // '<a class="button" href="flask_bel_updating"><span>Understood</span></a>'
        $('#Bottom').html(buttons); // click button to proceed

        $('#consent-info').scroll(function() {
            if ($(this)[0].scrollHeight - $(this).scrollTop() <= $(this).outerHeight()) {
                   $('#toReminder').prop('disabled', false);
            };
        });

        $('#toReminder').click(function () {
            $('#Title').empty();
            $('#TextBoxDiv').empty();
            $('Bottom').empty();
            $('#Title').html(title2);
            $('#TextBoxDiv').html(info2);
            $('#Bottom').html(buttons2);

            $('#startExp').click(function () {
                $('#Title').remove();
                $('#TextBoxDiv').remove();
                $('#Stage').empty();
                $('#Bottom').empty();
                // form();
                instructions(1); // move to the first page of instrcutions
            });

        });

        
    };

    // form page -------------------------------------------------------------------------------------------------------------
    function form() { //!!!!!!put at the end of the experiment
        $('#Top').css('height', thisHeight / 20);
        $('#Stage').css('width', dispWidth);
        $('#Stage').css('min-height', thisHeight * 17 / 20);
        $('#Bottom').css({
            'height': thisHeight / 20,
            'position': 'absolute',
            'width': thisWidth,
            'top': bottomPos
        });
        createDiv('Stage', 'Title');
        createDiv('Stage', 'TextBoxDiv');

        $('#TextBoxDiv').css('font-size', '16px');
        $('#TextBoxDiv').css('padding-top', '20%');

        var title = '<h2 align="center">Demographic Information</h2>'; // header
        var info = 'Please answer the following questions. This data will not be shared outside the research team.<br><br>' +
            'In which year were you born? ' + '<input type="number" id="year"><br><br>' +
            'How many years have you received formal education (counting from elementary school)? ' +
            '<input type="number" id="edu"><br><br>' +
            'Click "Next" button below to submit and continue to task instructions.'
        $('#Title').html(title);
        $('#TextBoxDiv').html(info);

        var buttons = '<div align="center"><input align="center" type="button" class="btn btn-default"' +
            ' id="toInstructions" value="Next"></div>';
        $('#Bottom').html(buttons); // click button to proceed

        $('#toInstructions').click(function () {
            year = $("#year").val();
            edu = $("#edu").val();

            if (isNaN(year) || isNaN(edu) || year === "" || edu === "") {
                alert('Please enter a number.');
            } else if (year % 1 !== 0 || edu % 1 !== 0) {
                alert('Please enter an integer.');
            } else if (year < 1900 || year > 2003 || edu < 0 || edu > 50) {
                alert('Please enter a valid number.');
            } else {
                $('#Title').remove();
                $('#TextBoxDiv').remove();
                $('#Stage').empty();
                $('#Bottom').empty();
                instructions(1); // move to the first page of instrcutions
            };
        });
    };

    var bottomPos = $('#Bottom').position().top; // to align the position of the buttons

    // instructions ----------------------------------------------------------------------------------------------------------
    function instructions(pageNum) {
        $('#Top').css('height', thisHeight / 20);
        $('#Stage').css('width', dispWidth);
        $('#Stage').css('min-height', thisHeight * 7 / 20);
        $('#Bottom').css({
            'height': thisHeight / 20,
            'position': 'absolute',
            'width': thisWidth,
            'top': bottomPos
        });
        var numPages = 3; // number of pages of instruction
        var picHeight = dispWidth / 2;
        createDiv('Stage', 'Title');
        createDiv('Stage', 'TextBoxDiv');

        $('#TextBoxDiv').css('font-size', '16px');
        $('#TextBoxDiv').css('padding-top', '5%');


        var title = '<h2 align="center">Instructions</h2>';
        switch (pageNum) {
            case 1:
                var info = '<i>***Please remember to read all instructions <b>carefully</b>. ' + 
                    'You will have to complete a <b>comprehension quiz</b> at the end of the instructions.***</i><br><br>' +
                    'Thanks for participanting!<br><br>' + 
                    'In this experiment, you will choose among 2 (or 4 or 8) doors, each of which ' +
                    'has a <b>fixed</b> but <b>different</b> probability of hiding a coin.' +
                    'You can choose the door by clicking on it with your mouse.<br><br>' +
                    'Your goal is to collect as many coins as possible. ' +
                    'For every 2 coins you collect in the task, you will earn additional $0.01.<br>'
                break;
            case 2:
                var info = 'There are ' + conditions.length + ' different games in this experiment, ' + 
                    'and in some of the games, before making your decision, you can see the choice ' + 
                    'of a previous player (<b>demonstrator</b>) ' +
                    'who has played <b>exactly the same game</b> as you are playing.<br><br>' +
                    'The demonstrator\'s choice will be shown as the cartoon finger.<br><br>' +
                    'Each game has a <b>different demonstrator</b>, who might perform well or badly. ' + 
                    'The surname of the demonstrator will be displayed before each game starts.';
                break;
            case 3:
                var info = 'After each decision, you will see the outcome of your choice - coin or nothing. ' +
                    'You will then continue directly to the next trial. ' +
                    'At the end of each game, you will see how many coins you have earned in total.<br><br>' +
                    'There are ' + numTrials + ' trials in each game, ' +
                    conditions.length + ' games in this experiment.' +
                    'This experiment takes 5~10 minutes to complete on average.<br><br>' +
                    'Click "Comprehension quiz" to continue.';
                break;
            default:
                var info;
                break;
        };

        var thisImage = '<div align="center"><img src="' + imageSrc + '/instruction' + pageNum + '.png" alt="house" height="' +
            picHeight + '" align="center"></div>'
        $('#Title').html(title);
        $('#TextBoxDiv').html(info + thisImage);

        var buttons = '<div align="center"><input align="center" type="button" class="btn btn-default" id="Back"' +
            ' value="Back"><input align="center" type="button" class="btn btn-default" id="Next" value="Next">' +
            '<input align="center" type="button" class="btn btn-default" id="Start" style="color:red" ' + 
            'value="Comprehension quiz"></div>';
        $('#Bottom').html(buttons);

        if (pageNum === 1) {
            $('#Back').hide();
        };
        if (pageNum === numPages) {
            $('#Next').hide();
        };
        if (pageNum < numPages) {
            $('#Start').hide();
        };

        $('#Back').click(function () {
            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            instructions(pageNum - 1);
        });

        $('#Next').click(function () {
            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            instructions(pageNum + 1);
        });

        $('#Start').click(function () {
            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            comprehension();
        });
    };

    // comprehension checking ------------------------------------------------------------------------------------------------
    function comprehension() {
        $('#Top').css('height', thisHeight / 20);
        $('#Stage').css('width', dispWidth);
        $('#Stage').css('min-height', thisHeight * 7 / 20);
        $('#Bottom').css({
            'height': thisHeight / 20,
            'position': 'absolute',
            'width': thisWidth,
            'top': bottomPos
        });
        createDiv('Stage', 'Title');
        createDiv('Stage', 'TextBoxDiv');

        $('#TextBoxDiv').css('font-size', '16px');
        $('#TextBoxDiv').css('padding-top', '5%');

        // correct answers for the comprehension quiz
        var answers = ["true", "false", "false", "true"];

        var title = '<h2 align="center">Comprehension Quiz</h2>';
        var info = '<div id="comprehension">' + 'Please answer the following questions before starting the task. ' +
                   'These are necessary for ensuring that you read and understood the instructions.<br><br>' +
                   '<ol>' + 
                        '<li>Each door has a fixed but different probability of hiding a coin. ' +
                            'Some doors are more likely to hide a coin than the others.<br>' +
                            '<select id="comp_q1" class="comp_questions">' +
                                '<option value="noresp" SELECTED></option>' +
                                '<option value="true">True</option>' +
                                '<option value="false">False</option>' +
                            '</select>' +
                        '</li>' +
                        '<br>' +
                        '<li>The demonstrator is the same person in all '+ conditions.length + ' games.<br>' +
                            '<select id="comp_q2" class="comp_questions">' +
                                '<option value="noresp" SELECTED></option>' +
                                '<option value="true">True</option>' +
                                '<option value="false">False</option>' +
                            '</select>' +
                        '</li>' +
                        '<br>' +
                        '<li>The demonstrators always perform better than you.<br>' +
                            '<select id="comp_q3" class="comp_questions">' +
                                '<option value="noresp" SELECTED></option>' +
                                '<option value="true">True</option>' +
                                '<option value="false">False</option>' +
                            '</select>' +
                        '</li>' +
                        '<br>' +
                        '<li>The demonstrators have played exactly the same game as you will be playing.<br>' +
                            '<select id="comp_q4" class="comp_questions">' +
                                '<option value="noresp" SELECTED></option>' +
                                '<option value="true">True</option>' +
                                '<option value="false">False</option>' +
                            '</select>' +
                        '</li>' +
                   '</ol>' + '</div>';
        $('#Title').html(title);
        $('#TextBoxDiv').html(info);

        var buttons = '<div align="center">' + 
                      '<input align="center" type="button" class="btn btn-default" id="Check" value="Check answers">' + 
                      '<input align="center" type="button" class="btn btn-default" id="Done" style="color:red" ' + 
                      'value="Start!"></div>';
        $('#Bottom').html(buttons);
        $('#Done').hide();

        $('#Check').click(function () {
            
            var q1 = $('#comp_q1').val();
            var q2 = $('#comp_q2').val();
            var q3 = $('#comp_q3').val();
            var q4 = $('#comp_q4').val();

            if(q1 == answers[0] && q2 == answers[1] && q3 == answers[2] && q4 == answers[3]) {
                // Allow the start
                alert('You got everything correct! Press "Start!" to begin the experiment.'); 
                $('#Done').show();
                $('#Check').hide();
            } else {
                // Throw them back to the start of the instructions
                // Remove their answers and have them go through again
                alert('You answered at least one question incorrectly! Please try again.');
        
                $('#comp_q1').prop('selectedIndex', 0);
                $('#comp_q2').prop('selectedIndex', 0);
                $('#comp_q3').prop('selectedIndex', 0);
                $('#comp_q4').prop('selectedIndex', 0);
                // $('#done_comp').hide();
                // $('#comp_check_btn').show(); 
                // $('#ins1').show();
                // $('#comprehension').hide();

                $('#TextBoxDiv').remove();
                $('#Stage').empty();
                $('#Bottom').empty();
                instructions(1);
            };
        });

        $('#Done').click(function () { // game start!
            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();

            startTaskTime = new Date();
            ran(); // multiple conditions

            // setTimeout(function() { // displaying "ready" "steady" "go!"
            //     $('#Stage').html('<h1 align="center">Ready</h1>');
            //     setTimeout(function() {
            //         $('#Stage').html('<h1 align="center">Steady</h1>');
            //         setTimeout(function() {
            //             $('#Stage').html('<h1 align="center">Go!</h1>');
            //             setTimeout(function() {
            //                 $('#Stage').html('<h1 align="center"></h1>');
            //                 $('#Stage').css('margin-top', 'auto');
            //                 $('#Stage').empty();
            //                 // options(1); // start with the first trial
            //                 ran(); // multiple conditions
            //             }, 1000);
            //         }, 1000);
            //     }, 1000);
            // }, 10);
        });
    };
        

    // options ---------------------------------------------------------------------------------------------------------------    
    function options(trialNum) {
        if (trialNum > numTrials) {
            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            $('#Top').empty();
            $('#Title').empty();
            $('#Middle').empty();
            // end(); // for testing
            numGames++;
            ran();

        } else {
            $('#Top').css('height', thisHeight / 20);
            $('#Stage').css('width', dispWidth);
            $('#Stage').css('height', thisHeight * 17 / 20);
            $('#Bottom').css('min-height', thisHeight / 20);

            createDiv('Stage', 'TextBoxDiv');
            $('#TextBoxDiv').css('margin-top', '10%');

            createDiv('Stage', 'MessageBox');
            $('#MessageBox').css({
                'position': 'absolute',
                'left': '10%',
                'width': '80%'
            });


            var infoTrial1 = '<div id="info1" align="left">Coins already got in the current game: ' + tempReward + '<br>' +
                'Coins got in previous games in total: ' + sumReward + '<div>';
            var infoTrial2 = '<div id="info2" align="left">Trial ' + trialNum + ' of ' + numTrials + '<br>' +
                'Game ' + numGames + ' of ' + conditions.length + '<div>';
            $('#info1').css('position', 'absolute');
            $('#info2').css('position', 'absolute');
            $('#Top').html(infoTrial1 + infoTrial2);
            $('#Top').css('font-size', '16px');

            var title = '<div id="Title"><h2 align="center">Choose a door:' + spacing + '</h2></div>';

            var door = new Array();
            for (let i = 1; i <= numArms; i++) {
                door[i - 1] = '<img id="Door' + i + '" src="' + imageSrc + '/door.png">';
            }

            switch (numArms) {
                case 2:
                    //  | screen | Stage(left) - a - | Door1 - b - | background - x - | ...
                    var leftMar = (document.body.clientWidth - $('#Main').width()) / 2;
                    var a = $('#Main').width() / 4;
                    var b = $('#Main').width() / 9;
                    var h = [$('#Main').height() * 0.45];
                    $('#MessageBox').html(title);
                    $('#TextBoxDiv').html(door[0] + door[1]);
                    $('#Door1').css({
                        'position': 'absolute',
                        'left': leftMar + a,
                        'top': h[0],
                        'width': b,
                        'cursor': 'pointer'
                    });
                    $('#Door2').css({
                        'position': 'absolute',
                        'right': document.getElementById('Door1').style.left,
                        'top': h[0],
                        'width': b,
                        'cursor': 'pointer'
                    });
                    break;

                case 4:
                    //  | screen | Stage(left) - a - | Door1 - b - | background - x - | ...
                    var leftMar = (document.body.clientWidth - $('#Main').width()) / 2;
                    var a = $('#Main').width() / 6;
                    var b = $('#Main').width() / 9;
                    var x = ($('#Main').width() - 2 * a - 4 * b) / 3;
                    var h = [$('#Main').height() * 0.45];
                    $('#MessageBox').html(title);
                    $('#TextBoxDiv').html(door[0] + door[1] + door[2] + door[3]);
                    $('#Door1').css({
                        'position': 'absolute',
                        'left': leftMar + a,
                        'top': h[0],
                        'width': b,
                        'cursor': 'pointer'
                    });
                    $('#Door2').css({
                        'position': 'absolute',
                        'left': leftMar + a + b + x,
                        'top': h[0],
                        'width': b,
                        'cursor': 'pointer'
                    });
                    $('#Door3').css({
                        'position': 'absolute',
                        'right': document.getElementById('Door2').style.left,
                        'top': h[0],
                        'width': b,
                        'cursor': 'pointer'
                    });
                    $('#Door4').css({
                        'position': 'absolute',
                        'right': document.getElementById('Door1').style.left,
                        'top': h[0],
                        'width': b,
                        'cursor': 'pointer'
                    });

                    break;

                case 8:
                    //  | screen | Stage(left) - a - | Door1 - b - | background - x - | ...
                    var leftMar = (document.body.clientWidth - $('#Main').width()) / 2;
                    var a = $('#Main').width() / 6;
                    var b = $('#Main').width() / 9;
                    var x = ($('#Main').width() - 2 * a - 4 * b) / 3;
                    var h = [$('#Main').height() * 0.35, $('#Main').height() * 0.65];
                    $('#MessageBox').html(title);
                    $('#TextBoxDiv').html(door[0] + door[1] + door[2] + door[3] + door[4] + door[5] + door[6] + door[7]);
                    $('#Door1').css({
                        'position': 'absolute',
                        'left': leftMar + a,
                        'top': h[0],
                        'width': b,
                        'cursor': 'pointer'
                    });
                    $('#Door2').css({
                        'position': 'absolute',
                        //  'left': $('#Stage').position().left + dispWidth / 2,
                        'left': leftMar + a + b + x,
                        'top': h[0],
                        'width': b,
                        'cursor': 'pointer'
                    });
                    $('#Door3').css({
                        'position': 'absolute',
                        'right': document.getElementById('Door2').style.left,
                        'top': h[0],
                        'width': b,
                        'cursor': 'pointer'
                    });
                    $('#Door4').css({
                        'position': 'absolute',
                        'right': document.getElementById('Door1').style.left,
                        'top': h[0],
                        'width': b,
                        'cursor': 'pointer'
                    });
                    $('#Door5').css({
                        'position': 'absolute',
                        'left': document.getElementById('Door1').style.left,
                        'top': h[1],
                        'width': b,
                        'cursor': 'pointer'
                    });
                    $('#Door6').css({
                        'position': 'absolute',
                        'left': document.getElementById('Door2').style.left,
                        'top': h[1],
                        'width': b,
                        'cursor': 'pointer'
                    });
                    $('#Door7').css({
                        'position': 'absolute',
                        'right': document.getElementById('Door2').style.left,
                        'top': h[1],
                        'width': b,
                        'cursor': 'pointer'
                    });
                    $('#Door8').css({
                        'position': 'absolute',
                        'right': document.getElementById('Door1').style.left,
                        'top': h[1],
                        'width': b,
                        'cursor': 'pointer'
                    });

                    break;
            };

            if (isTeacher) {
                // var whichTeacher = t; // which teacher
                var whichDemo = t[trialNum - 1]; // which door does the teacher choose in the current trial

                $('#TextBoxDiv').append('<img id="Point" src="' + imageSrc + '/point.png">');
                $('#Point').css({
                    'position': 'absolute',
                    'left': '48%',
                    'top': h[0] - $('#Main').height() / 12,
                    'width': $('#Door1').width() / 2
                });

                $("#Point").animate({
                    left: $('#Door' + whichDemo).position().left + $('#Door' + whichDemo).width() / 3,
                    top: h[Number(whichDemo > 4.5)] + $('#Main').height() / 12
                }, movePoint);
                $('#Point').delay(stayPoint);
                $('#Point').fadeOut(fadePoint, function () { // prevent from clicking before the end of demonstration
                    $('#Point').empty(); // clear "point" otherwise user cannot click on the position                
                    var isClick = true; // prevent from clicking too fast / too many times
                    for (let i = 1; i <= numArms; i++) {
                        $('#Door' + i).click(function () {
                            if (isClick) {
                                isClick = false;
                                subChoice[numArms + teacherPerform][trialNum - 1] = i;
                                $(this).css({
                                    "border-color": "#CCFF33",
                                    "border-width": "3px",
                                    "border-style": "solid"
                                });
                                reward(trialNum, i);
                            };
                        });
                    };
                });

            } else {
                var isClick = true; // prevent from clicking too fast / too many times
                for (let i = 1; i <= numArms; i++) {
                    $('#Door' + i).click(function () {
                        if (isClick) {
                            isClick = false;
                            subChoice[numArms + "No"][trialNum - 1] = i;
                            $(this).css({
                                "border-color": "#CCFF33",
                                "border-width": "3px",
                                "border-style": "solid"
                            });
                            reward(trialNum, i);
                        };
                    });
                };
            };
        };
    };

    // rewards ---------------------------------------------------------------------------------------------------------------
    function reward(trialNum, choice) {
        $('#Title').empty();
        var thisReward = 0;
        var randomNum = Math.random();

        for (let i = 1; i <= numArms; i++) {
            if (choice === i) {
                if (randomNum < p[i - 1]) {
                    thisReward = 1;
                };
            };
        };

        createDiv('Stage', 'TextBoxDiv2');


        if (thisReward === 1) { // coin
            $('#MessageBox').html('<h2 align="center" id="Message">You got a coin!!' + spacing + '</h2>');
            $('#TextBoxDiv2').html('<img id="Reward" src="' + imageSrc + '/coin.png">');
            tempReward = tempReward + 1;
        } else { // no coin
            $('#MessageBox').html('<h2 align="center" id="Message">You got nothing...' + spacing + '</h2>');
            $('#TextBoxDiv2').html('<img id="Reward" src="' + imageSrc + '/frowny.png">');
        };

        $('#Reward').css({
            'position': 'absolute',
            'left': '47.5%',
            'top': '18%',
            'width': '5%'
        });

        setTimeout(function () {
            $('#TextBoxDiv2').fadeOut(fadeTime);
            $('#TextBoxDiv').fadeOut(fadeTime);
            $('#MessageBox').fadeOut(fadeTime);
            setTimeout(function () {
                $('#Stage').empty();
                $('#Bottom').empty();
                options(trialNum + 1);
            }, fadeTime);
        }, stayTime);
    };

    // ending -----------------------------------------------------------------------------------------------------------------
    function end() {
        $('#Top').css('height', thisHeight / 20);
        $('#Stage').css('width', dispWidth);
        $('#Stage').css('min-height', thisHeight * 17 / 20);
        $('#Bottom').css({
            'height': thisHeight / 20,
            'position': 'absolute',
            'width': thisWidth,
            'top': bottomPos
        });
        createDiv('Stage', 'Title');
        createDiv('Stage', 'TextBoxDiv');

        $('#TextBoxDiv').css('font-size', '16px');
        $('#TextBoxDiv').css('padding-top', '10%');

        var title = '<h2 align="center">Demographic Information</h2>'; // header
        var info = '<div>Please answer the following questions:<br><br>' +
            'In which year were you born? ' + '<input type="number" id="year"><br><br>' +
            'How many years have you received formal education (counting from elementary school)? ' +
            '<input type="number" id="edu"><br><br>' +
            '(Optional) If you have any questions or suggestions on this study, you could write here:<br>' +
            //    '<input type="text" id="feedback" ' + 
            //    'style="width:' + dispWidth + 'px; height:' + dispWidth / 3 + 'px; word-break:break-all"></div>';
            '<textarea id="feedback" style="width:' + dispWidth + 'px; height:' + dispWidth / 3 + 'px"></textarea></div>'
            'Click "Next" button below to submit and continue to task instructions.'
        $('#Title').html(title);
        $('#TextBoxDiv').html(info);

        var buttons = '<div align="center"><input align="center" type="button" class="btn btn-default"' +
            ' id="submitFeedback" value="Submit"></div>';
        $('#Bottom').html(buttons); // click button to submit

        // year = $("#year").val();
        // edu = $("#edu").val();
        // if (year % 1 === 0 && edu % 1 === 0 && year > 1900 && year < 2004 && edu >= 0 && edu <= 50) {
        //     $('#submitFeedback').prop('disabled', false);
        // };

        var endTime = new Date();
        var money = 1 + Math.round(sumReward / 2) * 0.01;

        $('#submitFeedback').click(function () {
            year = $("#year").val();
            edu = $("#edu").val();

            if (isNaN(year) || isNaN(edu) || year === "" || edu === "") {
                alert('Please enter a number.');
            } else if (year % 1 !== 0 || edu % 1 !== 0) {
                alert('Please enter an integer.');
            } else if (year < 1900 || year > 2003 || edu < 0 || edu > 50) {
                alert('Please enter a valid number.');
            } else {
                $('#Title').remove();
                $('#TextBoxDiv').remove();
                $('#Stage').empty();
                $('#Bottom').empty();

                jQuery.ajax({ // save data
                    url: 'static/php/save_data.php',
                    type:'POST',
                    data:{
                        token:subID,
                        date:String(endTime.getFullYear()) + '_' +
                            String(endTime.getMonth() + 1).padStart(2, '0') + '_' +
                            String(endTime.getDate() + 1).padStart(2, '0'),
                        time:String(endTime.getHours()+ 1).padStart(2, '0') + '_' +
                            String(endTime.getMinutes() + 1).padStart(2, '0')+ '_' +
                            String(endTime.getSeconds() + 1).padStart(2, '0'),
                        instructions_duration:startTaskTime - startTime,
                        task_duration:endTime - startTaskTime,
                        age:2020 - year,
                        education:edu,
                        feedback:$("#feedback").val(),
                        choices_2No:subChoiceReorder["2No"],
                        choices_4No:subChoiceReorder["4No"],
                        choices_8No:subChoiceReorder["8No"],
                        choices_2Low:subChoiceReorder["2Low"],
                        choices_4Low:subChoiceReorder["4Low"],
                        choices_8Low:subChoiceReorder["8Low"],
                        choices_2High:subChoiceReorder["2High"],
                        choices_4High:subChoiceReorder["4High"],
                        choices_8High:subChoiceReorder["8High"],
                        // choices:subChoiceReorder,
                        sum_reward:sumReward, // sum of reward in each game !!!!!!!
                        money:money},
                    success:function(data)
                    {
                        console.log('Sent data to database');
                        FinishExp();
                    },
                    error:function(xhr, status, error)
                    {
                        //Just print out what comes back if it doesn't work
                        console.log(xhr, status, error);
                        FinishError();
                    }
                })
            };
        });
    };

    function FinishExp() {
        $('#Top').css('height', thisHeight / 20);
        $('#Stage').css('width', dispWidth);
        $('#Stage').css('min-height', thisHeight * 17 / 20);
        $('#Bottom').css({
            'height': thisHeight / 20,
            'position': 'absolute',
            'width': thisWidth,
            'top': bottomPos
        });
        createDiv('Stage', 'Title');
        createDiv('Stage', 'TextBoxDiv');

        $('#TextBoxDiv').css('font-size', '16px');
        $('#TextBoxDiv').css('padding-top', '20%');
        

        var title = '<h2 align="center">You have successfully finished the experiment!<br><br></h2>';
        var info = '<div>You earned ' + sumReward + ' coins, so your will be paid $' + money + '.<br><br>' +
            'Your reference code is: ' + subID + '<br><br>' +
            'Please write your reference code in Mturk and then close this window. Thanks so much!' + '</div>';

        $('#Title').html(title);
        $('#TextBoxDiv').html(info);
    };

    function FinishError() {
        $('#Top').css('height', thisHeight / 20);
        $('#Stage').css('width', dispWidth);
        $('#Stage').css('min-height', thisHeight * 17 / 20);
        $('#Bottom').css({
            'height': thisHeight / 20,
            'position': 'absolute',
            'width': thisWidth,
            'top': bottomPos
        });
        createDiv('Stage', 'Title');
        createDiv('Stage', 'TextBoxDiv');

        $('#TextBoxDiv').css('font-size', '16px');
        $('#TextBoxDiv').css('padding-top', '20%');

        var title = '<h2 align="center">Error<br><br></h2>';
        var info = '<div>Your reference code is: ' + subID + '<br><br>' +
            '<span style="color: red">Error: the data might not upload to database successfully. ' + 
            'Please contact the experimenter.</span>' + '</div>';

        $('#Title').html(title);
        $('#TextBoxDiv').html(info);
    };




    // utility functions -----------------------------------------------------------------------------------------------------

    // generating toke displayed to participant (stolen from tia stolen from bonan)
    function generateToken(length) {
        let tokens = '';
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        for (let i = 0; i < length; i ++) {
            tokens += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return tokens;
    };

    // create a new div under a parent div
    function createDiv(parentID, childID) {
        var d = $(document.createElement('div')).attr('id', childID);
        var container = document.getElementById(parentID);
        d.appendTo(container);
    };

    // miscellanous
    // calculate expeceted rewards for random choices
    function multiply(input) {
        return input * numTrials;
    };

    function expRewardsRandom() {
        var tempPsNew;
        var x = Array(conditions.length);
        var i;
        for (i = 0; i < conditions.length; i++) {
            tempPsNew = ps[conditions[i]].map(multiply); // in each condition, each door' reward rate * number of trials
            x[i] = eval(tempPsNew.join("+")) / parseInt(conditions[i].substring(0, 1)); // average over tempPsNew in each condition
        };

        console.log(eval(x.join("+")));
        // 63.4831875 // expected rewards for random policy
    };

    function expRewardsBest() {
        console.log(conditions.length * numTrials);
        // 135 // total rewards if all choices get a reward
    };

    function expRewardsOpt() {
        var tempPsNew;
        var y = Array(conditions.length);
        var i;
        for (i = 0; i < conditions.length; i++) {
            tempPsNew = Math.max.apply(null, ps[conditions[i]]);
            y[i] = tempPsNew * numTrials;
        };

        console.log(eval(y.join("+")));
        // 96.36149999999999 // expected rewards if all choices have the highest reward rate in the game
    };


})