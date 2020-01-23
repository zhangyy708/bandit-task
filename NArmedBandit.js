$(document).ready(function () {
    // initialising variables ----------------------------------------------------------------------------------------------
    var numTrials = 10; // number of trials
    var p1 = 0.7; // probability of getting a reward from option 1
    var p2 = 0.3;
    var sumReward = 0; // number of rewards a participant already gets
    var init = (new Date()).getTime(); // the time the experiment starts
    var subID = createCode();
    var fadeTime = 500; // fade out time (after reward being displayed in each trial)
    var stayTime = 500; // result stay time (after reward being displayed in each trial)

    var numArms = 2; // number of arms

    // styling --------------------------------------------------------------------------------------------------------------
    var thisHeight = $(document).height() * 0.9;
    var thisWidth = thisHeight * 4 / 3;
    var dispWidth = thisHeight * 5 / 6;
    var dispHeight = dispWidth / 2;
    $('#Main').css('min-height', thisHeight);
    $('#Main').css('width', thisWidth);

    // information();
    // instructions(1);
    options(1);

    // information page ------------------------------------------------------------------------------------------------------
    function information() {
        $('#Top').css('height', thisHeight / 20);
        $('#Stage').css('width', dispWidth);
        $('#Stage').css('min-height', thisHeight * 17 / 20);
        $('#Bottom').css('min-height', thisHeight / 20);
        createDiv('Stage', 'TextBoxDiv');
        var title = '<h3 align="center">Information page for participants in research studies</h3>'; // header
        var info = 'Here is a lot of information about the experiment.'; // information content
        $('#TextBoxDiv').html(title + info);

        var buttons = '<div align="center"><input align="center" type="button" class="btn btn-default" id="toConsent"' + 
            ' value="Next"></div>';
        $('#Bottom').html(buttons); // click button to proceed

        $('#toConsent').click(function () {
            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            consent();
        });
    };

    // consent form ---------------------------------------------------------------------------------------------------------
    function consent() {
        $('#Top').css('height', thisHeight / 20);
        $('#Stage').css('width', dispWidth);
        $('#Stage').css('min-height', thisHeight * 17 / 20);
        $('#Bottom').css('min-height', thisHeight / 20);
        createDiv('Stage', 'TextBoxDiv');
        var title = '<h3 align="center">Consent form for participants in research studies</h3>'; // header
        var info = 'Please read the following criteria and tick all boxes. <br><br>'; // consent content
        var ticks = '<input type="checkbox" name="consent" value="consent1">I have read the information page.<br>' +
            '<input type="checkbox" name="consent" value="consent2">I have had the opportunity to contact the' + 
                ' researcher to ask questions and discuss the study.<br>' +
            '<input type="checkbox" name="consent" value="consent3">I have received satisfactory answers to my' + 
                ' questions or have been advised of an individual to contact for answers to pertinent questions' + 
                ' about the research and my rights as a participant.<br>' +
            '<input type="checkbox" name="consent" value="consent4">I understand that I am free to withdraw at' +　
                ' any time, without giving a reason, and without incurring any penalty.<br>' +
            '<input type="checkbox" name="consent" value="consent5">I am over 18 years of age.<br>'
        $('#TextBoxDiv').html(title + info + ticks);

        var buttons = '<div align="center"><input align="center" type="button" class="btn btn-default"' +
            ' id="toInstructions" value="Next"></div>';
        $('#Bottom').html(buttons); // click button to proceed

        $('#toInstructions').click(function() {
            if($('input:checkbox:not(:checked)').length > 0) {
                alert('You must tick all check boxes to continue.');
            } else {
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
        $('#Stage').css('min-height', thisHeight * 17 / 20);
        $('#Bottom').css('min-height', thisHeight / 20);
        var numPages = 2; // number of pages of instruction
        var picHeight = dispWidth / 2;
        createDiv('Stage', 'TextBoxDiv');

        var title = '<h2 align="center">Instructions</h2>';
        switch(pageNum) {
            case 1:
                var info = '<h3>In this experiment, you have to collect as many coins as possible, hidden behind two doors. ' + 
                    'On each trial, you have to choose between the doors. <br>Each door has some probability of getting a ' + 
                    'coin. You choose the door by clicking on it with your mouse. <br>There are ' + numTrials + ' trials ' +
                    'in this experiment.</h3><br><br>';
                break;
            case 2:
                var info = '<h3>After each decision, you will see the outcome - coin or nothing. You will then continue ' + 
                    'directly to the next trial. At the end, you will see how many coins you have earned.<br>Good luck!' +
                    '</h3><br><br>';
                break;
            default:
                var info;
                break;
        }

        var thisImage = '<div align="center"><img src="images/instruction' + pageNum + '.png" alt="house" height=""' +
            picHeight + ' align="center"><br><br></div>'
            $('#TextBoxDiv').html(title + info + thisImage);

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
            
            setTimeout(function() {
                $('#Stage').html('<h1 align="center">Ready</h1>');
                setTimeout(function() {
                    $('#Stage').html('<h1 align="center">Steady</h1>');
                    setTimeout(function() {
                        $('#Stage').html('<h1 align="center">Go!</h1>');
                        setTimeout(function() {
                            $('#Stage').html('<h1 align="center"></h1>');
                            options(1); // start with the first trial
                        }, 1000);
                    }, 1000);
                }, 1000);
            }, 10);
        });            
    };

    // options ---------------------------------------------------------------------------------------------------------------
    function options(trialNum) {
        $('#Top').css('height', thisHeight / 20);
        $('#Stage').css('width', dispWidth);
        $('#Stage').css('min-height', thisHeight * 17 / 20);
        $('#Bottom').css('min-height', thisHeight / 20);

        createDiv('Stage', 'Title');
        $('#Title').css('margin-top', thisHeight / 10);
        createDiv('Stage', 'TextBoxDiv');
        $('#TextBoxDiv').css('margin-top', thisHeight / 5);

        var title = '<div id="Title"><h2 align="center">Choose a door:</h2></div>';

        var door = new Array();
        for(let i = 1; i <= numArms; i++) {
            door[i - 1] = '<img id="Door' + i + '" src="images/door.png" class="img-responsive center-block">';
        }
        
        switch(numArms) {
            case 2:
                var images = '<div class="row">' + 
                    '<div class="col-sm-' + 0 + '"></div>' + 
                    '<div class="col-sm-' + 3 + '">' + door[0] + '</div>' + 
                    '<div class="col-sm-' + 6 + '"></div>' + 
                    '<div class="col-sm-' + 3 + '">' + door[1] + '</div>' + 
                    '<div class="col-sm-' + 0 + '"></div></div>' +
                    '<div class="row">' + 
                    '<div class="col-sm-' + 5 + '"></div>' + 
                    '<div id="Middle" class="col-sm-' + 2 + '"></div>' + 
                    '<div class="col-sm-' + 5 + '"></div></div>';
                // var images = '<div class="row">' + 
                //     '<div class="col-md-' + 1 + '"></div>' + 
                //     '<div class="col-md-' + 3 + '">' + door[0] + '</div>' + 
                //     '<div class="col-md-' + 1 + '"></div>' + 
                //     '<div id="Middle" class="col-md-' + 2 + '"></div>' + 
                //     '<div class="col-md-' + 1 + '"></div>' + 
                //     '<div class="col-md-' + 3 + '">' + door[1] + '</div>' + 
                //     '<div class="col-md-' + 1 + '"></div></div>';
                break;
            case 4:
                var images = '<div class="row">' + 
                    '<div class="col-sm-' + 0 + '"></div>' + 
                    '<div class="col-sm-' + 3 + '">' + door[0] + '</div>' + 
                    '<div class="col-sm-' + 0 + '"></div>' + 
                    '<div class="col-sm-' + 3 + '">' + door[1] + '</div>' + 
                    '<div class="col-sm-' + 0 + '"></div>' + 
                    '<div class="col-sm-' + 3 + '">' + door[2] + '</div>' + 
                    '<div class="col-sm-' + 0 + '"></div>' + 
                    '<div class="col-sm-' + 3 + '">' + door[3] + '</div>' + 
                    '<div class="col-sm-' + 0 + '"></div></div>' +
                    '<div class="row">' + 
                    '<div class="col-sm-' + 5 + '"></div>' + 
                    '<div id="Middle" class="col-sm-' + 2 + '"></div>' + 
                    '<div class="col-sm-' + 5 + '"></div></div>';
                break;
        };
        
        
        $('#Title').html(title);
        $('#TextBoxDiv').html(images);

        for(let i = 1; i <= numArms; i++) {
            $('#Door' + i).click(function() {
                $(this).css({"border-color": "#CCFF33",
                             "border-width": "3px",
                             "border-style": "solid"});
                reward(trialNum, i);
            });
        };
    };

    // rewards ---------------------------------------------------------------------------------------------------------------
    function reward(trialNum, choice) {
        $('#Title').empty();
        var thisReward = 0;
        var randomNum = Math.random();
        if(choice === 1) { // door 1
            if(randomNum < p1) {
                thisReward = 1;
            };
        } else { // door 2
            if(randomNum < p2) {
                thisReward = 1;
            };
        };

        if(thisReward === 1) { // coin
            $('#Title').html('<h2 align="center">You got a coin!!</h2>');
            $('#Middle').html('<img id="Door1" src="images/coin.png" class="img-responsive center-block">');
            sumReward = sumReward + 1;

            if(trialNum + 1 < numTrials) {
                setTimeout(function() {
                    $('#TextBoxDiv').fadeOut(500);
                    setTimeout(function() {
                        $('#Stage').empty();
                        $('#Bottom').empty();
                        options(trialNum + 1);
                    }, fadeTime); 
                }, stayTime); 
            } else {
                $('#TextBoxDiv').remove();
                $('#Stage').empty();
                $('#Bottom').empty();
                end();
            };
        } else { // no coin
            $('#Title').html('<h2 align="center">You got nothing...</h2>');
            $('#Middle').html('<img id="Door1" src="images/frowny.png" class="img-responsive center-block">');

            if(trialNum + 1 < numTrials) {
                setTimeout(function() {
                    $('#TextBoxDiv').fadeOut(500);
                    setTimeout(function() {
                        $('#Stage').empty();
                        $('#Bottom').empty();
                        options(trialNum + 1);
                    }, fadeTime); 
                }, stayTime);
            } else {
                $('#TextBoxDiv').remove();
                $('#Stage').empty();
                $('#Bottom').empty();
                end();
            };
        };   
    };

    function end() {
        $('#Top').css('height', thisHeight / 20);
        $('#Stage').css('width', dispWidth);
        $('#Stage').css('min-height', thisHeight * 17 / 20);
        $('#Bottom').css('min-height', thisHeight / 20);
        createDiv('Stage', 'TextBoxDiv');

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