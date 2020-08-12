%% load
clear
load('experiment_short_probability.mat');

%% read data
[num1, txt1, raw1] = xlsread('data1.xlsm', 1); % original data (raw)
[num2, txt2, raw2] = xlsread('data2.xlsm', 1);

num_conditions = 12; % 2No 4No 8No 2Low 4Low 8Low 2Mid 4Mid 8Mid 2High 4High 8High
num_subject = 50; % 50 participants in each data
num_opts = [2, 4, 8]; % number of arms (3 levels)

choices1 = cell(1, num_conditions); % choices of participants in study 1
rewards1 = cell(1, num_conditions); % rewards of participants in study 1
choices2 = cell(1, num_conditions); % choices of participants in study 2
rewards2 = cell(1, num_conditions); % rewards of participants in study 2

tic; % 20.98s
for i = 1:num_conditions
    choices1{i} = xlsread('data1.xlsm', i + 1);
    rewards1{i} = xlsread('data1.xlsm', i + 13);
    choices2{i} = xlsread('data2.xlsm', i + 1);
    rewards2{i} = xlsread('data2.xlsm', i + 13);
end
toc;

%% model fitting 
% initialising 1
paras1_aso = cell(num_subject, num_conditions); % fitted parameters of asocial RL model
fval1_aso = zeros(num_subject, num_conditions); % fitted minimum NLL value of asocial RL model
exitflag1_aso = zeros(num_subject, num_conditions); % exitflag (equals to 1 if converge)

paras1_unc = paras1_aso; % fitted parameters of unconditional-copying model
fval1_unc = fval1_aso; % fitted minimum NLL value of unconditional-copying model
exitflag1_unc = exitflag1_aso; % exitflag (equals to 1 if converge)

paras1_suc = paras1_aso; % fitted parameters of copy-the-successful model
fval1_suc = fval1_aso; % fitted minimum NLL value of copy-the-successful model
exitflag1_suc = exitflag1_aso; % exitflag (equals to 1 if converge)

fval1_ran = fval1_aso; % NLL value of random-choice model

% initilising 2
paras2_aso = paras1_aso; % fitted parameters of asocial RL model
fval2_aso = fval1_aso; % fitted minimum NLL value of asocial RL model
exitflag2_aso = exitflag1_aso; % exitflag (equals to 1 if converge)

paras2_unc = paras1_unc; % fitted parameters of unconditional-copying model
fval2_unc = fval1_unc; % fitted minimum NLL value of unconditional-copying model
exitflag2_unc = exitflag1_unc; % exitflag (equals to 1 if converge)

paras2_suc = paras1_suc; % fitted parameters of copy-the-successful model
fval2_suc = fval1_suc; % fitted minimum NLL value of copy-the-successful model
exitflag2_suc = exitflag1_suc; % exitflag (equals to 1 if converge)

fval2_ran = fval1_ran; % NLL value of random-choice model

