% function simulate() is used to simulate choices based on the method
% specified by variables "method" and "parameters"

% input:
% method: a string, chosen from "Bayesian", "RL", etc.
% parameters: a vector of numbers
%   for demo:
%     epsilon - probability of exploration, 0~1, larger-more exploration;
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
% environment: a vector of numbers denoting task parameters;
%   num_trials - number of trials in this game;
%   num_opts - number of options in this game;
%   p_opts - actual reward rates (from the 3rd number to the last);
% teacher: a vector of numbers, choices made by the demonstrator
%
%
% output:
% C: a vector of numbers, denoting the choices in all trials (values
%    representing the number of the chosen option)
% R: a vector of numbers, denoting the rewards in all trials (values equal
%    to 0 or 1, denoting getting / not getting a reward)


function [C, R] = simulate(method, parameters, environment, teacher)
    
    if (method == "demo")
        
        % parameters setting
        epsilon = parameters; % probability of exploration
        num_trials = environment(1);
        num_opts = environment(2);
        p_opts = environment(3:length(environment));
        
        [p_temp, c_temp] = max(p_opts); % finding the option with the greatest p
        all_opts = 1:num_opts;
        all_opts(c_temp) = [];
        
        % initialising
        C = zeros(num_trials, 1); % choice in each trial
        R = zeros(num_trials, 1); % reward in each trial
        
        % iteration
        for i = 1:num_trials
            
            % making a choice
            temp1 = rand();
            if (temp1 <= 1 - epsilon)
                C(i) = c_temp;
            else
                temp3 = randi(num_opts - 1);
                C(i) = all_opts(temp3);
            end                
            
            % getting a reward
            temp2 = rand();
            if temp2 <= p_opts(C(i))
                R(i) = 1;
            end
            
        end
        
    elseif (ismember(method, ["Reinforcement", "RL", "reinforcement", "asoial", "Asocial"]))
        
        % parameters setting
        alpha = parameters(1); 
        beta = parameters(2);
        num_trials = environment(1);
        num_opts = environment(2);
        p_opts = environment(3:length(environment));
        
        % initialising
        Q = zeros(num_trials, num_opts); % Q-value for each option, initial values are set to 0s
        P = Q; % probabilities of choosing each option
        C = zeros(num_trials, 1); % choice in each trial
        R = zeros(num_trials, 1); % reward in each trial
        
        % iteration
        for i = 1:num_trials
            
            % probabilities of choosing each option
            P(i, :) = exp(Q(i, :) ./ beta) / sum(exp(Q(i, :) ./ beta));
            
            % making a choice
            temp1 = rand();
            p = P(i, 1);
            for j = 1:num_opts
                if temp1 <= p
                    C(i) = j;
                    break;
                else
                    p = p + P(i, j+1);
                end
            end
            
            % getting a reward
            temp2 = rand();
            if temp2 <= p_opts(C(i))
                R(i) = 1;
            end
            
            % updating Q-values
            if i == num_trials % do not update in the last trial
                break;
            end
            Q(i+1, :) = Q(i, :); % other values keep the same
            Q(i+1, C(i)) = (1 - alpha) * Q(i, C(i)) + alpha * R(i); % only updating chosen option's value
            
        end
        
    elseif (method == "random")
        
        % parameters setting
        num_trials = environment(1);
        num_opts = environment(2);
        p_opts = environment(3:length(environment));
        
        % initialising
        P = ones(num_opts, 1) .* (1 / num_opts); % probabilities of choosing each option
        C = zeros(num_trials, 1); % choice in each trial
        R = zeros(num_trials, 1); % reward in each trial
        
        % iteration
        for i = 1:num_trials
            
            % making a choice
            temp1 = rand();
            p = P(1);
            for j = 1:num_opts
                if temp1 <= p
                    C(i) = j;
                    break;
                else
                    p = p + P(j+1);
                end
            end
            
            % getting a reward
            temp2 = rand();
            if temp2 <= p_opts(C(i))
                R(i) = 1;
            end
            
        end
        
    elseif (ismember(method, ["unconditional", "unc", "unconditional copy"]))
        
        % parameters setting
        alpha = parameters(1);
        beta = parameters(2);
        eta = parameters(3);
        num_trials = environment(1);
        num_opts = environment(2);
        p_opts = environment(3:length(environment));
        
        % initialising
        Q = zeros(num_trials, num_opts); % Q-value for each option, initial values are set to 0s
        P = Q; % probabilities of choosing each option
        C = zeros(num_trials, 1); % choice in each trial
        R = zeros(num_trials, 1); % reward in each trial
        
        % iteration
        for i = 1:num_trials
            
            % probabilities of choosing each option
            P(i, :) = (1 - eta) * exp(Q(i, :) ./ beta) / sum(exp(Q(i, :) ./ beta))...
                + eta * (1:num_opts == teacher(i));
            
            % making a choice
            temp1 = rand();
            p = P(i, 1);
            for j = 1:num_opts
                if temp1 <= p
                    C(i) = j;
                    break;
                else
                    p = p + P(i, j+1);
                end
            end
            
            % getting a reward
            temp2 = rand();
            if temp2 <= p_opts(C(i))
                R(i) = 1;
            end
            
            % updating Q-values
            if i == num_trials % do not update in the last trial
                break;
            end
            Q(i+1, :) = Q(i, :); % other values keep the same
            Q(i+1, C(i)) = (1 - alpha) * Q(i, C(i)) + alpha * R(i); % only updating chosen option's value
            
        end
        
        
    elseif (ismember(method, ["copy-the-successful", "suc"]))
        
        % parameters setting
        alpha = parameters(1);
        beta = parameters(2);
        theta = parameters(3);
        num_trials = environment(1);
        num_opts = environment(2);
        p_opts = environment(3:length(environment));
        
        % initialising
        Q = zeros(num_trials, num_opts); % Q-value for each option, initial values are set to 0s
        P = Q; % probabilities of choosing each option
        C = zeros(num_trials, 1); % choice in each trial
        R = zeros(num_trials, 1); % reward in each trial
        demo_s = 0; % counts of successes of the demonstrator (when copied)
        demo_f = 0; % counts of failures of the demonstrator (when copied)
        
        % iteration
        for i = 1:num_trials
            
            % probabilities of choosing each option
            copy_rate = theta * exp(demo_s) / (exp(demo_s) + exp(demo_f));
            P(i, :) = (1 - copy_rate) * exp(Q(i, :) ./ beta) / sum(exp(Q(i, :) ./ beta))...
                + copy_rate * (1:num_opts == teacher(i));
            
            % making a choice
            temp1 = rand();
            p = P(i, 1);
            for j = 1:num_opts
                if temp1 <= p
                    C(i) = j;
                    break;
                else
                    p = p + P(i, j+1);
                end
            end
            
            % getting a reward
            temp2 = rand();
            if temp2 <= p_opts(C(i))
                R(i) = 1;
            end
            
            % updating Q-values
            if i == num_trials % do not update in the last trial
                break;
            end
            Q(i+1, :) = Q(i, :); % other values keep the same
            Q(i+1, C(i)) = (1 - alpha) * Q(i, C(i)) + alpha * R(i); % only updating chosen option's value
            
            % updating success and failure counts of the demontrator
            if (C(i) == teacher(i)) % choosing as the demonstrator
                if (R(i) == 1) % success
                    demo_s = demo_s + 1;
                else % failure
                    demo_f = demo_f + 1;
                end
            end
        end
        
        
    end
end










