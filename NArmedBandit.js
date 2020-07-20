$(document).ready(function () {    
    // initialising variables ------------------------------------------------------------------------------------------------
    // adjustable
    var numTrials = 20; // number of trials
    var fadeTime = 500; // fade out time (after reward being displayed in each trial)
    var stayTime = 500; // result stay time (after reward being displayed in each trial)
    var movePoint = 500; // moving time for the point
    var stayPoint = 400; // point stay time
    var fadePoint = 100; // point fade out time
    var delayTime = 75; // slot machine run time (total = 4 * delayTime)
    
    var numPages = 4; // number of pages of instructions

    var teacher = { // numArms + teacherPerform (see matlab file experiment_modified.m)
        "2Low" : [2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 1, 1, 1, 2, 2, 2, 1, 1, 2],
        "4Low" : [3, 2, 3, 3, 2, 2, 3, 2, 1, 4, 3, 1, 1, 3, 1, 2, 1, 1, 4, 3],
        "8Low" : [6, 5, 5, 5, 6, 3, 3, 3, 3, 3, 1, 3, 3, 2, 3, 3, 5, 4, 3, 3],
        "2Mid" : [1, 2, 1, 2, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 2, 2],
        "4Mid" : [3, 2, 3, 1, 1, 1, 3, 1, 1, 4, 2, 4, 1, 4, 1, 1, 1, 1, 1, 1],
        "8Mid" : [8, 4, 3, 4, 1, 3, 3, 2, 6, 3, 3, 3, 3, 3, 8, 1, 3, 3, 3, 3],
        "2High": [1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1],
        "4High": [1, 1, 1, 3, 4, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1],
        "8High": [3, 3, 3, 2, 7, 3, 7, 3, 3, 3, 3, 3, 3, 5, 3, 3, 3, 3, 3, 3]
    };

    // random surnames from https://en.geneanet.org/genealogy/ popularity around 1,000,000
    var names = {
        "2No": "None",
        "4No": "None",
        "8No": "None",
        "2Low": "A",
        "4Low": "C",
        "8Low": "F",
        "2Mid": "H",
        "4Mid": "B",
        "8Mid": "E",
        "2High": "I",
        "4High": "D",
        "8High": "G"
    };

    var ps = { // generated from Beta(2, 2) (see matlab file experiment_modified.m)
        "2No"  : [0.6587, 0.0749],
        "4No"  : [0.7958, 0.3499, 0.5524, 0.3952],
        "8No"  : [0.5257, 0.5903, 0.7394, 0.3278, 0.1815, 0.4394, 0.6862, 0.5051],
        "2Low" : [0.6587, 0.0749],
        "4Low" : [0.7958, 0.3499, 0.5524, 0.3952],
        "8Low" : [0.5257, 0.5903, 0.7394, 0.3278, 0.1815, 0.4394, 0.6862, 0.5051],
        "2Mid" : [0.6587, 0.0749],
        "4Mid" : [0.7958, 0.3499, 0.5524, 0.3952],
        "8Mid" : [0.5257, 0.5903, 0.7394, 0.3278, 0.1815, 0.4394, 0.6862, 0.5051],
        "2High": [0.6587, 0.0749],
        "4High": [0.7958, 0.3499, 0.5524, 0.3952],
        "8High": [0.5257, 0.5903, 0.7394, 0.3278, 0.1815, 0.4394, 0.6862, 0.5051]
    };

    // system
    var isTeacher; // whether their is a demonstrator
    var teacherPerform; // which teacher

    var isPractice; // whether the current game is practice
    var skipPractice = false; // able to skip practice session if having done it once
    var slotNum = 0; // id of each slot machine
    var slotSum = 0; // temp

    var numArms; // number of arms
    var p = new Array(); // probability array
    var t = Array(numTrials); // teacher's choices array
    var order = new Array(); // doors' order array
    var sumReward = 0; // total rewards a participant already gets
    var tempReward = 0;
    var money = 0; // money paid to the participant
    var thisReward = 0; // reward in each trial (1 or 0)
    var randomNum; // for generating an outcome (reward or not)
    
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

    var a; // these are for visual display alignment
    var b;
    var x;
    var h;
    var hm;
    var leftMar;
    var posLeft;
    var posTop;

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
    $('#Main').css({
        'height': thisHeight,
        'width': thisWidth
    });
    
    // checking pc or phone/pad
    if (isMobile() || isMobileOrTablet()) { // not working in pad?
        alert('Unfortunately, you need to be on a desktop or laptop computer in order to take part in this experiment.');
    } else if (isEdge || isIE || isOpera){
        alert('Sorry, but this experiment is only supported in Chrome/Firefox/Safari.');
    } else {
        expRewardsRandom(); // calculating the expected rewards of random policy
        expRewardsOpt(); // calculating the expected rewards of optimal policy 
        expRewardsMin(); // calculating the min expected rewards  
        // (always choosing the option with the highest reward rate)

        information(); // start the entire experiment
        // isPractice = 0;
        // control();
    };


    // full games -----------------------------------------------------------------------------------------------------------
    function control() { 
        $('#Top').css('height', thisHeight / 20);
        $('#Stage').css('width', dispWidth);
        $('#Stage').css('height', thisHeight * 17 / 20);
        $('#Bottom').css({
            'height': thisHeight / 20,
            'width': thisWidth,
            'bottom': document.body.clientHeight - thisHeight + thisHeight /20
        });

        createDiv('Stage', 'TextBoxDiv0');
        $('#TextBoxDiv0').css('font-size', thisWidth / 60 + 'px');
        $('#TextBoxDiv0').css('padding-top', '30%');

        if (numGames > 1) { // except the first game
            // rewards in each game
            trialReward[numGames - 2] = tempReward;
            sumReward = sumReward + tempReward;
            tempReward = 0;

            slotSum = slotSum + numArms; // used for the id of each slot machine

            for (i = 0; i < numTrials; i++) { // re-ordering participants' choices in the previous game
                var temp = subChoice[numArms + teacherPerform][i];
                subChoiceReorder[numArms + teacherPerform][i] = order[temp - 1];
            };
            console.log('actual choices = [' + String(subChoice[numArms + teacherPerform]) + ']');
            console.log('re-ordered choices = [' + String(subChoiceReorder[numArms + teacherPerform]) + ']');
        };

        if (numGames <= conditions.length) { // all games
            numArms = parseInt(conditions[numGames - 1].substring(0, 1)); // 2, 4, or 8
            posAlign(numArms);

            isTeacher = conditions[numGames - 1].substring(1) !== "No"; // whether there is demonstrator or not
            teacherPerform = conditions[numGames - 1].substring(1); // "No", "Low", "Mid", or "High"

            order = Array.from({ length: numArms }, (item, index) => index + 1); // generating an array like [1, 2, 3, 4]
            order.sort(function () { // randomising doors' order in a game
                return Math.random() - 0.5;
            });
            console.log('order = [' + String(order) + ']');

            for (i = 0; i < numArms; i++) {
                p[i] = ps[conditions[numGames - 1]][order[i] - 1]; // reordering the reward rates
            };
            console.log('actual ps = [' + String(ps[conditions[numGames - 1]]) + ']');
            console.log('re-ordered ps = [' + String(p) + ']');

            if (isTeacher) {
                for (i = 0; i < numTrials; i++) {
                    t[i] = order.indexOf(teacher[conditions[numGames - 1]][i]) + 1; // reordering the choices of the teacher
                };
            };
            console.log('actual demos = [' + String(teacher[conditions[numGames - 1]]) + ']');
            console.log('re-ordered demos = [' + String(t) + ']');
            isTeacherDisplay = names[conditions[numGames - 1]];
            
            if (numGames === 1) { // the first game
                var title = '<div id="Title"><h2 align="center">' + 'Game No. <b>' + numGames + '</b>' + 
                            ' of ' + conditions.length + '<br><br>' +
                            'Number of slot machines: <b>' + numArms + '</b><br>' +
                            'Demonstrator: <b>' + isTeacherDisplay + '</b>' +
                            '</h2><div>';
            } else {
                var title = '<div id="Title"><h2 align="center">' + 'Game No. <b>' + numGames + '</b>' + 
                            ' of ' + conditions.length + '<br><br>' +
                            'Number of slot machines: <b>' + numArms + '</b><br>' +
                            'Demonstrator: <b>' + isTeacherDisplay + '</b><br><br>' +
                            'You have collected <b>' + sumReward + '</b> coins (' + 
                            sumReward + ' cents) in this study so far!' +
                            '</h2><div>';
            };
            var buttons = '<div align="center"><input align="center" type="button" class="btn btn-outline-dark"' +
                        ' id="toTrial" value="Start!"></div>';
        };

        if (numGames > conditions.length) { // after the last game
            timeEnd = new Date();
            var title = '<div id="Title"><h2 align="center">' + 
                        'You have completed all the games.' + '<br><br>' +
                        'You have collected <b>' + sumReward + '</b> coins (' + 
                        sumReward + ' cents) in this study so far!' +
                        '</h2><div>';
            var buttons = '<div align="center"><input align="center" type="button" class="btn btn-outline-dark"' +
                        ' id="toEnd" value="Continue"></div>';
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

    // information page -----------------------------------------------------------------------------------------------------
    function information() {
        $('#Top').css('height', thisHeight / 20);
        $('#Stage').css('width', dispWidth);
        $('#Stage').css('height', thisHeight * 17 / 20);
        $('#Bottom').css({
            'height': thisHeight / 20,
            'width': thisWidth,
            // 'position': 'absolute',
            'bottom': document.body.clientHeight - thisHeight + thisHeight /20
        });
        createDiv('Stage', 'Title');
        createDiv('Stage', 'TextBoxDiv');

        $('#TextBoxDiv').css('font-size', thisWidth / 60 + 'px');
        $('#TextBoxDiv').css('padding-top', '5%');

        var title = '<h2 align="center">Information for Participants</h2>'; 
        var info = '<div class="scroll_text" id="consent-info">' +
                   '<p><b>Nature of the study.&nbsp;</b>You are invited to participate in a study which involves choosing ' +
                       'repeatedly among multiple pictures, each of which is associated with a certain probability of ' + 
                       'getting additional rewards. Your final compensation in this experiment will be dependent on your ' + 
                       'choices. After the experiment, we will ask you you to provide some basic demographics (e.g., age). ' + 
                       'Your session should last for around 15 minutes. You will be given full instructions shortly.</p>' +
                    '<p><b>Compensation.&nbsp;</b>You will be paid $1.00~2.30 for your participation.</p>' + 
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
                            '<li>You <b>can only</b> participate if you use Google Chrome.</li>' +
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
            'overflow-y': 'scroll'
        });

        var buttons = '<div align="center"><input align="center" type="button" class="btn btn-outline-dark"' +
            ' id="toReminder" value="Accept HIT" disabled></div>';
        var buttons2 = '<div align="center"><input align="center" type="button" class="btn btn-outline-dark"' +
            ' id="startExp" value="Understood"></div>';
        $('#Bottom').html(buttons); // click button to proceed

        $('#consent-info').scroll(function() {
            if ($(this)[0].scrollHeight - $(this).scrollTop() - $(this).outerHeight() < 5) {
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
                // if (!isFullScreen()) {
                //     alert('Please use the full-screen mode if possible.\n' + 
                //           'For Windows, press F11 (or Fn + F11).\n' + 
                //           'For Mac, press Ctrl + Cmd + F');
                // };

                $('#Title').remove();
                $('#TextBoxDiv').remove();
                $('#Stage').empty();
                $('#Bottom').empty();
                
                instructions(1); // move to the first page of instrcutions
            });
        });        
    };

    // instructions ---------------------------------------------------------------------------------------------------------
    function instructions(pageNum) {
        $('#Top').css('height', thisHeight / 20);
        $('#Stage').css('width', dispWidth);
        var picHeight = dispWidth / 2;
        createDiv('Stage', 'Title');
        createDiv('Stage', 'TextBoxDiv');

        var title = '<h2 align="center">Instructions</h2>';
        switch (pageNum) {
            case 1:
                var info1 = '<p><i>***Please remember to read all instructions <b>carefully</b>. ' + 
                    'You will have to complete a <b>comprehension quiz</b> at the end of the instructions.***</i></p>';
                var info2 = '<p>Thanks for participanting!</p>' + 
                    '<p>In this experiment, you will play ' + conditions.length + ' short games ' + 
                    '(excluding the practice session). ' +
                    'In each game you will have ' + numTrials + ' shots ' + 
                    'where you select one out of the <b>2 (4 or 8 ) slot machines</b> using your mouse.</p>' + 
                    '<p>For a given game, each slot machine has a <b>fixed</b> chance ' + 
                    'of giving you a <b>coin</b> every time that you select it. ' + 
                    'Different slot machines may be more or less likely than one another to produce a coin. ' + 
                    'Your goal is to <b>collect as many coins as possible.</b> ' + 
                    'For every coin you collect in the task, you will earn additional $0.01 ' + 
                    'meaning you can make up to $1.30 in bonus.</p>';
                var thisImage = '<div align="center"><img class="pics" src="static/images/instruction1.png" ' + 
                    'alt="picture for instructions" height="' + picHeight + '" align="center">' + 
                    '<p><i>An example of a game in the experiment.</i></p>' + '</div>';
                break;
            case 2:
                var info1 = '<p><i>***Please remember to read all instructions <b>carefully</b>. ' + 
                    'You will have to complete a <b>comprehension quiz</b> at the end of ' + 
                    'the instructions.***</i></p>';
                var info2 = '<p>In some of the games, before making your decision, you can see the choice of ' + 
                    'a <b>previous player</b> ' + 
                    '(demonstrator) who has played <b>exactly the same game</b> as you are playing. ' + 
                    'That is, for each slot machine, the <b>chance of producing a coin</b> is the same for ' +
                    'the demonstrator and for you. ' +
                    'The demonstrator\'s choice will be shown as a cartoon finger (see image below).</p>' + 
                    '<p>For each game you will see a <b>different demonstrator</b>, ' + 
                    'who might <b>perform well or badly.</b> ' + 
                    'However you will <b>not</b> be able to see what outcomes they get ' + 
                    'but only the choices they made. ' + 
                    'The code of the demonstrator will be displayed before each game starts ' + 
                    '(codes, instead of names, are used in this experiment to preserve anonymity).</p>';
                var thisImage = '<div align="center"><img class="pics" src="static/images/instruction2.png" ' + 
                    'alt="picture for instructions" height="' + picHeight + '" align="center">' + 
                    '<p><i>The cartoon finger shows the choice made by the demonstrator.</i></p>' + '</div>';
                break;
            case 3:
                var info1 = '<p><i>***Please remember to read all instructions <b>carefully</b>. ' + 
                    'You will have to complete a <b>comprehension quiz</b> at the end of the instructions.***</i></p>';
                var info2 = '<p>After each decision, you will see the outcome of your choice (1 coin or nothing). ' +
                    'You will then continue directly to the next shot. ' +
                    'At the end of each game, you will see how many coins you have earned in total.</p>';
                var thisImage = '<div align="center">' + 
                    '<p align="left"><i>If you get a coin:</i></p>' +
                    '<img class="pics" src="static/images/instruction3.png" ' + 
                    'alt="picture for instructions" height="' + picHeight + '" align="center">' + 
                    '<p align="left"><br><br><i>If you get nothing:</i></p>' +
                    '<img class="pics" src="static/images/instruction4.png" ' + 
                    'alt="picture for instructions" height="' + picHeight + '" align="center">' + 
                    '</div>' +
                    '<p align="left"><br>This experiment takes around 15 minutes to complete on average.</p>';
                break;
            case 4:
                var info1 = '';
                var info2 = '<br><br><br><p>You will play two practice games before the comprehension quiz. ' + 
                    'You have 5 shots in each practice game, ' + 
                    'and you can see the probability of each slot machine generating a coin.</p>' + 
                    '<p>(Remember that in the experiment session, games are longer and ' + 
                    'the probability information will not be provided.)</p>' +
                    '<p>Click "Continue" to start the first practice game. ' +
                    'There is no demonstrator in the first practice game.</p>';
                if (skipPractice) {
                    info2 = info2 + '<p>You can click "Skip" to skip the practice session and ' +
                            'continue to the comprehension quiz.</p>';
                };
                var thisImage = '';
                break;
            case 5:
                var info1 = '';
                var info2 = '<br><br><br><p>You\'ve completed the first practice game!</p>' +
                    '<p>Click "Continue" to start the second practice game. This time, there will be a demonstrator.</p>';
                var thisImage = '';
                break;
            case 6:
                var info1 = '';
                var info2 = '<br><br><br><p>You\'ve completed the second practice game!</p>' +
                    '<p>Click "Continue" to start the comprehension quiz. ' + 
                    'Or you can click "Back" to read the instructions again.</p>';
                skipPractice = true;
                var thisImage = '';
                break;
        };
        
        $('#Title').html(title);
        $('#TextBoxDiv').html('<div>' + info1 + 
                                '<div id="inst-text" class="scroll_text">' + info2 + thisImage + '</div>' + '</div>');

        $('#TextBoxDiv').css({
            'font-size': thisWidth / 60 + 'px',
            'padding-top': '5%'
        });

        $('.pics').css({
            "border-color": "#000000",
            "border-width": "2px",
            "border-style": "solid"
        });

        var buttons = '<div align="center">' + 
            '<input align="center" type="button" class="btn btn-outline-dark" id="Back" value="Back">' + 
            '<input align="center" type="button" class="btn btn-outline-dark" id="Next" value="Next" disabled>' +
            '<input align="center" type="button" class="btn btn-outline-danger" id="Start" ' + 
                'value="Continue" disabled>' + 
            '<input align="center" type="button" class="btn btn-outline-danger" id="Skip" ' + 
                'value="Skip">' + 
            '</div>';
        $('#Bottom').html(buttons);
        $('#Bottom').css({
            'height': thisHeight / 20,
            'width': thisWidth,
            'bottom': document.body.clientHeight - thisHeight + thisHeight /20
        });

        $('#Skip').hide();
        if (skipPractice && pageNum === numPages) {
            $('#Skip').show();
        };

        if (pageNum === 1 || pageNum === numPages + 1) {
            $('#Back').hide();
        };
        if (pageNum >= numPages) {
            $('#Next').hide();

            $('.scroll_text').css({
                'height': thisHeight * 12 / 20,
                'width': dispWidth,
                'overflow-y': 'auto'
            });
        };
        if (pageNum < numPages) {
            $('#Start').hide();

            $('.scroll_text').css({
                'height': thisHeight * 12 / 20,
                'width': dispWidth,
                'overflow-y': 'scroll'
            });
        };
    
        $('#inst-text').scroll(function() {
            if ($(this)[0].scrollHeight - $(this).scrollTop() - $(this).outerHeight() < 5) {
                   $('#Next').prop('disabled', false);
                   $('#Start').prop('disabled', false);
            };
        });

        if ($('#inst-text')[0].scrollHeight - $('#inst-text').scrollTop() - $('#inst-text').outerHeight() < 5) {
            $('#Next').prop('disabled', false);
            $('#Start').prop('disabled', false);
        };

        $('#Back').click(function () {
            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            if (pageNum === numPages + 2) {
                instructions(1); // return to the first page of instructions
            } else {
                instructions(pageNum - 1);
            };
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

            tempReward = 0; // current rewards in each game

            if (pageNum === numPages) {
                isPractice = 1;
                numTrials = 5;
                practice(2, false); // practice game - no demonstrator
            };
            if (pageNum === numPages + 1) {
                isPractice = 2;
                numTrials = 5;
                practice(4, true); // practice game - demonstrator
            };
            if (pageNum === numPages + 2) {
                isPractice = 0;
                numTrials = 20;
                comprehension();
            };
        });

        $('#Skip').click(function() {
            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();

            isPractice = 0;
            numTrials = 20;
            comprehension();
        });
    };

    // practice -------------------------------------------------------------------------------------------------------------
    function practice(numArmsTemp, isTeacherTemp) {
        $('#Top').css('height', thisHeight / 20);
        $('#Stage').css('width', dispWidth);
        $('#Stage').css('height', thisHeight * 17 / 20);
        $('#Bottom').css({
            'height': thisHeight / 20,
            'width': thisWidth,
            'bottom': document.body.clientHeight - thisHeight + thisHeight /20
        });

        createDiv('Stage', 'TextBoxDiv0');
        $('#TextBoxDiv0').css('font-size', thisWidth / 60 + 'px');
        $('#TextBoxDiv0').css('padding-top', '30%');

        numArms = numArmsTemp;
        posAlign(numArms);

        isTeacher = isTeacherTemp;
        numGames = 0;
        
        switch (numArms) {
            case 2:
                p = [0.1, 0.8];
                if (isTeacher) {
                    t = [1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 1];
                };
                break;
            case 4:
                p = [0.3, 0.7, 0.6, 0.2];
                if (isTeacher) {
                    t = [3, 2, 3, 3, 2, 2, 1, 4, 2, 2, 2, 3, 3, 2, 2];
                };
                break;
            case 8:
                p = [0.9, 0.1, 0.7, 0.4, 0.5, 0.5, 0.6, 0.2];
                if (isTeacher) {
                    t = [7, 8, 1, 1, 1, 1, 3, 4, 1, 1, 1, 3, 3, 1, 1];
                };
                break;
        };
        
        if (isTeacher) {
            switch (numArms) {
                case 2:
                    isTeacherDisplay = "J";
                    break;
                case 4:
                    isTeacherDisplay = "K";
                    break;
                case 8:
                    isTeacherDisplay = "L";
                    break;
            };
        } else {
            isTeacherDisplay = "None";
        };

        var title = '<div id="Title"><h2 align="center">' + 'Practice Game<br><br>' +
                    'Number of slot machines: <b>' + numArms + '</b><br>' +
                    'Demonstrator: <b>' + isTeacherDisplay + '</b>' + '</h2><div>';
        var buttons = '<div align="center"><input align="center" type="button" class="btn btn-outline-dark"' +
                        ' id="toTrial" value="Start!"></div>';

        $('#TextBoxDiv0').html(title);
        $('#Bottom').html(buttons); 

        $('#toTrial').click(function () {
            $('#TextBoxDiv0').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            options(1);
        });
    };

    // comprehension checking -----------------------------------------------------------------------------------------------
    function comprehension() {
        $('#Top').css('height', thisHeight / 20);
        $('#Stage').css('width', dispWidth);
        $('#Stage').css('height', thisHeight * 17 / 20);
        $('#Bottom').css({
            'height': thisHeight / 20,
            'width': thisWidth,
            'bottom': document.body.clientHeight - thisHeight + thisHeight /20
        });
        createDiv('Stage', 'Title');
        createDiv('Stage', 'TextBoxDiv');

        $('#TextBoxDiv').css('font-size', thisWidth / 60 + 'px');
        $('#TextBoxDiv').css('padding-top', '5%');

        // correct answers for the comprehension quiz
        var answers = ["true", "false", "false", "true", "true"];

        var title = '<h2 align="center">Comprehension Quiz</h2>';
        var info = '<div id="comprehension" class="form-horizontal">' + 
                   '<p>Please answer the following questions before starting the task. ' +
                   'These are necessary for ensuring that you read and understood the instructions.<br><br></p>' +
                   '<div class="scroll_text">' +
                   '<ol id="quiz-text">' + 
                        '<li>Each slot machine has a fixed but different probability of giving a coin. ' +
                            'Some slot machines are more likely to give a coin than the others.<br>' +
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
                        '<li>The demonstrators have played exactly the same game as you will be playing. ' + 
                            'For each slot machine, the chance of producing a coin is the same for ' +
                            'the demonstrator and for you.<br>' +
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
                   '</ol>' + '</div>' + '</div>';
        $('#Title').html(title);
        $('#TextBoxDiv').html(info);

        $('.scroll_text').css({
            'height': thisHeight * 12 / 20,
            'width': dispWidth,
            'overflow-y': 'scroll'});
        $('#quiz-text').css({ // styling the scrolled text (text only)
            'width': dispWidth * 9 / 10
        });

        var buttons = '<div align="center">' + 
                      '<input align="center" type="button" class="btn btn-outline-dark" id="Check" value="Check answers">' + 
                      '<input align="center" type="button" class="btn btn-outline-dark" id="back_to_ins" value="Back">' + 
                      '</div>';
        $('#Bottom').html(buttons);
        $('#back_to_ins').hide();

        $('#Check').click(function () {

            var qs = new Array(5);
            for (let i = 1; i <= 5; i ++) {
                qs[i - 1] = $('#comp_q' + i).val();
            };

            if (qs.indexOf("noresp") !== -1) {
                alert('You need to answer all questions.');
            } else if (String(qs) === String(answers)) {
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
                var wrongs = new Array();
                var j = 0;
                for (let i = 1; i <= 5; i ++) {
                    if (qs[i - 1] !== answers[i - 1]) {
                        wrongs[j] = i;
                        j ++;
                    };
                };

                alert('You answered at least one question (No. ' + wrongs.join(', ') +
                      ') incorrectly! Please try again.');
                
                $('#Check').hide();
                $('#back_to_ins').show();
            };
        });

        $('#back_to_ins').click(function() {  
            skipPractice = true;         
        
            $('#comp_q1').prop('selectedIndex', 0);
            $('#comp_q2').prop('selectedIndex', 0);
            $('#comp_q3').prop('selectedIndex', 0);
            $('#comp_q4').prop('selectedIndex', 0);
            $('#comp_q5').prop('selectedIndex', 0);

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            instructions(1);
        })
    }; 
    // options --------------------------------------------------------------------------------------------------------------
    function options(trialNum) {
        if (trialNum > numTrials) {
            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            $('#Top').empty();
            $('#Title').empty();
            $('#Middle').empty();
            numGames++;

            if (isPractice === 1) {
                instructions(numPages + 1);
            } else if (isPractice === 2) {
                instructions(numPages + 2);
            } else {
                control();
            };

        } else {
            $('#Top').css({
                'height': thisHeight / 20,
                'width': dispWidth
            });
            $('#Stage').css({
                'height': thisHeight * 17 / 20,
                'width': dispWidth
            });
            $('#Bottom').css({
                'height': thisHeight / 20,
                'width': thisWidth,
                'bottom': document.body.clientHeight - thisHeight + thisHeight /20
            });

            createDiv('Stage', 'TextBoxDiv');
            $('#TextBoxDiv').css('margin-top', '10%');

            if (isPractice === 0) {
                // var infoTrial1 = '<div id="info1" align="left">Coins already collected in the current game: ' + 
                //         tempReward + '<br>' +
                //         'Coins collected in previous games in total: ' + sumReward + '</div>';
                var infoTrial1 = '<div id="info1" align="left">' + 
                        'Coins collected in the current game / in total: ' + 
                        tempReward + ' / ' + (tempReward + sumReward) + '<br>' + 
                        'Demonstrator : ' + isTeacherDisplay + '</div>';
                var infoTrial2 = '<div id="info2" align="right">Trial ' + trialNum + ' of ' + numTrials + '<br>' +
                        'Game ' + numGames + ' of ' + conditions.length + '</div>';
            } else {
                // var infoTrial1 = '<div id="info1" align="left">Coins already collected in the current game: ' + 
                //         tempReward + '</div>';
                var infoTrial1 = '<div id="info1" align="left">' + 
                        'Coins collected in the current game: ' + 
                        tempReward + '<br>' + 
                        'Demonstrator : ' + isTeacherDisplay + '</div>';
                var infoTrial2 = '<div id="info2" align="right">Trial ' + trialNum + ' of ' + numTrials + '<br>' +
                        'Practice Game ' + isPractice + '</div>';
            };
            
            $('#Top').html(infoTrial1 + infoTrial2);
            $('#info1').css({
                'position': 'absolute',
                'top': '0px',
                'left': (document.body.clientWidth - thisWidth) / 2 + 10
            });
            $('#info2').css({
                'position': 'absolute',
                'top': '0px',
                'right': (document.body.clientWidth - thisWidth) / 2 + 10
            });
            $('#Top').css('font-size', thisWidth / 45 + 'px');

            var title = '<div id="Title"><h2 align="center">Make a choice:</h2></div>';
            $('#Stage').append(title);
            $('#Title').css({
                'position': 'absolute',
                'left': '10%',
                'top': '15%',
                'width': '80%',
                'font-size': thisWidth / 36 + 'px'
            });

            var machines = '';
            for (let i = 1; i <= numArms; i++) { // roll-able slot machines
                if (isPractice === 1) {
                    slotNum = 100 + i;
                    var slotInfo = '<p id="slot_info' + i + '" align="center">' + 
                                   'No. ' + (Array(3).join("0") + slotNum).slice(-3) + '<br><br>' + 
                                   p[i-1] * 100 + '% chance' + '<br>' +
                                   'of a coin' + '</p>';
                };
                if (isPractice === 2) {
                    slotNum = 200 + i;
                    var slotInfo = '<p id="slot_info' + i + '" align="center">' + 
                                   'No. ' + (Array(3).join("0") + slotNum).slice(-3) + '<br><br>' + 
                                   p[i-1] * 100 + '% chance' + '<br>' +
                                   'of a coin' + '</p>';
                };
                if (isPractice === 0) {
                    slotNum = slotSum + i;
                    var slotInfo = '<p id="slot_info' + i + '" align="center">No. ' +
                                   (Array(3).join("0") + slotNum).slice(-3) + '</p>';
                };
                machines = machines + '<div class="container" id="randomize' + i + '">' +
                '<div class="row">' +
                    '<div class="col-xs-12">' +  
                    '<div><img src="static/images/slot_background_onclick.png" id="slot_background_white' + i + '"></div>' + 
                        '<div class="row">' +                 
                            '<div class="col-xs-4">' +
                                '<div>' +
                                '<div id="machine1' + i + '" class="randomizeMachine">' +
                                '<div><img src="static/images/icon0.png" width="100%" /></div>' +
                                '<div><img src="static/images/icon1.png" width="100%" /></div>' +
                                '<div><img src="static/images/icon2.png" width="100%" /></div>' +
                                '<div><img src="static/images/icon3.png" width="100%" /></div>' +
                                '<div><img src="static/images/icon4.png" width="100%" /></div>' +
                                '<div><img src="static/images/icon5.png" width="100%" /></div>' +
                                '</div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="col-xs-4">' +
                                '<div>' +
                                '<div id="machine2' + i + '" class="randomizeMachine">' +
                                '<div><img src="static/images/icon0.png" width="100%" /></div>' +
                                '<div><img src="static/images/icon1.png" width="100%" /></div>' +
                                '<div><img src="static/images/icon2.png" width="100%" /></div>' +
                                '<div><img src="static/images/icon3.png" width="100%" /></div>' +
                                '<div><img src="static/images/icon4.png" width="100%" /></div>' +
                                '<div><img src="static/images/icon5.png" width="100%" /></div>' +
                                '</div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="col-xs-4">' +
                                '<div>' +
                                '<div id="machine3' + i + '" class="randomizeMachine">' +
                                '<div><img src="static/images/icon0.png" width="100%" /></div>' +
                                '<div><img src="static/images/icon1.png" width="100%" /></div>' +
                                '<div><img src="static/images/icon2.png" width="100%" /></div>' +
                                '<div><img src="static/images/icon3.png" width="100%" /></div>' +
                                '<div><img src="static/images/icon4.png" width="100%" /></div>' +
                                '<div><img src="static/images/icon5.png" width="100%" /></div>' +
                                '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                        '<div>' + 
                            '<img src="static/images/slot_background_preclick.png" id="slot_background' + i + '">' + 
                            slotInfo + '</div>' + 
                    '</div>' +
                '</div>' +
                '</div>';
            };
            
            $('#TextBoxDiv').html(machines);

            for (let i = 1; i <= numArms; i++) { // css styles of slot machines
                $('#slot_background' + i).css({ // position of one slot machine
                    'position': 'absolute', 
                    'left': posLeft[i - 1],
                    'top': posTop[i - 1],
                    'width': b,
                    'height': hm,
                    'cursor': 'pointer'
                });

                $('#slot_background_white' + i).css({ // white layer (bottom layer)
                    'position': 'absolute', 
                    'left': posLeft[i - 1],
                    'top': posTop[i - 1],
                    'width': b,
                    'height': hm
                });

                if (isPractice === 0) {
                    $('#slot_info' + i).css({ // text (information) under slot machines
                        'position': 'absolute',
                        'left': posLeft[i - 1] + b * 0.12,
                        'top': posTop[i - 1] + hm * 1.05,
                        'font-size': thisWidth / 45 + 'px',
                        'line-height':'120%'
                    });
                } else {
                    $('#slot_info' + i).css({ // text (information) under slot machines
                        'position': 'absolute',
                        'left': posLeft[i - 1] - b * 0.075,
                        'top': posTop[i - 1] + hm * 1.05,
                        'font-size': thisWidth / 45 + 'px',
                        'line-height':'120%'
                    });
                }

                // three rollers inside the slot machine
                $('#machine1' + i).css({
                    'position': 'absolute',
                    'left': posLeft[i - 1] + b * 0.13,
                    'top': posTop[i - 1] + hm * 0.3225,
                    'opacity': 0
                });
                $('#machine2' + i).css({
                    'position': 'absolute',
                    'left': posLeft[i - 1] + b * 0.3535,
                    'top': posTop[i - 1] + hm * 0.3225,
                    'opacity': 0
                });
                $('#machine3' + i).css({
                    'position': 'absolute',
                    'left': posLeft[i - 1] + b * 0.565,
                    'top': posTop[i - 1] + hm * 0.3225,
                    'opacity': 0
                });

                $('.randomizeMachine').css({ 
                    /* icons display: randomize-col-div.width = randomizeMachine.width + 2 * col.padding-left */
                    'width': b * 0.1775,
                    'height': b / 3
                });
            };

            if (isTeacher) {
                var whichDemo = t[trialNum - 1]; // which door does the teacher choose in the current trial

                $('#TextBoxDiv').append('<img id="Point" src="static/images/point.png">');
                $('#Point').css({
                    'position': 'absolute',
                    'left': '48%',
                    'top': h[0] - thisHeight / 12,
                    'width': b / 2
                });

                $("#Point").animate({
                    left: $('#slot_background' + whichDemo).position().left + $('#slot_background' + whichDemo).width() / 3,
                    top: h[Number(whichDemo > 4.5)] + thisHeight / 12
                }, movePoint);
                $('#Point').delay(stayPoint);
                $('#Point').fadeOut(fadePoint, function () { // prevent from clicking before the end of demonstration
                    $('#Point').empty(); // clear "point" otherwise user cannot click on the position                
                    var isClick = true; // prevent from clicking too fast / too many times
                    for (let i = 1; i <= numArms; i++) {
                        $('#slot_background' + i).click(function () {
                            if (isClick) {
                                isClick = false;
                                reward(trialNum, i);                                
                            };
                        });
                    };
                });

            } else {
                var isClick = true; // prevent from clicking too fast / too many times
                for (let i = 1; i <= numArms; i++) {
                    $('#slot_background' + i).click(function () {
                        if (isClick) {
                            isClick = false;
                            reward(trialNum, i);
                        };
                    });
                };
            };

        };

    };

    // rewards --------------------------------------------------------------------------------------------------------------
    function reward(trialNum, i) {

        document.getElementById('slot_background' + i).src="static/images/slot_background.png";

        if (isPractice === 0) {
            subChoice[numArms + teacherPerform][trialNum - 1] = i;  
        };

        // display icon images
        for (let j = 1; j <= 3; j++){
            $('#machine' + j + i).css({
                'opacity': 1
            });
        };

        // generating an outcome
        randomNum = Math.random();
        if (randomNum < p[i - 1]) {
            // slot machine effect
            var machine1 = $('#machine1' + i).slotMachine({ 
                active : 4,
                delay : delayTime,
                randomize() {
                    return 0;
                }
            });
            var machine2 = $('#machine2' + i).slotMachine({ 
                active : 1,
                delay : delayTime,
                randomize() {
                    return 0;
                }
            });
            var machine3 = $('#machine3' + i).slotMachine({ 
                active : 3,
                delay : delayTime,
                randomize() {
                    return 0;
                }
            });

            thisReward = 1;

            if (isPractice === 0) {
                subReward[numArms + teacherPerform][trialNum - 1] = 1;
            };
        } else {
            // slot machine effect
            var machine1 = $('#machine1' + i).slotMachine({ 
                active : 4,
                delay : delayTime,
                randomize() {
                    return 2;
                }
            });
            var machine2 = $('#machine2' + i).slotMachine({ 
                active : 1,
                delay : delayTime,
                randomize() {
                    return 5;
                }
            });
            var machine3 = $('#machine3' + i).slotMachine({ 
                active : 3,
                delay : delayTime,
                randomize() {
                    return 0;
                }
            });
            
            thisReward = 0;

            if (isPractice === 0) {
                subReward[numArms + teacherPerform][trialNum - 1] = 0;
            };
        };

        machine1.shuffle();
        setTimeout(() => machine2.shuffle(), delayTime);
        setTimeout(() => machine3.shuffle(toOptions), delayTime * 2);
        
        function toOptions() {
            if (thisReward === 1) { // coin
                $('#Stage').append('<p align="center" id="outcome_text">You got a coin!!</p>');
                $('#TextBoxDiv').append('<img id="Reward" src="static/images/coin.png">');
                tempReward = tempReward + 1;

                $('#slot_background' + i).css({
                    "outline-color": "#FBC920",
                    "outline-width": "5px",
                    "outline-style": "solid"
                });

            } else { // no coin
                $('#Stage').append('<p align="center" id="outcome_text">You got nothing...</p>');
                $('#TextBoxDiv').append('<img id="Reward" src="static/images/frowny.png">');

                $('#slot_background' + i).css({
                    "outline-color": "#B11F1F",
                    "outline-width": "5px",
                    "outline-style": "solid"
                });
            };

            $('#Reward').css({
                'position': 'absolute',
                'left': $('#slot_background' + i).position().left + thisWidth / 45,
                'top': h[Number(i > 4.5)] + thisHeight * 0.025,
                'width': b / 2
            });

            $('#outcome_text').css({
                'position': 'absolute',
                'left': $('#slot_background' + i).position().left - thisWidth / 45,
                'top': h[Number(i > 4.5)] - thisHeight * 0.05,
                'font-size': thisWidth / 45 + 'px'
            });

            setTimeout(function () {
                $('#outcome_text').fadeOut(fadeTime);
                $('#TextBoxDiv').fadeOut(fadeTime);
                $('#Title').fadeOut(fadeTime);
                setTimeout(function () {
                    $('#Stage').empty();
                    $('#Bottom').empty();
                    options(trialNum + 1);
                }, fadeTime);
            }, stayTime);
        };

        
    };

    // ending ---------------------------------------------------------------------------------------------------------------
    function end() {
        $('#Top').css('height', thisHeight / 20);
        $('#Stage').css('width', dispWidth);
        $('#Stage').css('height', thisHeight * 17 / 20);
        $('#Bottom').css({
            'height': thisHeight / 20,
            'width': thisWidth,
            'bottom': document.body.clientHeight - thisHeight + thisHeight /20
        });

        createDiv('Stage', 'Title');
        createDiv('Stage', 'TextBoxDiv');

        $('#TextBoxDiv').css({
            'font-size': thisWidth / 60 + 'px',
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
            'overflow-y': 'scroll'
        });
        $('#form-text').css({ // styling the scrolled text (text only)
            'width': dispWidth * 9 / 10
        });

        var buttons = '<div align="center"><input align="center" type="button" class="btn btn-outline-dark"' +
            ' id="submitFeedback" value="Submit"></div>';
        $('#Bottom').html(buttons); // click button to submit
        
        money = 1 + sumReward * 0.01;

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
        $('#Stage').css('height', thisHeight * 17 / 20);
        createDiv('Stage', 'Title');
        createDiv('Stage', 'TextBoxDiv');

        $('#TextBoxDiv').css('font-size', thisWidth / 60 + 'px');
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
        $('#Stage').css('height', thisHeight * 17 / 20);
        createDiv('Stage', 'Title');
        createDiv('Stage', 'TextBoxDiv');

        $('#TextBoxDiv').css('font-size', thisWidth / 60 + 'px');
        $('#TextBoxDiv').css('padding-top', '20%');

        var title = '<h2 align="center">Error<br><br></h2>';
        var info = '<div>Your reference code is: ' + subID + '<br><br>' +
            '<span style="color: red">Error: the data might not upload to database successfully. ' + 
            'Please SCREENSHOT this page and contact the experimenter.</span>' + '</div>';

        $('#Title').html(title);
        $('#TextBoxDiv').html(info);
    };
    
    
    // utility functions -----------------------------------------------------------------------------------------------------

    // position alignment of alternatives
    function posAlign(thisNumArms) {
        switch (thisNumArms) { // position numbers setting
            case 2:
                //  | screen | Stage(left) - a - | Door1 - b - | background - x - | ...
                leftMar = (document.body.clientWidth - thisWidth) / 2;
                a = thisWidth / 4;
                b = thisWidth / 9;
                hm = b * 1.25;
                x = (thisWidth - 2 * a - 2 * b);
                h = [thisHeight * 0.5];

                posLeft = [leftMar + a, leftMar + a + b + x];
                posTop = [h[0], h[0]];
                break;

            case 4:
                //  | screen | Stage(left) - a - | Door1 - b - | background - x - | ...
                leftMar = (document.body.clientWidth - thisWidth) / 2;
                a = thisWidth / 6;
                b = thisWidth / 9;
                hm = b * 1.25;
                x = (thisWidth - 2 * a - 4 * b) / 3;
                h = [thisHeight * 0.5];

                posLeft = [leftMar + a, leftMar + a + b + x, leftMar + a + 2 * (b + x), leftMar + a + 3 * (b + x)];
                posTop = [h[0], h[0], h[0], h[0]];
                break;

            case 8:
                //  | screen | Stage(left) - a - | Door1 - b - | background - x - | ...
                leftMar = (document.body.clientWidth - thisWidth) / 2;
                a = thisWidth / 6;
                b = thisWidth / 9;
                hm = b * 1.25;
                x = (thisWidth - 2 * a - 4 * b) / 3;
                h = [thisHeight * 0.35, thisHeight * 0.7];

                posLeft = [leftMar + a, leftMar + a + b + x, leftMar + a + 2 * (b + x), leftMar + a + 3 * (b + x),
                        leftMar + a, leftMar + a + b + x, leftMar + a + 2 * (b + x), leftMar + a + 3 * (b + x)];
                posTop = [h[0], h[0], h[0], h[0], h[1], h[1], h[1], h[1]];
                break;
        };
    };

    // checking whether the current ip is already in the database (participated the experiment before)
    // copied from Tia!
    function ipcheck () {
        console.log('test');

        jQuery.ajax({
            url: 'static/php/check_id.php',
            type:'POST',
            success:function(data)
            {
                if (data==1)
                {
                    Oops();
                } else if (data==0)
                {
                    information();
                } else {
                    alert('answer was not 1 or 0!');
                }
                
            },
            error:function()
            {
                alert('failed to connect to ip')
            }
        })
    };
    
    function Oops(){
        $('#Top').css('height', thisHeight / 20);
        $('#Stage').css('width', dispWidth);
        $('#Stage').css('height', thisHeight * 17 / 20);
        createDiv('Stage', 'TextBoxDiv');

        $('#TextBoxDiv').css('font-size', thisWidth / 60 + 'px');
        $('#TextBoxDiv').css('padding-top', '20%');

        var HIT = '3C8QQOM6JQSODD6QQ7XZ098QZ3NILM';

        var info = '<p>Unfortunately, you cannot do this experiment because you (or someone in your household) have ' + 
                   'participated in this experiment or a similar experiment before ' + 
                   '(the HIT ID of the experiment is ' + HIT + ').</p>' +
                   '<p>Please close the window. Thank you!</p>';
        
        $('#TextBoxDiv').html(info);
    };
    
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