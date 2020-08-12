% function calculate_NLL() is used to calculate the negative log likelihood
% based on given data and reinforcement model
%
% input:
% choices - vector, choices made by a subject in each trial
% rewards - vector of 0s and 1s, rewards a subject received
% model - a string, chosen from "Bayesian", "RL", etc.
% num_opts - a number of 2, 4, or 8
% parameters - a vector of numbers
%   for asocial RL:
%     alpha - learning rate, 0~1, larger=learning faster;
%     beta - temperature, 0~+infinity, larger-random, smaller-deterministic;
%   for unconditional-copying strategy:
%     alpha - learning rate, 0~1, larger=learning faster;
%     beta - temperature, 0~+infinity, larger-random, smaller-deterministic;
%     eta - copy rate, 0~1, larger=copying more frequently
%   for random policy:
%     no additional parameter
%   for copy-the-successful strategy:
%     alpha - learning rate, 0~1, larger=learning faster;
%     beta - temperature, 0~+infinity, larger-random, smaller-deterministic;
%     theta - upper limit of copying probability, 0~1
% teacher - vector, choices made by the demonstrator in each trial
%
% output:
% nll - the value of negative log likelihood

function nll = calculate_NLL(choices, rewards, model, num_opts, parameters, teacher)
    
    if (model == "asocial" || model == "RL")
    %% asocial
        
        % parameters
        alpha = parameters(1);
        beta = parameters(2);
        num_trials = length(choices);
        
        % initialising
        Q = zeros(1, num_opts); % Q-value for each option, initial values are set to 0s
        p_choices = zeros(1, num_trials); % probabilities of choosing each option
        
        % iteration
        for i = 1:num_trials
            % choice in trial i
            c = choices(i);
            
            % reward in trial i
            r = rewards(i);
            
            % calculating p(choice == c | Q, parameters)
            p_choices(i) = exp(Q(c) ./ beta) / sum(exp(Q ./ beta));
            
            % updating Q
            Q(c) = (1 - alpha) * Q(c) + alpha * r;
            
        end
    
        % calculating NLL
        nll = -sum(log(p_choices)); 
        
    elseif (model == "unconditional")
    %% unconditional
        
        % parameters
        alpha = parameters(1); 
        beta = parameters(2);
        eta = parameters(3);
        num_trials = length(choices);
        
        % initialising
        Q = zeros(1, num_opts); % Q-value for each option, initial values are set to 0s
        p_choices = zeros(1, num_trials); % probabilities of choosing each option
        
        % iteration
        for i = 1:num_trials
            % choice in trial i
            c = choices(i);
            
            % reward in trial i
            r = rewards(i);
            
            % calculating p(choice == c | Q, parameters)
            p_choices(i) = (1 - eta) * exp(Q(c) ./ beta) / sum(exp(Q(:) ./ beta))...
                + eta * (c == teacher(i));
            
            % updating Q
            Q(c) = (1 - alpha) * Q(c) + alpha * r;
            
        end
    
        % calculating NLL
        nll = -sum(log(p_choices)); 
        
    elseif (model == "random")
    %% random
    
        num_trials = length(choices);
        nll = -log(1 / num_opts) * num_trials;
        
    elseif (model == "copy-the-successful" || model == "suc")
    %% copy-based-on-success-ratio
        
        % parameters
        alpha = parameters(1); 
        beta = parameters(2);
        theta = parameters(3);
        num_trials = length(choices);
        
        % initialising
        Q = zeros(1, num_opts); % Q-value for each option, initial values are set to 0s
        p_choices = zeros(1, num_trials); % probabilities of choosing each option
        demo_s = 0; % counts of successes of the demonstrator (when copied)
        demo_f = 0; % counts of failures of the demonstrator (when copied)
        
        % iteration
        for i = 1:num_trials
            % choice in trial i
            c = choices(i);
            
            % reward in trial i
            r = rewards(i);
            
            % calculating p(choice == c | Q, parameters)
            copy_rate = theta * (exp(demo_s)) / (exp(demo_s) + exp(demo_f));
            p_choices(i) = (1 - copy_rate) * exp(Q(c) ./ beta) / sum(exp(Q ./ beta))...
                + copy_rate * (c == teacher(i));
            
            % updating Q
            Q(c) = (1 - alpha) * Q(c) + alpha * r;
            
            % updating success and failure counts of the demontrator
            if (c == teacher(i)) % choosing as the demonstrator
                if (r == 1) % success
                    demo_s = demo_s + 1;
                else % failure
                    demo_f = demo_f + 1;
                end
            end
        end
    
        % calculating NLL
        nll = -sum(log(p_choices));         
        
    end

end