% fitting
tic; % 142.04s
for i = 1:num_subject
    for j = 1:num_conditions
        
        ind_demo = ceil(j / size(demo, 1));
        ind_opts = j - (ind_demo - 1) * size(demo, 1);
        
        % asocial
        [paras1_aso{i, j}, fval1_aso(i, j), exitflag1_aso(i, j)] = fmincon(@(x) ...
            calculate_NLL(choices1{j}(i, :), rewards1{j}(i, :), "asocial", ...
            num_opts(ind_opts), x), [0.5, 0.1], [],[],[],[], [0, 0.01], [1, 10]);
        [paras2_aso{i, j}, fval2_aso(i, j), exitflag2_aso(i, j)] = fmincon(@(x) ...
            calculate_NLL(choices2{j}(i, :), rewards2{j}(i, :), "asocial", ...
            num_opts(ind_opts), x), [0.5, 0.1], [],[],[],[], [0, 0.01], [1, 10]);
        
        % random
        fval1_ran(i, j) = calculate_NLL(choices1{j}(i, :), rewards1{j}(i, :), "random", num_opts(ind_opts));
        fval2_ran(i, j) = calculate_NLL(choices2{j}(i, :), rewards2{j}(i, :), "random", num_opts(ind_opts));
        
        
        if j > size(demo, 1) % conditions with demonstrators
            % unconditional-copying
            [paras1_unc{i, j}, fval1_unc(i, j), exitflag1_unc(i, j)] = fmincon(@(x) ...
                calculate_NLL(choices1{j}(i, :), rewards1{j}(i, :),...
                "unconditional", num_opts(ind_opts), x, demo{ind_opts, ind_demo}), ...
                [0.3, 0.1, 0.5], [],[],[],[], [0, 0.01, 0], [1, 10, 1]);
            [paras2_unc{i, j}, fval2_unc(i, j), exitflag2_unc(i, j)] = fmincon(@(x) ...
                calculate_NLL(choices2{j}(i, :), rewards2{j}(i, :),...
                "unconditional", num_opts(ind_opts), x, demo{ind_opts, ind_demo}), ...
                [0.3, 0.1, 0.5], [],[],[],[], [0, 0.01, 0], [1, 10, 1]);
            
            % copy-the-successful
            [paras1_suc{i, j}, fval1_suc(i, j), exitflag1_suc(i, j)] = fmincon(@(x) ...
                calculate_NLL(choices1{j}(i, :), rewards1{j}(i, :), ...
                "suc", num_opts(ind_opts), x, demo{ind_opts, ind_demo}), ...
                [0.3, 0.1, 0.5], [],[],[],[], [0, 0.01, 0], [1, 10, 1]); 
            [paras2_suc{i, j}, fval2_suc(i, j), exitflag2_suc(i, j)] = fmincon(@(x) ...
                calculate_NLL(choices2{j}(i, :), rewards2{j}(i, :), ...
                "suc", num_opts(ind_opts), x, demo{ind_opts, ind_demo}), ...
                [0.3, 0.1, 0.5], [],[],[],[], [0, 0.01, 0], [1, 10, 1]); 
        end
        
    end
end
toc;

%% model comparison (all subjects)
% functions AIC and BIC are used to calculated the value of AIC and BIC
% input:
% AIC - smaller, better
% NLL - negative log likelihood value calculated by the according function
% n_para - number of parameters

AIC = @(NLL, n_para) 2 * NLL + 2 * n_para;

% initialisating
AICs1 = zeros(num_subject, num_conditions, 4); % 4 - number of strategies
AICs2 = AICs1; 
num_opts = [2, 4, 8];
num_trials = 20;

for i = 1:num_subject
    for j = 1:num_conditions
        ind_demo = ceil(j / size(demo, 1));
        ind_opts = j - (ind_demo - 1) * size(demo, 1);
        
        % AICs1
        % asocial
        AICs1(i, j, 1) = AIC(fval1_aso(i, j), 2);
        AICs2(i, j, 1) = AIC(fval2_aso(i, j), 2);
        
        % random
        AICs1(i, j, 2) = AIC(fval1_ran(i, j), 0);
        AICs2(i, j, 2) = AIC(fval2_ran(i, j), 0);
        
        if j > size(demo, 1) % conditions with demonstrators
            % unconditional copy
            AICs1(i, j, 3) = AIC(fval1_unc(i, j), 3);
            AICs2(i, j, 3) = AIC(fval2_unc(i, j), 3);
            
            % copy-the-successful
            AICs1(i, j, 4) = AIC(fval1_suc(i, j), 3);
            AICs2(i, j, 4) = AIC(fval2_suc(i, j), 3);
            
        end
        
    end
end


%% identifying models for individual subjects
model1_sub = zeros(num_subject, num_conditions);
model2_sub = model1_sub;

for i = 1:num_subject
    for j = 1:num_conditions
        
        if (j <= length(num_opts)) % no demonstrator
            [temp_AIC, model1_sub(i, j)] = min(AICs1(i, j, 1:2));
            [temp_AIC, model2_sub(i, j)] = min(AICs2(i, j, 1:2));
        else % with demonstrator
            [temp_AIC, model1_sub(i, j)] = min(AICs1(i, j, :));
            [temp_AIC, model2_sub(i, j)] = min(AICs2(i, j, :));
        end
        
    end
end

%%
csvwrite('data1_models.csv', model1_sub);
csvwrite('data2_models.csv', model2_sub);









