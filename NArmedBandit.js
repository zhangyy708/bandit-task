$(document).ready(function () {
    // initialising variables ------------------------------------------------------------------------------------------------
    // adjustable
    var numTrials = 20; // number of trials
    var p1 = 0.8; // probability of getting a reward from option 1
    var p2 = 0.2;
    var p3 = 0.7;
    var p4 = 0.3;    
    var fadeTime = 500; // fade out time (after reward being displayed in each trial)
    var stayTime = 500; // result stay time (after reward being displayed in each trial)

    var teacher = [1, 2, 2, 1, 2, 1, 1, 1, 1, 1]; // teachers' choices, need to be changed

    // system
    var isTeacher; // whether their is a demonstrator
    var teacherId; // which teacher
    
    var numArms; // number of arms
    var p = new Array(); // probability array
    var sumReward = 0; // number of rewards a participant already gets

    var init = (new Date()).getTime(); // the time the experiment starts
    var subID = createCode();

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
        alert('The experiment is only supported in PCs!'); // cannot continue the experiment
    }else{
        // alert('pc端');
        para(1); // for testing; changing parameters
        // for testing; fixed parameters
        // numArms = 4; 
        // isTeacher = true;
        // teacherId = 1;
        // options(1);
    }
    

    // information();
    // instructions(1);
    // options(1);

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
                    '</div>';

                // var info2 = '<p align="center"><br>Other parameters (under development...)</p>'; 
                $('#Title').html(title)
                $('#TextBoxDiv').html(info1 + buttons); 
                // $('#TextBoxDiv').html(info1 + buttons + info2); 

                $('#num2').click(function () {
                    numArms = 2;
                    $('#TextBoxDiv').remove();
                    $('#Stage').empty();
                    $('#Bottom').empty();
                    // information();
                    para(2);
                });

                $('#num4').click(function () {
                    numArms = 4;
                    $('#TextBoxDiv').remove();
                    $('#Stage').empty();
                    $('#Bottom').empty();
                    // information();
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
                    teacherId = 0;
                    $('#TextBoxDiv').remove();
                    $('#Stage').empty();
                    $('#Bottom').empty();
                    information();
                });
    
                $('#tea1').click(function () {
                    isTeacher = true;
                    teacherId = 1;
                    $('#TextBoxDiv').remove();
                    $('#Stage').empty();
                    $('#Bottom').empty();
                    information();
                });

                $('#tea2').click(function () {
                    isTeacher = true;
                    teacherId = 2;
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
        $('#Bottom').css('min-height', thisHeight / 20);
        createDiv('Stage', 'Title');
        createDiv('Stage', 'TextBoxDiv');

        $('#TextBoxDiv').css('font-size', '16px');
        $('#TextBoxDiv').css('padding-top', '20%');

        var title = '<h2 align="center">Information page</h2>'; // header
        var info = 'Thanks for participating in this experiment!<br>In this experiment, you will be asked to ' + 
            'choose from several options and your final reward will be dependent on your choice. The session ' + 
            'should last no more than 30 minutes and you will be paid ￡5 plus additional reward for your ' + 
            'participation.<br>If you have any questions, please ask the experimenter or contact me at' +
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

    // instructions ---------------------------------------------------------------------------------------------------------
    function instructions(pageNum) {
        $('#Top').css('height', thisHeight / 20);
        $('#Stage').css('width', dispWidth);
        // $('#Stage').css('position', 'relative');
        $('#Stage').css('min-height', thisHeight * 17 / 20);
        $('#Bottom').css('min-height', thisHeight / 20);
        var numPages = 2; // number of pages of instruction
        var picHeight = dispWidth / 2;
        createDiv('Stage', 'Title');
        createDiv('Stage', 'TextBoxDiv');

        $('#TextBoxDiv').css('font-size', '16px');
        $('#TextBoxDiv').css('padding-top', '20%');
        

        var title = '<h2 align="center">Instructions</h2>';
        switch(pageNum) {
            case 1:
                var info = 'In this experiment, you have to collect as many coins as possible, hidden behind two' + 
                    ' or more doors. ' + 
                    'On each trial, you have to choose among the doors. Each door has some probability of getting a ' + 
                    'coin. You choose the door by clicking on it with your mouse. <br>There are ' + numTrials + ' trials ' +
                    'in this experiment.<br><br>';
                break;
            case 2:
                var info = 'After each decision, you will see the outcome - coin or nothing. You will then continue ' + 
                    'directly to the next trial. At the end, you will see how many coins you have earned.<br>Good luck!' +
                    '<br><br>';
                break;
            default:
                var info;
                break;
        }

        var thisImage = '<div align="center"><img src="images/instruction' + pageNum + '.png" alt="house" height="' +
            picHeight + '" align="center"><br><br></div>'
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
                            options(1); // start with the first trial
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
            end();

        } else {
            $('#Top').css('height', thisHeight / 20);
            $('#Stage').css('width', dispWidth);
            // $('#Stage').css('min-height', thisHeight * 17 / 20);
            $('#Bottom').css('min-height', thisHeight / 20);
            
            createDiv('Stage', 'TextBoxDiv');
            $('#TextBoxDiv').css('margin-top', '5%');

            createDiv('Stage', 'MessageBox');
            $('#MessageBox').css({'position': 'absolute',
                                  'left': '10%',
                                  'width': '80%'});
            

            var infoTrial = 'Coins already got in this game: ' + sumReward + '<br>' + 
                'Trial ' + trialNum + ' of ' + numTrials;
            $('#Top').html(infoTrial);
            $('#Top').css('font-size', '20px');

            var title = '<div id="Title"><h2 align="center">Choose a door:' + spacing + '</h2></div>';

            var door = new Array();
            for(let i = 1; i <= numArms; i++) {
                door[i - 1] = '<img id="Door' + i + '" src="images/door.png">';
            }  
            
            // var point = '<div id="PointBox"></div>';


            switch(numArms) {
                case 2:
                    $('#MessageBox').html(title);
                    $('#TextBoxDiv').html(door[0] + door[1]);
                    $('#Door1').css({'position': 'absolute',
                                     'left': '30%',
                                     'top': '35%',
                                     'width': '8%'});
                    $('#Door2').css({'position': 'absolute',
                                     'right': '30%',
                                     'top': '35%',
                                     'width': '8%'});
                    break;
                case 4:
                    $('#MessageBox').html(title);
                    $('#TextBoxDiv').html(door[0] + door[1] + door[2] + door[3]);
                    $('#Door1').css({'position': 'absolute',
                                     'left': '25%',
                                     'top': '35%',
                                     'width': '8%'});
                    $('#Door2').css({'position': 'absolute',
                                     'left': '39%',
                                     'top': '35%',
                                     'width': '8%'});
                    $('#Door3').css({'position': 'absolute',
                                     'right': '39%',
                                     'top': '35%',
                                     'width': '8%'});
                    $('#Door4').css({'position': 'absolute',
                                     'right': '25%',
                                     'top': '35%',
                                     'width': '8%'});

                    break;
            };   


            if(isTeacher) {
                // $('#PointBox').html('<img id="Point" src="images/point.png">');
                // $('#PointBox').css({'position': 'absolute',
                //                     'left': '50%',
                //                     'top': '50%'});
                // $('#Point').css('width', $('#Door1').width() / 2);
                $('#TextBoxDiv').append('<img id="Point" src="images/point.png">');
                $('#Point').css({'position': 'absolute',
                                 'left': '48%',
                                 'top': '30%',
                                 'width': $('#Door1').width() / 2});

                $("#Point").animate({
                    left : $('#Door2').position().left + $('#Door2').width() / 3,
                    top : '40%'
                }, 750);
                $('#Point').delay(150);
                $('#Point').fadeOut(150, function(){ // prevent from clicking before the end of demonstration

                    $('#Point').empty(); // clear "point" otherwise user cannot click on the position
                    
                    var isClick = true; // prevent from clicking too fast / too many times
                    for(let i = 1; i <= numArms; i++) { 
                        $('#Door' + i).click(function() {
                            if(isClick) {
                                isClick = false;
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
                            $(this).css({"border-color": "#CCFF33",
                                        "border-width": "3px",
                                        "border-style": "solid"});
                            reward(trialNum, i);
                        };                
                    });             
                };
            }

            
            

           
            
        };
    };

    // rewards ---------------------------------------------------------------------------------------------------------------
    function reward(trialNum, choice) {
        $('#Title').empty();
        var thisReward = 0;
        var randomNum = Math.random();

        switch(numArms) { // probabilities of getting a reward from options
            case 2:
                p = [p1, p2];
            case 4:
                p = [p1, p2, p3, p4];
        };

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
            sumReward = sumReward + 1;
        } else { // no coin
            $('#MessageBox').html('<h2 align="center" id="Message">You got nothing...' + spacing + '</h2>');
            $('#TextBoxDiv2').html('<img id="Reward" src="images/frowny.png">');
        };

        $('#Reward').css({'position': 'absolute',
                          'left': '47.5%',
                          'top': '18%',
                          'width': '5%'});

        setTimeout(function() {
            $('#TextBoxDiv2').fadeOut(500);
            $('#TextBoxDiv').fadeOut(500);
            $('#MessageBox').fadeOut(500);
            setTimeout(function() {
                $('#Stage').empty();
                $('#Bottom').empty();
                options(trialNum + 1);
            }, fadeTime); 
        }, stayTime); 
    };

    function end() {
        $('#Top').css('height', thisHeight / 20);
        $('#Stage').css('width', dispWidth);
        // $('#Stage').css('min-height', thisHeight * 17 / 20);
        $('#Bottom').css('min-height', thisHeight / 20);
        createDiv('Stage', 'TextBoxDiv');
        $('#TextBoxDiv').css('margin-top', '20%');

        var title = '<h2 align="center">You have finished the experiment!<br><br>You earned ' + sumReward +
            ' coins!<br><br>Thanks for participating!</h2>';
        $('#TextBoxDiv').html(title);
    }




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