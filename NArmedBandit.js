$(document).ready(function () {
    // initialising variables ------------------------------------------------------------------------------------------------
    // adjustable
    var numTrials = 15; // number of trials
    var fadeTime = 200; // fade out time (after reward being displayed in each trial)
    var stayTime = 200; // result stay time (after reward being displayed in each trial)
    var movePoint = 500; // moving time for the point
    var stayPoint = 100; // point stay time
    var fadePoint = 100; // point fade out time

    var teacher = { // numArms + teacherPerform (see matlab file experiment.m)
        "2Low"  : [2, 1, 2, 2, 1, 1, 1, 2, 2, 1, 1, 2, 1, 1, 2], 
        "2High" : [2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], 
        "4Low"  : [4, 1, 4, 3, 4, 1, 3, 1, 2, 3, 1, 1, 2, 3, 1],
        "4High" : [4, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        "8Low"  : [6, 1, 5, 2, 7, 2, 5, 6, 5, 5, 1, 7, 7, 7, 4],
        "8High" : [2, 2, 3, 7, 7, 7, 7, 7, 8, 7, 2, 2, 6, 5, 5]
    };

    var ps = { // generated from Beta(2, 2) (see matlab file experiment.m)
        "2No"   : [0.6587, 0.0749],
        "4No"   : [0.7287, 0.4253, 0.6671, 0.1911],
        "8No"   : [0.2965, 0.6915, 0.4265, 0.2132, 0.3079, 0.2206, 0.3604, 0.4732],
        "2Low"  : [0.7091, 0.5989],
        "4Low"  : [0.3495, 0.2870, 0.6070, 0.3308],
        "8Low"  : [0.3553, 0.4551, 0.4378, 0.5093, 0.6155, 0.4025, 0.3933, 0.7649],
        "2High" : [0.4356, 0.6446],
        "4High" : [0.5069, 0.7603, 0.8165, 0.1660],
        "8High" : [0.8031, 0.2143, 0.2514, 0.1146, 0.3846, 0.2437, 0.6357, 0.1272]    
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

    var init = (new Date()).getTime(); // the time the experiment starts
    var subID = createCode();

    var subChoice = { // numArms + teacherPerform
        "2Low"  : [], 
        "2High" : [], 
        "4Low"  : [],
        "4High" : [],
        "8Low"  : [],
        "8High" : [],
        "2No"   : [],
        "4No"   : [],
        "8No"   : []
    };

    var conditions = ["2Low", "2High", "4Low", "4High", "8Low", "8High", "2No", "4No", "8No"];
    conditions.sort(function(){ // randomising conditions
        return Math.random() - 0.5;
    });

    var numGames = 1; // initialising; interation inside options()

    // styling ---------------------------------------------------------------------------------------------------------------
    var thisHeight = document.body.clientHeight * 0.9;
    var thisWidth = document.body.clientWidth * 0.9; // width = height * 4/3
    if(thisWidth < thisHeight * 4 / 3){
        thisHeight = thisWidth * 3 / 4;
    }else{
        thisWidth = thisHeight * 4 / 3;
    }
    var dispWidth = thisHeight * 5 / 6;
    var dispHeight = dispWidth / 2;
    $('#Main').css('min-height', thisHeight);
    $('#Main').css('width', thisWidth);

    var spacing = '<br><br>'; // in trials, the spacing between title and images

    // checking pc or phone/pad
    if(navigator.userAgent.match(/(Android|webOS|iPhone|Pad|BlackBerry)/i)){
        alert('Please open this page in PCs!'); // cannot continue the experiment
    }else{
        // alert('pc端');
        // para(1); // for testing; changing parameters

        // for testing; fixed parameters
        // numArms = 2; 
        // isTeacher = true;
        // teacherPerform = 'Low';
        // options(1);

        // formal
        information();
    }


    // full games -----------------------------------------------------------------------------------------------------------
    // var numGames = 1; // initialising; interation inside options()
    function ran() { // used inside instructions()
        sumReward = sumReward + tempReward;
        tempReward = 0;

        if(numGames > conditions.length) {
            end();
        } else {
            numArms = parseInt(conditions[numGames-1].substring(0, 1));
            order = Array.from({length:numArms},(item, index)=> index+1); // generating an array like [1, 2, 3, 4]
            order.sort(function(){ // randomising doors' order in a game
                return Math.random() - 0.5;
            });

            for (i = 0; i < numArms; i++) {
                p[i] = ps[conditions[numGames-1]][order[i]-1]; // reordering the reward rates
            };

            for (i = 0; i < numTrials; i++) {
                t[i] = order.indexOf(teacher[conditions[numGames-1]][i]) + 1; // reordering the choices of the teacher
            };

            isTeacher = conditions[numGames-1].substring(1) !== "No";
            teacherPerform = conditions[numGames-1].substring(1);

            $('#Top').css('height', thisHeight / 20);
            $('#Stage').css('width', dispWidth);
            $('#Stage').css('height', thisHeight * 17 / 20);
            $('#Bottom').css('min-height', thisHeight / 20);
            
            createDiv('Stage', 'TextBoxDiv0');
            $('#TextBoxDiv0').css('font-size', '16px');
            $('#TextBoxDiv0').css('padding-top', '20%');
            
            if(isTeacher) {
                isTeacherDisplay = "Yes";
            } else {
                isTeacherDisplay = "No";
            };
            var title = '<div id="Title"><h2 align="center">' + 'Game ' + numGames + '<br>' +
                        'Number of doors: ' + numArms + '<br>' +
                        'Is there a demonstrator: ' + isTeacherDisplay + '</h2><div>';
            $('#TextBoxDiv0').html(title);

            var buttons = '<div align="center"><input align="center" type="button" class="btn btn-default"' +
                    ' id="toTrial" value="Start!"></div>';
            $('#Bottom').html(buttons); // click button to proceed

            $('#toTrial').click(function() {
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

        switch(pageNum) {
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
        $('#Bottom').css({'height': thisHeight / 20,
                          'position': 'absolute',
                          'width': thisWidth,
                          'top': bottomPos});
        createDiv('Stage', 'Title');
        createDiv('Stage', 'TextBoxDiv');

        $('#TextBoxDiv').css('font-size', '16px');
        $('#TextBoxDiv').css('padding-top', '20%');

        var title = '<h2 align="center">Information page</h2>'; // header
        var info = '(information sheet here)<br>' + // HERE!
            'Thanks for participating in this experiment!<br>In this experiment, you will be asked to ' + 
            'choose from several options and your final reward will be dependent on your choice. The session ' + 
            'should last no more than 10 minutes and you will be paid ￡1 plus additional reward for your ' + 
            'participation.<br>If you have any question, please contact ' +
            ' Y.Zhang-327@sms.ed.ac.uk<br><br><br>'; // information content
        var ticks = '<input type="checkbox" name="consent" value="consent">I have read the information above.<br>'
        
        $('#Title').html(title);
        $('#TextBoxDiv').html(info + ticks);

        var buttons = '<div align="center"><input align="center" type="button" class="btn btn-default"' +
            ' id="toInstructions" value="Next"></div>';
        $('#Bottom').html(buttons); // click button to proceed

        $('#toInstructions').click(function() {
            if($('input:checkbox:not(:checked)').length > 0) {
                alert('You must tick all check boxes to continue.');
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

    // instructions ---------------------------------------------------------------------------------------------------------
    function instructions(pageNum) {
        $('#Top').css('height', thisHeight / 20);
        $('#Stage').css('width', dispWidth);
        $('#Stage').css('min-height', thisHeight * 7 / 20);
        $('#Bottom').css({'height': thisHeight / 20,
                          'position': 'absolute',
                          'width': thisWidth,
                          'top': bottomPos});
        var numPages = 2; // number of pages of instruction
        var picHeight = dispWidth / 2;
        createDiv('Stage', 'Title');
        createDiv('Stage', 'TextBoxDiv');

        $('#TextBoxDiv').css('font-size', '16px');
        $('#TextBoxDiv').css('padding-top', '20%');
        

        var title = '<h2 align="center">Instructions</h2>';
        switch(pageNum) {
            case 1:
                var info = 'In this experiment, you will choose among 2 or more doors, each has some probability of hiding a ' + 
                    'coin. You can choose the door by clicking on it with your mouse.' + 
                    'Your goal is to collect as many coins as possible.<br>' +
                    'There are ' + conditions.length + ' games in this experiment, and in some of the games, ' + 
                    'you can see the choice of a previous player (demonstrator) who has played the same game as you do. ' + 
                    'Each game has a different demonstrator (randomly assigned), who might perform better or ' + 
                    'worse than you.';
                break;
            case 2:
                var info = 'After each decision, you will see the outcome - coin or nothing. You will then continue ' + 
                    'directly to the next trial. At the end, you will see how many coins you have earned.<br>' + 
                    'There are ' + numTrials + ' trials in each game, ' + conditions.length + ' games in this experiment.<br>' +
                    'This experiment takes 5~10 minutes on average.<br>' +
                    'Good luck!';
                break;
            default:
                var info;
                break;
        }

        var thisImage = '<div align="center"><img src="images/instruction' + pageNum + '.png" alt="house" height="' +
            picHeight + '" align="center"></div>'
        $('#Title').html(title);
        $('#TextBoxDiv').html(info + thisImage);

        var buttons = '<div align="center"><input align="center" type="button" class="btn btn-default" id="Back"' + 
            ' value="Back"><input align="center" type="button" class="btn btn-default" id="Next" value="Next">' + 
            '<input align="center" type="button" class="btn btn-default" id="Start" value="Start!"></div>';
        $('#Bottom').html(buttons);
        
        if(pageNum === 1) {
            $('#Back').hide();
        };
        if(pageNum === numPages) {
            $('#Next').hide();
        };
        if(pageNum < numPages) {
            $('#Start').hide();
        };

        $('#Back').click(function() {
            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            instructions(pageNum - 1);
        });

        $('#Next').click(function() {
            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            instructions(pageNum + 1);
        });

        $('#Start').click(function() {
            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();

            $('#Stage').css('margin-top', '30%');
            $('#Stage').css('min-height', thisHeight * 7 / 20);
            
            setTimeout(function() {
                $('#Stage').html('<h1 align="center">Ready</h1>');
                setTimeout(function() {
                    $('#Stage').html('<h1 align="center">Steady</h1>');
                    setTimeout(function() {
                        $('#Stage').html('<h1 align="center">Go!</h1>');
                        setTimeout(function() {
                            $('#Stage').html('<h1 align="center"></h1>');
                            $('#Stage').css('margin-top', 'auto');
                            $('#Stage').empty();
                            // options(1); // start with the first trial
                            ran(); // multiple conditions
                        }, 1000);
                    }, 1000);
                }, 1000);
            }, 10);
        });            
    };

    // options ---------------------------------------------------------------------------------------------------------------    
    function options(trialNum) {
        if(trialNum > numTrials) {
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
            $('#MessageBox').css({'position': 'absolute',
                                  'left': '10%',
                                  'width': '80%'});
            

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
            for(let i = 1; i <= numArms; i++) {
                door[i - 1] = '<img id="Door' + i + '" src="images/door.png">';
            }

            switch(numArms) {
                case 2:
                    //  | screen | Stage(left) - a - | Door1 - b - | background - x - | ...
                    var leftMar = (document.body.clientWidth - $('#Main').width()) / 2;
                    var a = $('#Main').width() / 4;
                    var b = $('#Main').width() / 9;
                    var h = [$('#Main').height() * 0.45];
                    $('#MessageBox').html(title);
                    $('#TextBoxDiv').html(door[0] + door[1]);
                    $('#Door1').css({'position': 'absolute',
                                     'left': leftMar + a,
                                     'top': h[0],
                                     'width': b,
                                     'cursor': 'pointer'});
                    $('#Door2').css({'position': 'absolute',
                                     'right': document.getElementById('Door1').style.left,
                                     'top': h[0],
                                     'width': b,
                                     'cursor': 'pointer'});
                    break;

                case 4:
                    //  | screen | Stage(left) - a - | Door1 - b - | background - x - | ...
                    var leftMar = (document.body.clientWidth - $('#Main').width()) / 2;
                    var a = $('#Main').width() / 6;
                    var b = $('#Main').width() / 9;
                    var x = ($('#Main').width() - 2*a - 4*b) / 3;
                    var h = [$('#Main').height() * 0.45];
                    $('#MessageBox').html(title);
                    $('#TextBoxDiv').html(door[0] + door[1] + door[2] + door[3]);
                    $('#Door1').css({'position': 'absolute',
                                     'left': leftMar + a,
                                     'top': h[0],
                                     'width': b,
                                     'cursor': 'pointer'});
                    $('#Door2').css({'position': 'absolute',
                                     'left': leftMar + a + b + x,
                                     'top': h[0],
                                     'width': b,
                                     'cursor': 'pointer'});
                    $('#Door3').css({'position': 'absolute',
                                     'right': document.getElementById('Door2').style.left,
                                     'top': h[0],
                                     'width': b,
                                     'cursor': 'pointer'});
                    $('#Door4').css({'position': 'absolute',
                                     'right': document.getElementById('Door1').style.left,
                                     'top': h[0],
                                     'width': b,
                                     'cursor': 'pointer'});

                    break;

                case 8:
                    //  | screen | Stage(left) - a - | Door1 - b - | background - x - | ...
                    var leftMar = (document.body.clientWidth - $('#Main').width()) / 2;
                    var a = $('#Main').width() / 6;
                    var b = $('#Main').width() / 9;
                    var x = ($('#Main').width() - 2*a - 4*b) / 3;
                    var h = [$('#Main').height() * 0.35, $('#Main').height() * 0.65];
                    $('#MessageBox').html(title);
                    $('#TextBoxDiv').html(door[0] + door[1] + door[2] + door[3] + door[4] + door[5] + door[6] + door[7]);
                    $('#Door1').css({'position': 'absolute',
                                     'left': leftMar + a,
                                     'top': h[0],
                                     'width': b,
                                     'cursor': 'pointer'});
                    $('#Door2').css({'position': 'absolute',
                                    //  'left': $('#Stage').position().left + dispWidth / 2,
                                     'left': leftMar + a + b + x,
                                     'top': h[0],
                                     'width': b,
                                     'cursor': 'pointer'});
                    $('#Door3').css({'position': 'absolute',
                                     'right': document.getElementById('Door2').style.left,
                                     'top': h[0],
                                     'width': b,
                                     'cursor': 'pointer'});
                    $('#Door4').css({'position': 'absolute',
                                     'right': document.getElementById('Door1').style.left,
                                     'top': h[0],
                                     'width': b,
                                     'cursor': 'pointer'});
                    $('#Door5').css({'position': 'absolute',
                                     'left': document.getElementById('Door1').style.left,
                                     'top': h[1],
                                     'width': b,
                                     'cursor': 'pointer'});
                    $('#Door6').css({'position': 'absolute',
                                     'left': document.getElementById('Door2').style.left,
                                     'top': h[1],
                                     'width': b,
                                     'cursor': 'pointer'});
                    $('#Door7').css({'position': 'absolute',
                                     'right': document.getElementById('Door2').style.left,
                                     'top': h[1],
                                     'width': b,
                                     'cursor': 'pointer'});
                    $('#Door8').css({'position': 'absolute',
                                     'right': document.getElementById('Door1').style.left,
                                     'top': h[1],
                                     'width': b,
                                     'cursor': 'pointer'});

                    break;
            };

            if(isTeacher) {
                // var whichTeacher = t; // which teacher
                var whichDemo = t[trialNum-1]; // which door does the teacher choose in the current trial
                
                $('#TextBoxDiv').append('<img id="Point" src="images/point.png">');
                $('#Point').css({'position': 'absolute',
                                 'left': '48%',
                                 'top': h[0] - $('#Main').height() / 12,
                                 'width': $('#Door1').width() / 2});

                $("#Point").animate({
                    left : $('#Door' + whichDemo).position().left + $('#Door' + whichDemo).width() / 3,
                    top : h[Number(whichDemo > 4.5)] + $('#Main').height() / 12
                }, movePoint);
                $('#Point').delay(stayPoint);
                $('#Point').fadeOut(fadePoint, function(){ // prevent from clicking before the end of demonstration
                    $('#Point').empty(); // clear "point" otherwise user cannot click on the position                
                    var isClick = true; // prevent from clicking too fast / too many times
                    for(let i = 1; i <= numArms; i++) { 
                        $('#Door' + i).click(function() {
                            if(isClick) {
                                isClick = false;
                                subChoice[numArms + teacherPerform][trialNum - 1] = i;
                                $(this).css({"border-color": "#CCFF33",
                                            "border-width": "3px",
                                            "border-style": "solid"});
                                reward(trialNum, i);
                            };                
                        });             
                    };
                });

            } else {
                var isClick = true; // prevent from clicking too fast / too many times
                for(let i = 1; i <= numArms; i++) { 
                    $('#Door' + i).click(function() {
                        if(isClick) {
                            isClick = false;
                            subChoice[numArms + "No"][trialNum - 1] = i;
                            $(this).css({"border-color": "#CCFF33",
                                        "border-width": "3px",
                                        "border-style": "solid"});
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
            if(choice === i) {
                if(randomNum < p[i - 1]) {
                    thisReward = 1;
                };
            };
        };

        createDiv('Stage', 'TextBoxDiv2');
        

        if(thisReward === 1) { // coin
            $('#MessageBox').html('<h2 align="center" id="Message">You got a coin!!' + spacing + '</h2>');
            $('#TextBoxDiv2').html('<img id="Reward" src="images/coin.png">');
            tempReward = tempReward + 1;
        } else { // no coin
            $('#MessageBox').html('<h2 align="center" id="Message">You got nothing...' + spacing + '</h2>');
            $('#TextBoxDiv2').html('<img id="Reward" src="images/frowny.png">');
        };

        $('#Reward').css({'position': 'absolute',
                          'left': '47.5%',
                          'top': '18%',
                          'width': '5%'});

        setTimeout(function() {
            $('#TextBoxDiv2').fadeOut(fadeTime);
            $('#TextBoxDiv').fadeOut(fadeTime);
            $('#MessageBox').fadeOut(fadeTime);
            setTimeout(function() {
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
        // $('#Stage').css('min-height', thisHeight * 17 / 20);
        $('#Bottom').css('min-height', thisHeight / 20);
        createDiv('Stage', 'TextBoxDiv');
        $('#TextBoxDiv').css('padding-top', '20%');

        var title = '<h2 align="center">You have finished the experiment!<br><br>You earned ' + sumReward +
            ' coins!<br><br>Thanks for participating!</h2>';
            
        $('#TextBoxDiv').html(title);

        console.log(subChoice);        
    };




    // utility functions -----------------------------------------------------------------------------------------------------

    // create a 10-digit random number as the participant's unique user ID
    function createCode() {
        return Math.floor(Math.random() * 10000000000);
    };

    // create a new div under a parent div
    function createDiv(parentID, childID) {
        var d = $(document.createElement('div')).attr('id', childID);
        var container = document.getElementById(parentID);
        d.appendTo(container);
    };




})