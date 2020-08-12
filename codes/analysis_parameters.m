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

%% model fitting (all subjects)
% initialising 1
paras1_alpha = zeros(num_subject, size(demo, 1));
paras1_beta = paras1_alpha;
fval1_aso = zeros(num_subject, size(demo, 1));
exitflag1_aso = fval1_aso;

paras1_eta = zeros(size(demo));
fval1_unc = zeros(size(demo));
exitflag1_unc = fval1_unc;

% initialising 1
paras2_alpha = paras1_alpha;
paras2_beta = paras1_beta;
fval2_aso = fval1_aso;
exitflag2_aso = exitflag1_aso;

paras2_eta = paras1_eta;
fval2_unc = fval1_unc;
exitflag2_unc = exitflag1_unc;


% fitting
tic; % 33.09s
for i = 1:num_subject
    for j = 1:num_conditions
        
        ind_demo = ceil(j / size(demo, 1));
        ind_opts = j - (ind_demo - 1) * size(demo, 1);
        
        if j <= size(demo, 1) % no demonstrator      
            % asocial
            [paras1_aso, fval1_aso(i, j), exitflag1_aso(i, j)] = fmincon(@(x) ...
                calculate_NLL(choices1{j}(i, :), rewards1{j}(i, :), "asocial", ...
                num_opts(ind_opts), x), [0.5, 0.1], [],[],[],[], [0, 0.01], [1, 10]);
            paras1_alpha(i, j) = paras1_aso(1);
            paras1_beta(i, j) = paras1_aso(2); 
            
            [paras2_aso, fval2_aso(i, j), exitflag2_aso(i, j)] = fmincon(@(x) ...
                calculate_NLL(choices2{j}(i, :), rewards2{j}(i, :), "asocial", ...
                num_opts(ind_opts), x), [0.5, 0.1], [],[],[],[], [0, 0.01], [1, 10]);
            paras2_alpha(i, j) = paras2_aso(1);
            paras2_beta(i, j) = paras2_aso(2); 
        else
            % unconditional copy
            [paras1_eta(i, j), fval1_unc(i, j), exitflag1_unc(i, j)] = fmincon(@(x) ...
                calculate_NLL(choices1{j}(i, :), rewards1{j}(i, :),...
                "unconditional", num_opts(ind_opts), [paras1_alpha(i, ind_opts), paras1_beta(i, ind_opts), x], demo{ind_opts, ind_demo}), ...
                0.5, [],[],[],[], 0, 1);
            
            [paras2_eta(i, j), fval2_unc(i, j), exitflag2_unc(i, j)] = fmincon(@(x) ...
                calculate_NLL(choices2{j}(i, :), rewards2{j}(i, :),...
                "unconditional", num_opts(ind_opts), [paras2_alpha(i, ind_opts), paras2_beta(i, ind_opts), x], demo{ind_opts, ind_demo}), ...
                0.5, [],[],[],[], 0, 1);
        end
        
    end
end
toc;

%%
csvwrite('data1_paras_alpha.csv', paras1_alpha);
csvwrite('data1_paras_beta.csv', paras1_beta);
csvwrite('data1_paras_eta.csv', paras1_eta);
csvwrite('data2_paras_alpha.csv', paras2_alpha);
csvwrite('data2_paras_beta.csv', paras2_beta);
csvwrite('data2_paras_eta.csv', paras2_eta);













