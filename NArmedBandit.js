$(document).ready(function () {    
    // initialising variables ------------------------------------------------------------------------------------------------
    // adjustable
    var numTrials = 15; // number of trials
    var fadeTime = 250; // fade out time (after reward being displayed in each trial)
    var stayTime = 500; // result stay time (after reward being displayed in each trial)
    var movePoint = 500; // moving time for the point
    var stayPoint = 200; // point stay time
    var fadePoint = 100; // point fade out time

    var teacher = { // numArms + teacherPerform (see matlab file experiment_added.m)
        "2Low" : [1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 1, 2, 1, 1, 1],
        "4Low" : [3, 2, 3, 3, 1, 2, 4, 2, 4, 1, 3, 3, 4, 2, 1],
        "8Low" : [6, 4, 8, 7, 8, 7, 3, 4, 3, 5, 6, 6, 1, 1, 7],
        "2Mid" : [2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 1, 2, 1, 2],
        "4Mid" : [3, 1, 3, 3, 3, 2, 3, 3, 3, 4, 4, 4, 4, 4, 4],
        "8Mid" : [4, 5, 4, 5, 5, 5, 8, 5, 8, 4, 4, 4, 4, 4, 5],
        "2High": [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        "4High": [2, 2, 2, 4, 3, 1, 4, 4, 4, 4, 3, 4, 4, 4, 4],
        "8High": [5, 4, 4, 4, 4, 4, 4, 7, 7, 7, 7, 7, 7, 7, 7]
    }

    // random surnames from https://en.geneanet.org/genealogy/ popularity around 1,000,000
    var names = {
        "2No": "None",
        "4No": "None",
        "8No": "None",
        "2Low": "Foster",
        "4Low": "Russell",
        "8Low": "Reed",
        "2Mid": "Collins",
        "4Mid": "Hughes",
        "8Mid": "Carter",
        "2High": "Hamilton",
        "4High": "Fisher",
        "8High": "Bennett"
    };

    var ps = { // generated from Beta(2, 2) (see matlab file experiment.m)
        "2No"  : [0.6587, 0.0749],
        "4No"  : [0.2921, 0.6607, 0.5861, 0.6737],
        "8No"  : [0.3653, 0.5430, 0.6756, 0.6901, 0.3553, 0.4551, 0.4378, 0.5093],
        "2Low" : [0.7091, 0.5989],
        "4Low" : [0.7595, 0.3684, 0.1898, 0.6393],
        "8Low" : [0.3663, 0.7822, 0.3878, 0.3492, 0.8031, 0.2143, 0.2514, 0.1146],
        "2Mid" : [0.4356, 0.6446],
        "4Mid" : [0.6042, 0.1958, 0.4415, 0.8789],
        "8Mid" : [0.9619, 0.4056, 0.8665, 0.8836, 0.4739, 0.8596, 0.8702, 0.7446],
        "2High": [0.3651, 0.6211],
        "4High": [0.2052, 0.2406, 0.4109, 0.2506],
        "8High": [0.4613, 0.4383, 0.5122, 0.7120, 0.6893, 0.7409, 0.7462, 0.4496]
    };

    // system
    var isTeacher; // whether their is a demonstrator
    var teacherPerform; // which teacher

    var numArms; // number of arms
    var p = new Array(); // probability array
    var t = Array(numTrials); // teacher's choices array
    var order = new Array(); // doors' order array
    var sumReward = 0; // total rewards a participant already gets
    var tempReward = 0;
    var money = 0; // money paid to the participant
    
    var subID = generateToken(10); // random ID for each participant
    var year; // birth year of the subject
    var edu; // years of formal education that the subject has received
    var gender; // gender of the subject
    var feedback; // feedback
    var strategy1;
    var strategy2;

    var timeOpen = new Date(); // timestamp - open the link
    var timeStart; // timestamp - start the task
    var timeEnd; // timestamp - task end
    var timeSubmit; // timestamp - submit the final form

    var subChoice = { // numArms + teacherPerform
        "2Low": [],
        "4Low": [],
        "8Low": [],
        "2Mid": [],
        "4Mid": [],
        "8Mid": [],
        "2High": [],
        "4High": [],
        "8High": [],
        "2No": [],
        "4No": [],
        "8No": []
    };
    var subChoiceReorder = { // re-ordered subject choices; this will be sent to database
        "2Low": [],
        "4Low": [],
        "8Low": [],
        "2Mid": [],
        "4Mid": [],
        "8Mid": [],
        "2High": [],
        "4High": [],
        "8High": [],
        "2No": [],
        "4No": [],
        "8No": []
    };
    var subReward = { // subject reward in each trial
        "2Low": [],
        "4Low": [],
        "8Low": [],
        "2Mid": [],
        "4Mid": [],
        "8Mid": [],
        "2High": [],
        "4High": [],
        "8High": [],
        "2No": [],
        "4No": [],
        "8No": []
    };

    var conditions = ["2Low", "4Low", "8Low", "2Mid", "4Mid", "8Mid", "2High", "4High", "8High", "2No", "4No", "8No"];
    conditions.sort(function () { // randomising conditions
        return Math.random() - 0.5;
    });
    var trialReward = Array(conditions.length); // sum rewards in each game

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
    if (isMobile() || isMobileOrTablet()) { // not working in pad?
        alert('Unfortunately, you need to be on a desktop or laptop computer in order to take part in this experiment.');
    } else if (isEdge || isIE || isOpera || isBlink){
        alert('Sorry, but this experiment is only supported in Chrome/Firefox/Safari.');
    } else {
        expRewardsRandom(); // calculating the expected rewards of random policy
        expRewardsOpt(); // calculating the expected rewards of optimal policy 
        expRewardsMin(); // calculating the min expected rewards  
        // (always choosing the option with the highest reward rate)
        information(); // start the entire experiment
    };


    // full games -----------------------------------------------------------------------------------------------------------
    function control() { 
        $('#Top').css('height', thisHeight / 20);
        $('#Stage').css('width', dispWidth);
        $('#Stage').css('height', thisHeight * 17 / 20);
        $('#Bottom').css('min-height', thisHeight / 20);

        createDiv('Stage', 'TextBoxDiv0');
        $('#TextBoxDiv0').css('font-size', '16px');
        $('#TextBoxDiv0').css('padding-top', '30%');

        if (numGames == 1) { // before the first trial
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
            };
            isTeacherDisplay = names[conditions[numGames - 1]];

            var title = '<div id="Title"><h2 align="center">' + 'Game No. <b>' + numGames + '</b>' + 
                        ' of ' + conditions.length + '<br>' +
                        'Number of doors: <b>' + numArms + '</b><br>' +
                        'Demonstrator: <b>' + isTeacherDisplay + '</b>' + '</h2><div>';
            var buttons = '<div align="center"><input align="center" type="button" class="btn btn-default"' +
                          ' id="toTrial" value="Start!"></div>';
        } else {
            // rewards in each game
            trialReward[numGames - 2] = tempReward;
            sumReward = sumReward + tempReward;
            tempReward = 0;

            for (i = 0; i < numTrials; i++) { // re-ordering participants' choices in the previous game
                var temp = subChoice[numArms + teacherPerform][i];
                subChoiceReorder[numArms + teacherPerform][i] = order[temp - 1];
            };

            if (numGames <= conditions.length) {
                numArms = parseInt(conditions[numGames - 1].substring(0, 1)); // 2, 4, or 8
                isTeacher = conditions[numGames - 1].substring(1) !== "No"; // whether there is demonstrator or not
                teacherPerform = conditions[numGames - 1].substring(1); // "No", "Low", "Mid", or "High"

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
                };
                isTeacherDisplay = names[conditions[numGames - 1]];
                
                var title = '<div id="Title"><h2 align="center">' + 'Game No. <b>' + numGames + '</b>' + 
                            ' of ' + conditions.length + '<br>' +
                            'Number of doors: <b>' + numArms + '</b><br>' +
                            'Demonstrator: <b>' + isTeacherDisplay + '</b><br><br>' +
                            'You have collected <b>' + sumReward + '</b> coins (' + 
                            sumReward + ' cents) in this study so far!' +
                            '</h2><div>';
                var buttons = '<div align="center"><input align="center" type="button" class="btn btn-default"' +
                            ' id="toTrial" value="Start!"></div>';
            } else { // after the last trial
                timeEnd = new Date();
                var title = '<div id="Title"><h2 align="center">' + 
                            'You have completed all the games.' + '<br><br>' +
                            'You have collected <b>' + sumReward + '</b> coins (' + 
                            sumReward + ' cents) in this study so far!' +
                            '</h2><div>';
                var buttons = '<div align="center"><input align="center" type="button" class="btn btn-default"' +
                            ' id="toEnd" value="Continue"></div>';
            };
        };

        $('#TextBoxDiv0').html(title);
        $('#Bottom').html(buttons); 

        $('#toTrial').click(function () {
            $('#TextBoxDiv0').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            options(1);
        });

        $('#toEnd').click(function () {
            $('#TextBoxDiv0').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            end();
        });
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

        var title = '<h2 align="center">Information for Participants</h2>'; 
        var info = '<div class="scroll_text" id="consent-info">' +
                   '<p><b>Nature of the study.&nbsp;</b>You are invited to participate in a study which involves choosing ' +
                       'repeatedly among multiple pictures, each of which is associated with a certain probability of ' + 
                       'getting additional rewards. Your final compensation in this experiment will be dependent on your ' + 
                       'choices. After the experiment, we will ask you you to provide some basic demographics (e.g., age). ' + 
                       'Your session should last for up to 10 minutes. You will be given full instructions shortly.</p>' +
                    '<p><b>Compensation.&nbsp;</b>You will be paid $1.00~2.20 for your participation.</p>' + 
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
                        'You can contact us by email at <a href="mailto:Y.Zhang-327@sms.ed.ac.uk">' + 
                        'Y.Zhang-327@sms.ed.ac.uk</a>. This ' + 
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
                            ' <b>switch off</b> messengers, music, etc.</li>' +
                            '<li>Please use ' + 
                                '<abbr title="For Windows, press F11 (or Fn + F11)\n' + 
                                'For Mac, press Ctrl + Cmd + F">' + 
                                '<b>full-screen</b></abbr>' + ' mode.</li>' +
                            '<li>You <b>can not</b> use a mobile phone or tablet.</li>' + 
                            '<li>You <b>can only</b> participate if you use Google Chrome, Firefox, or Safari.</li>' +
                            '<li>You can <abbr title="For Windows, press F5 (or Fn + F5)\n' + 
                                'For Mac, press Cmd + R">' + 
                                'refresh</abbr> this page if you switch on the full-screen mode. ' + 
                                'But <b>do not</b> refresh in the following pages.</li>' +
                        '</ul>' +
                    '</div>';

        $('#Title').html(title);
        $('#TextBoxDiv').html(info);

        $('.scroll_text').css({
            'height': thisHeight * 14 / 20,
            'overflow': 'auto'});

        var buttons = '<div align="center"><input align="center" type="button" class="btn btn-default"' +
            ' id="toReminder" value="Accept HIT" disabled></div>';
        var buttons2 = '<div align="center"><input align="center" type="button" class="btn btn-default"' +
            ' id="startExp" value="Understood"></div>';
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
                instructions(1); // move to the first page of instrcutions
            });
        });        
    };
    
    var bottomPos = $('#Bottom').position().top; // to align the position of the buttons

    // instructions ----------------------------------------------------------------------------------------------------------
    function instructions(pageNum) {
        $('#Top').css('height', thisHeight / 20);
        $('#Stage').css('width', dispWidth);
        // $('#Stage').css('min-height', thisHeight * 7 / 20);
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
                    'In this experiment, you will play ' + conditions.length + ' short games. ' + 
                    'In each game you will have ' + numTrials + ' shots ' + 
                    'where you select one out of the <b>2 (4 or 8 ) doors</b> to open using your mouse.<br><br>' + 
                    'For a given game, ' + 
                    'each door has a fixed chance of having a <b>coin</b> behind it every time that you select it. ' + 
                    'Different doors may be more or less likely than one another to produce a coin. ' + 
                    'Your goal is to <b>collect as many coins as possible.</b> ' + 
                    'For every coin you collect in the task, you will earn additional $0.01 ' + 
                    'meaning you can make up to $1.20 in bonus.';
                break;
            case 2:
                var info = '<i>***Please remember to read all instructions <b>carefully</b>. ' + 
                           'You will have to complete a <b>comprehension quiz</b> at the end of ' + 
                           'the instructions.***</i><br><br>' +
                           'In some of the games, before making your decision, you can see the choice of a previous player ' + 
                           '(<b>demonstrator</b>) who has played <b>exactly the same game</b> as you are playing. ' + 
                           'The demonstrator’s choice will be shown as a cartoon finger (see image below).<br><br>' + 
                           'For each game you will see a <b>different demonstrator</b>, ' + 
                           'who might <b>perform well or badly.</b> ' + 
                           'However you will <b>not</b> be able to see what outcomes they get ' + 
                           'but only the choices they made. ' + 
                           'The name of the demonstrator will be displayed before each game starts ' + 
                           '(names have been changed to preserve anonymity).'
                break;
            case 3:
                var info = '<i>***Please remember to read all instructions <b>carefully</b>. ' + 
                    'You will have to complete a <b>comprehension quiz</b> at the end of the instructions.***</i><br><br>' +
                    'After each decision, you will see the outcome of your choice (1 coin or nothing). ' +
                    'You will then continue directly to the next shot. ' +
                    'At the end of each game, you will see how many coins you have earned in total.<br><br>' +
                    'This experiment takes around 15 minutes to complete on average.<br><br>' +
                    'Click "Continue" to start the comprehension quiz.';
                break;
            default:
                var info;
                break;
        };

        var thisImage = '<div align="center"><img src="static/images/instruction' + pageNum + '.png" alt="house" height="' +
            picHeight + '" align="center"></div>'
        $('#Title').html(title);
        $('#TextBoxDiv').html(info + thisImage);

        var buttons = '<div align="center"><input align="center" type="button" class="btn btn-default" id="Back"' +
            ' value="Back"><input align="center" type="button" class="btn btn-default" id="Next" value="Next">' +
            '<input align="center" type="button" class="btn btn-default" id="Start" style="color:red" ' + 
            'value="Continue"></div>';
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
        var answers = ["true", "false", "false", "true", "true"];

        var title = '<h2 align="center">Comprehension Quiz</h2>';
        var info = '<div id="comprehension" class="form-horizontal">' + 
                   'Please answer the following questions before starting the task. ' +
                   'These are necessary for ensuring that you read and understood the instructions.<br><br>' +
                   '<ol>' + 
                        '<li>Each door has a fixed but different probability of hiding a coin. ' +
                            'Some doors are more likely to hide a coin than the others.<br>' +
                            '<select id="comp_q1" class="form-control">' +
                                '<option value="noresp" SELECTED></option>' +
                                '<option value="true">True</option>' +
                                '<option value="false">False</option>' +
                            '</select>' +
                        '</li>' +
                        '<br>' +
                        '<li>The demonstrator is the same person in all '+ conditions.length + ' games.<br>' +
                            '<select id="comp_q2" class="form-control">' +
                                '<option value="noresp" SELECTED></option>' +
                                '<option value="true">True</option>' +
                                '<option value="false">False</option>' +
                            '</select>' +
                        '</li>' +
                        '<br>' +
                        '<li>The demonstrators always perform better than you.<br>' +
                            '<select id="comp_q3" class="form-control">' +
                                '<option value="noresp" SELECTED></option>' +
                                '<option value="true">True</option>' +
                                '<option value="false">False</option>' +
                            '</select>' +
                        '</li>' +
                        '<br>' +
                        '<li>The demonstrators have played exactly the same game as you will be playing.<br>' +
                            '<select id="comp_q4" class="form-control">' +
                                '<option value="noresp" SELECTED></option>' +
                                '<option value="true">True</option>' +
                                '<option value="false">False</option>' +
                            '</select>' +
                        '</li>' +
                        '<br>' +
                        '<li>You cannot see the outcome that the demonstrators got, but only the choices they made.<br>' +
                            '<select id="comp_q5" class="form-control">' +
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
                      '</div>';
        $('#Bottom').html(buttons);

        $('#Check').click(function () {
            
            var q1 = $('#comp_q1').val();
            var q2 = $('#comp_q2').val();
            var q3 = $('#comp_q3').val();
            var q4 = $('#comp_q4').val();
            var q5 = $('#comp_q5').val();

            if (q1 == "noresp" || q2 == "noresp" || q3 == "noresp" || q4 == "noresp" || q5 == "noresp") {
                alert('You need to answer all questions.');
            } else if(q1 == answers[0] && q2 == answers[1] && q3 == answers[2] && q4 == answers[3] && q5 == answers[4]) {
                // Allow the start
                alert('You got everything correct! Press "OK" to begin the experiment.'); 
                $('#TextBoxDiv').remove();
                $('#Stage').empty();
                $('#Bottom').empty();

                timeStart = new Date();
                control(); // start
            } else {
                // Throw them back to the start of the instructions
                // Remove their answers and have them go through again
                alert('You answered at least one question incorrectly! Please try again.');
        
                $('#comp_q1').prop('selectedIndex', 0);
                $('#comp_q2').prop('selectedIndex', 0);
                $('#comp_q3').prop('selectedIndex', 0);
                $('#comp_q4').prop('selectedIndex', 0);
                $('#comp_q5').prop('selectedIndex', 0);

                $('#TextBoxDiv').remove();
                $('#Stage').empty();
                $('#Bottom').empty();
                instructions(1);
            };
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
            numGames++;
            control();

        } else {
            $('#Top').css({
                'height': thisHeight / 20,
                'width': dispWidth
            });
            $('#Stage').css({
                'height': thisHeight * 17 / 20,
                'width': dispWidth
            });
            $('#Bottom').css('min-height', thisHeight / 20);

            createDiv('Stage', 'TextBoxDiv');
            $('#TextBoxDiv').css('margin-top', '10%');

            createDiv('Stage', 'MessageBox');
            $('#MessageBox').css({
                'position': 'absolute',
                'left': '10%',
                'width': '80%'
            });


            var infoTrial1 = '<div id="info1" align="left">Coins already collected in the current game: ' + tempReward + '<br>' +
                'Coins collected in previous games in total: ' + sumReward + '</div>';
            var infoTrial2 = '<div id="info2" align="right">Trial ' + trialNum + ' of ' + numTrials + '<br>' +
                'Game ' + numGames + ' of ' + conditions.length + '</div>';
            
            $('#Top').html(infoTrial1 + infoTrial2);
            $('#info1').css({
                'position': 'absolute',
                'top': '0px',
                'left': (document.body.clientWidth - $('#Main').width()) / 2 + 10
            });
            $('#info2').css({
                'position': 'absolute',
                'top': '0px',
                'right': (document.body.clientWidth - $('#Main').width()) / 2 + 10
            });
            $('#Top').css('font-size', '20px');

            var title = '<div id="Title"><h2 align="center">Choose a door:' + spacing + '</h2></div>';

            var door = new Array();
            for (let i = 1; i <= numArms; i++) {
                door[i - 1] = '<img id="Door' + i + '" src="static/images/door.png">';
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
                var whichDemo = t[trialNum - 1]; // which door does the teacher choose in the current trial

                $('#TextBoxDiv').append('<img id="Point" src="static/images/point.png">');
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
                    subReward[numArms + teacherPerform][trialNum - 1] = 1;
                } else {
                    subReward[numArms + teacherPerform][trialNum - 1] = 0;
                }
            };
        };

        createDiv('Stage', 'TextBoxDiv2');


        if (thisReward === 1) { // coin
            $('#MessageBox').html('<h2 align="center" id="Message">You got a coin!!' + spacing + '</h2>');
            $('#TextBoxDiv2').html('<img id="Reward" src="static/images/coin.png">');
            tempReward = tempReward + 1;
        } else { // no coin
            $('#MessageBox').html('<h2 align="center" id="Message">You got nothing...' + spacing + '</h2>');
            $('#TextBoxDiv2').html('<img id="Reward" src="static/images/frowny.png">');
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

        $('#TextBoxDiv').css({
            'font-size': '16px',
            'padding-top': '5%'
        });

        var title = '<h2 align="center">Questionnaire</h2>'; // header
        var valueYear = '<option value="noresp" SELECTED></option>';
        for (i = 2003; i >= 1920; i--) {
            valueYear = valueYear + '<option value="' + i + '">' + i + '</option>';
        };
        var valueEdu = '<option value="noresp" SELECTED></option>';
        for (i = 0; i <= 30; i++) {
            valueEdu = valueEdu + '<option value="' + i + '">' + i + '</option>';
        };

        var info = 'Please answer the following questions:<br><br>' +
                   '<div class="scroll_text">' + 
                   '<ol id="form-text">' + 
                        '<li>In which year were you born?' + '<span style="color: red"> *  </span>' +
                            '<select id="year" class="form-control" style="width:' + dispWidth * 4 / 5 + 'px">' + 
                                valueYear +
                            '</select>' +
                        '</li>' +
                        '<br>' +
                        '<li>What is your gender?' + '<span style="color: red"> *  </span>' +
                            '<select id="gender" class="form-control" style="width:' + dispWidth * 4 / 5 + 'px">' + 
                                '<option value="noresp" SELECTED></option>' +
                                '<option value="female">female</option>' +
                                '<option value="male">male</option>' +
                                '<option value="other">other</option>' +
                                '<option value="nottosay">prefer not to say</option>' +
                            '</select>' +
                        '</li>' +
                        '<br>' +
                        '<li>How many years have you received formal education (counted from elementary school)?' +
                            '<span style="color: red"> * </span>' +
                            '<select id="edu" class="form-control" style="width:' + dispWidth * 4 / 5 + 'px">' + 
                                valueEdu +
                            '</select>' +
                        '</li>' +
                        '<br>' +
                        '<li>Please describe briefly how you made choices when there was <b>no demonstrator</b>.' +
                            '<span style="color: red"> *</span><br>' +
                            '<textarea class="form-control" id="strategy1" style="width:' +
                                dispWidth * 4 / 5 + 'px; height:' + dispWidth / 6 + 'px">' + 
                            '</textarea>' +
                        '</li>' +
                        '<br>' +
                        '<li>Please describe briefly how you made choices when there was <b>a demonstrator</b>.' +
                            '<span style="color: red"> *</span><br>' +
                            '<textarea class="form-control" id="strategy2" style="width:' + 
                                dispWidth * 4 / 5 + 'px; height:' + dispWidth / 6 + 'px">' + 
                            '</textarea>' +
                        '</li>' +
                        '<br>' +
                        '<li>[Optional] If you have any questions, suggestions, or comments, you could write here:<br>' +
                            '<textarea class="form-control" id="feedback" style="width:' + 
                                dispWidth * 4 / 5 + 'px; height:' + dispWidth / 6 + 'px">' + 
                            '</textarea>' +
                        '</li>' +
                        // '<br>' +
                   '</ol>' + '</div>' +
                   '<br>Click "Submit" button below to submit and end this experiment.';

        
        $('#Title').html(title);
        $('#TextBoxDiv').html(info);

        $('.scroll_text').css({ // styling the scrolled area (text & scrollbar)
            'height': thisHeight * 12 / 20,
            'width': dispWidth,
            'overflow': 'auto'
        });
        $('#form-text').css({ // styling the scrolled text (text only)
            'width': dispWidth * 5 / 6
        });

        var buttons = '<div align="center"><input align="center" type="button" class="btn btn-default"' +
            ' id="submitFeedback" value="Submit"></div>';
        $('#Bottom').html(buttons); // click button to submit
        
        money = 1 + Math.round(sumReward / 2) * 0.01;

        $('#submitFeedback').click(function () {
            year = $('#year').val();
            gender = $('#gender').val();
            edu = $('#edu').val();
            feedback = $("#feedback").val();
            strategy1 = $("#strategy1").val();
            strategy2 = $("#strategy2").val();

            if (year === "noresp") {
                alert('Please select your birth year.');
            } else if (gender === "noresp") {
                alert('Please select your gender.');
            } else if (edu === "noresp") {
                alert('Please select the number of years that you received formal education.');
            } else if (strategy1 === "" || strategy2 === "") {
                alert('Please briefly describe the strategies you used in the task.');
            } else if (RegExp("[^\u0020-\u007E\u000A]").test(strategy1) || RegExp("[^\u0020-\u007E\u000A]").test(strategy2)) {
                // only allowing English alphabets and punctuations
                alert('Please only enter English words and punctuations in the text area.');
            } else {
                timeSubmit = new Date();

                $('#Title').remove();
                $('#TextBoxDiv').remove();
                $('#Stage').empty();
                $('#Bottom').empty();

                if (feedback == "") {
                    feedback = "NULL";
                };

                // replacing special punctuations
                strategy1 = strategy1.replace(/[\`\~\@\#\$\%\^\&\*\(\)\_\+\-\=\{\}\[\]\|\<\>\\\/\'\"\u000A]/g, '');

                strategy2 = strategy2.replace(/[\`\~\@\#\$\%\^\&\*\(\)\_\+\-\=\{\}\[\]\|\<\>\\\/\'\"\u000A]/g, '');

                jQuery.ajax({ // save data
                    url: 'static/php/save_data.php',
                    type:'POST',
                    data:{subID:subID,
                        age:2020 - Number(year),
                        gender:gender,
                        education:Number(edu),
                        strategy1:strategy1,
                        strategy2:strategy2,
                        feedback:feedback,
                        duration_read:timeStart.getTime() - timeOpen.getTime(), // time of reading instructions
                        duration_task:timeEnd.getTime() - timeStart.getTime(), // time of completing the task
                        duration_fill:timeSubmit.getTime() - timeEnd.getTime(), // time of filling the final form
                        choices_2No:String(subChoiceReorder["2No"]),
                        choices_4No:String(subChoiceReorder["4No"]),
                        choices_8No:String(subChoiceReorder["8No"]),
                        choices_2Low:String(subChoiceReorder["2Low"]),
                        choices_4Low:String(subChoiceReorder["4Low"]),
                        choices_8Low:String(subChoiceReorder["8Low"]),
                        choices_2Mid:String(subChoiceReorder["2Mid"]),
                        choices_4Mid:String(subChoiceReorder["4Mid"]),
                        choices_8Mid:String(subChoiceReorder["8Mid"]),
                        choices_2High:String(subChoiceReorder["2High"]),
                        choices_4High:String(subChoiceReorder["4High"]),
                        choices_8High:String(subChoiceReorder["8High"]),
                        rewards_2No:String(subReward["2No"]),
                        rewards_4No:String(subReward["4No"]),
                        rewards_8No:String(subReward["8No"]),
                        rewards_2Low:String(subReward["2Low"]),
                        rewards_4Low:String(subReward["4Low"]),
                        rewards_8Low:String(subReward["8Low"]),
                        rewards_2Mid:String(subReward["2Mid"]),
                        rewards_4Mid:String(subReward["4Mid"]),
                        rewards_8Mid:String(subReward["8Mid"]),
                        rewards_2High:String(subReward["2High"]),
                        rewards_4High:String(subReward["4High"]),
                        rewards_8High:String(subReward["8High"]),
                        conditions:String(conditions),
                        sum_reward:String(trialReward), // sum of reward in each game !!!!!!!
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
            'Please SCREENSHOT this page and contact the experimenter.</span>' + '</div>';

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
            x[i] = eval(tempPsNew.join("+")) / parseInt(conditions[i].substring(0, 1)); 
            // average over tempPsNew in each condition
        };

        console.log(eval(x.join("+"))); // expected rewards for random policy
    };

    // function expRewardsBest() {
    //     console.log(conditions.length * numTrials);
    //     // total rewards if all choices get a reward
    // };

    function expRewardsOpt() {
        var tempPsNew;
        var y = Array(conditions.length);
        var i;
        for (i = 0; i < conditions.length; i++) {
            tempPsNew = Math.max.apply(null, ps[conditions[i]]);
            y[i] = tempPsNew * numTrials;
        };

        console.log(eval(y.join("+")));
        // expected rewards if all choices have the highest reward rate in the game
    };

    function expRewardsMin() {
        var tempPsNew;
        var y = Array(conditions.length);
        var i;
        for (i = 0; i < conditions.length; i++) {
            tempPsNew = Math.min.apply(null, ps[conditions[i]]);
            y[i] = tempPsNew * numTrials;
        };

        console.log(eval(y.join("+")));
        // expected rewards if all choices have the lowest reward rate in the game
    };

});