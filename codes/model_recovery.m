%% 1 - generating many artifical data
clear
load('experiment_short_probability.mat'); 
N = 100; % number of simulated data

%% 1.1 - RL
rng(1001); % setting seeds

% parameters
alpha = rand(1, N); % U(0, 1)
beta = 10 .^ (-2 + 3 .* rand(1, N)); % Exp(10)
paras_RL = [alpha; beta];

%  initialising
C_RL = cell(1, length(ps));
R_RL = C_RL;

% simulating
tic; % 0.19s
for k = 1:length(ps)
    
    %  initialising
    C_RL{k} = zeros(N, num_trials);
    R_RL{k} = C_RL{k};
    
    % simulating
    for i = 1:N
        [C_RL{k}(i, :), R_RL{k}(i, :)] = simulate("RL", paras_RL(:, i), [num_trials, length(ps{k}), ps{k}], []);
    end
    
end
toc;

%% 1.2 - unconditional-copying
rng(1002); % setting seeds

% parameters
alpha = rand(1, N); % U(0, 1)
beta = 10 .^ (-2 + 3 .* rand(1, N)); % Exp(10)
eta = rand(1, N); % U(0, 1)
paras_unc = [alpha; beta; eta];

%  initialising
C_unc = cell(size(demo));
R_unc = C_unc;

% simulating
tic; % 0.08s
for k = 1:size(demo, 1)
    for j = 2:size(demo, 2) % excluding the no-demonstrator condition
        
        %  initialising
        C_unc{k, j} = zeros(N, num_trials);
        R_unc{k, j} = C_unc{k, j};

        % simulating
        for i = 1:N
            [C_unc{k, j}(i, :), R_unc{k, j}(i, :)] = simulate("unconditional", paras_unc(:, i), [num_trials, length(ps{k}), ps{k}], demo{k, j});
        end
        
    end    
end
toc;

%% 1.3 - copy-the-successful
rng(1003); % setting seeds

% parameters
alpha = rand(1, N); % U(0, 1)
beta = 10 .^ (-2 + 3 .* rand(1, N)); % Exp(10)
theta = rand(1, N); % U(0, 1)
paras_suc = [alpha; beta; theta];

%  initialising
C_suc = cell(size(demo));
R_suc = C_suc;

% simulating
tic; % 0.51s
for k = 1:size(demo, 1)
    for j = 2:size(demo, 2) % excluding the no-demonstrator condition
        
        %  initialising
        C_suc{k, j} = zeros(N, num_trials);
        R_suc{k, j} = C_suc{k, j};

        % simulating
        for i = 1:N
            [C_suc{k, j}(i, :), R_suc{k, j}(i, :)] = simulate("suc", paras_suc(:, i), [num_trials, length(ps{k}), ps{k}], demo{k, j});
        end
        
    end    
end
toc;

%% 1.4 random
%  initialising
C_ran = cell(1, length(ps));
R_ran = C_ran;

% simulating
tic; % 0.05s
for k = 1:length(ps)
    
    %  initialising
    C_ran{k} = zeros(N, num_trials);
    R_ran{k} = C_ran{k};
    
    % simulating
    for i = 1:N
        [C_ran{k}(i, :), R_ran{k}(i, :)] = simulate("random", [], [num_trials, length(ps{k}), ps{k}], []);
    end
    
end
toc;


%% 2 - parameter recovery

%% 2.1 RL
paras_fitted_RL = cell(1, length(ps));
fval_fitted_RL = paras_fitted_RL;
exitflag_fitted_RL = paras_fitted_RL;

% fitting
tic; % 10.54s
for k = 1:length(ps)
    
    % initialising
    paras_fitted_RL{k} = zeros(size(paras_RL));
    fval_fitted_RL{k} = zeros(1, N);
    exitflag_fitted_RL{k} = fval_fitted_RL{k};
    
    % fitting
    for i = 1:N
        [paras_fitted_RL{k}(:, i), fval_fitted_RL{k}(i), exitflag_fitted_RL{k}(i)] = ...
            fmincon(@(x) calculate_NLL(C_RL{k}(i, :), R_RL{k}(i, :), "asocial", length(ps{k}), x), ...
            paras_RL(:, i), [],[],[],[], [0, 0.01], [1, 10]); % beta: 0.01 ~ 10
    end
    
end
toc;

% correlation
r_RL_alpha = zeros(1, length(ps)); % correlation coefficient between 'alpha for simulation' and 'fitted alpha'
r_p_RL_alpha = r_RL_alpha; % correlation significance
r_RL_beta = r_RL_alpha;
r_p_RL_beta = r_RL_alpha;
for k = 1:length(ps)
    [r_RL_alpha(k), r_p_RL_alpha(k)] = corr(paras_RL(1, :)', paras_fitted_RL{k}(1, :)');
    [r_RL_beta(k), r_p_RL_beta(k)] = corr(paras_RL(2, :)', paras_fitted_RL{k}(2, :)');
end
[r_RL_alpha; r_p_RL_alpha; r_RL_beta; r_p_RL_beta]

figure;
for k = 1:length(ps)
    subplot(1, length(ps), k);
    plot(paras_RL(1, :)', paras_fitted_RL{k}(1, :)', 'o');
end

figure;
for k = 1:length(ps)
    subplot(1, length(ps), k);
    plot(log(paras_RL(2, :)') ./ log(10), log(paras_fitted_RL{k}(2, :)') ./ log(10), 'o'); % log_10 (beta)
end

%% 2.2 unconditional-copying
paras_fitted_unc = cell(size(demo));
fval_fitted_unc = paras_fitted_unc;
exitflag_fitted_unc = paras_fitted_unc;

% fitting
tic; % 37.68s
for k = 1:length(ps)
    for j = 2:size(demo, 2)
    
        % initialising
        paras_fitted_unc{k, j} = zeros(size(paras_unc));
        fval_fitted_unc{k, j} = zeros(1, N);
        exitflag_fitted_unc{k, j} = fval_fitted_unc{k, j};

        % fitting
        for i = 1:N
            [paras_fitted_unc{k, j}(:, i), fval_fitted_unc{k, j}(i), exitflag_fitted_unc{k, j}(i)] = ...
                fmincon(@(x) calculate_NLL(C_unc{k, j}(i, :), R_unc{k, j}(i, :), "unconditional", length(ps{k}), x, demo{k, j}), ...
                paras_unc(:, i), [],[],[],[], [0, 0.01, 0], [1, 10, 1]);
        end
        
    end    
end
toc;

% correlation
r_unc_alpha = zeros(size(demo)); % correlation coefficient between 'alpha for simulation' and 'fitted alpha'
r_p_unc_alpha = r_unc_alpha; % correlation significance
r_unc_beta = r_unc_alpha;
r_p_unc_beta = r_unc_alpha;
r_unc_eta = r_unc_alpha;
r_p_unc_eta = r_unc_alpha;
for k = 1:length(ps)
    for j = 2:size(demo, 2)
        [r_unc_alpha(k, j), r_p_unc_alpha(k, j)] = corr(paras_unc(1, :)', paras_fitted_unc{k, j}(1, :)');
        [r_unc_beta(k, j), r_p_unc_beta(k, j)] = corr(paras_unc(2, :)', paras_fitted_unc{k, j}(2, :)');
        [r_unc_eta(k, j), r_p_unc_eta(k, j)] = corr(paras_unc(3, :)', paras_fitted_unc{k, j}(3, :)');
    end
end
[r_unc_alpha; r_p_unc_alpha; r_unc_beta; r_p_unc_beta; r_unc_eta; r_p_unc_eta]

figure;
for k = 1:length(ps)
    for j = 2:size(demo, 2)
        subplot(size(demo, 1), size(demo, 2), (k - 1) * size(demo, 2) + j);
        plot(paras_unc(1, :)', paras_fitted_unc{k, j}(1, :)', 'o');
    end
end

figure;
for k = 1:length(ps)
    for j = 2:size(demo, 2)
        subplot(size(demo, 1), size(demo, 2), (k - 1) * size(demo, 2) + j);
        plot(log(paras_unc(2, :)') ./ log(10), log(paras_fitted_unc{k, j}(2, :)') ./ log(10), 'o'); % log_10 (beta)
    end
end

figure;
for k = 1:length(ps)
    for j = 2:size(demo, 2)
        subplot(size(demo, 1), size(demo, 2), (k - 1) * size(demo, 2) + j);
        plot(paras_unc(3, :)', paras_fitted_unc{k, j}(3, :)', 'o');
    end
end

%% 2.3 copy-the-successful
paras_fitted_suc = cell(size(demo));
fval_fitted_suc = paras_fitted_suc;
exitflag_fitted_suc = paras_fitted_suc;

% fitting
tic; % 58.90s
for k = 1:length(ps)
    for j = 2:size(demo, 2)
    
        % initialising
        paras_fitted_suc{k, j} = zeros(size(paras_suc));
        fval_fitted_suc{k, j} = zeros(1, N);
        exitflag_fitted_suc{k, j} = fval_fitted_suc{k, j};

        % fitting
        for i = 1:N
            [paras_fitted_suc{k, j}(:, i), fval_fitted_suc{k, j}(i), exitflag_fitted_suc{k, j}(i)] = ...
                fmincon(@(x) calculate_NLL(C_suc{k, j}(i, :), R_suc{k, j}(i, :), "suc", length(ps{k}), x, demo{k, j}), ...
                paras_suc(:, i), [],[],[],[], [0, 0.01, 0], [1, 10, 1]);
        end
        
    end    
end
toc;

% correlation
r_suc_alpha = zeros(size(demo)); % correlation coefficient between 'alpha for simulation' and 'fitted alpha'
r_p_suc_alpha = r_suc_alpha; % correlation significance
r_suc_beta = r_suc_alpha;
r_p_suc_beta = r_suc_alpha;
r_suc_theta = r_suc_alpha;
r_p_suc_theta = r_suc_alpha;
for k = 1:length(ps)
    for j = 2:size(demo, 2)
        [r_suc_alpha(k, j), r_p_suc_alpha(k, j)] = corr(paras_suc(1, :)', paras_fitted_suc{k, j}(1, :)');
        [r_suc_beta(k, j), r_p_suc_beta(k, j)] = corr(paras_suc(2, :)', paras_fitted_suc{k, j}(2, :)');
        [r_suc_theta(k, j), r_p_suc_theta(k, j)] = corr(paras_suc(3, :)', paras_fitted_suc{k, j}(3, :)');
    end
end
[r_suc_alpha; r_p_suc_alpha; r_suc_beta; r_p_suc_beta; r_suc_theta; r_p_suc_theta]

figure;
for k = 1:length(ps)
    for j = 2:size(demo, 2)
        subplot(size(demo, 1), size(demo, 2), (k - 1) * size(demo, 2) + j);
        plot(paras_suc(1, :)', paras_fitted_suc{k, j}(1, :)', 'o');
    end
end

figure;
for k = 1:length(ps)
    for j = 2:size(demo, 2)
        subplot(size(demo, 1), size(demo, 2), (k - 1) * size(demo, 2) + j);
        plot(log(paras_suc(2, :)') ./ log(10), log(paras_fitted_suc{k, j}(2, :)') ./ log(10), 'o'); % log_10 (beta)
    end
end

figure;
for k = 1:length(ps)
    for j = 2:size(demo, 2)
        subplot(size(demo, 1), size(demo, 2), (k - 1) * size(demo, 2) + j);
        plot(paras_suc(3, :)', paras_fitted_suc{k, j}(3, :)', 'o');
    end
end

%% 3 - model recovery
AIC = @(NLL, n_para) 2 * NLL + 2 * n_para;
BIC = @(NLL, n_para, N) 2 * NLL + n_para * log(N);
num_models = 4; % number of models being tested
model_no_demo = [1, 4]; % models that can be fitted in no-demostrator conditions
% order: RL, unc, suc, random

%% 3.1 - RL
paras_rec_RL = cell(1, num_models);
fval_rec_RL = paras_rec_RL;
exitflag_rec_RL = paras_rec_RL;

% initialising
paras_rec_RL{1} = cell(1, length(ps));
paras_rec_RL{2} = cell(size(demo));
paras_rec_RL{3} = cell(size(demo));
paras_rec_RL{4} = cell(1, length(ps));
fval_rec_RL{1} = paras_rec_RL{1};
fval_rec_RL{2} = paras_rec_RL{2};
fval_rec_RL{3} = paras_rec_RL{3};
fval_rec_RL{4} = paras_rec_RL{4};
exitflag_rec_RL{1} = paras_rec_RL{1};
exitflag_rec_RL{2} = paras_rec_RL{2};
exitflag_rec_RL{3} = paras_rec_RL{3};
exitflag_rec_RL{4} = paras_rec_RL{4};

% RL random
tic; % 88.46s
for k = 1:length(ps)
    
    % initialising
    paras_rec_RL{1}{k} = zeros(size(paras_RL));
    paras_rec_RL{4}{k} = [];
    fval_rec_RL{1}{k} = zeros(1, N);
    fval_rec_RL{4}{k} = fval_rec_RL{1}{k};
    exitflag_rec_RL{1}{k} = fval_rec_RL{1}{k};
    exitflag_rec_RL{4}{k} = [];
    
    % fitting
    for i = 1:N
        [paras_rec_RL{1}{k}(:, i), fval_rec_RL{1}{k}(i), exitflag_rec_RL{1}{k}(i)] = ...
            fmincon(@(x) calculate_NLL(C_RL{k}(i, :), R_RL{k}(i, :), "asocial", length(ps{k}), x), ...
            paras_RL(:, i), [],[],[],[], [0, 0.01], [1, 10]); % beta: 0.01 ~ 10
        fval_rec_RL{4}{k}(i) = calculate_NLL(C_RL{k}(i, :), R_RL{k}(i, :), "random", length(ps{k}), []);        
    end
    
end
toc;

% unc suc
tic; % 122.68s
for k = 1:length(ps)
    for j = 2:size(demo, 2)
    
        % initialising
        paras_rec_RL{2}{k, j} = zeros(size(paras_unc));
        paras_rec_RL{3}{k, j} = zeros(size(paras_suc));
        fval_rec_RL{2}{k, j} = zeros(1, N);
        fval_rec_RL{3}{k, j} = fval_rec_RL{2}{k, j};
        exitflag_rec_RL{2}{k, j} = fval_rec_RL{2}{k, j};
        exitflag_rec_RL{3}{k, j} = fval_rec_RL{3}{k, j};

        % fitting
        for i = 1:N
            [paras_rec_RL{2}{k, j}(:, i), fval_rec_RL{2}{k, j}(i), exitflag_rec_RL{2}{k, j}(i)] = ...
                fmincon(@(x) calculate_NLL(C_RL{k}(i, :), R_RL{k}(i, :), "unconditional", length(ps{k}), x, demo{k, j}), ...
                [0.5, 1, 0.5], [],[],[],[], [0, 0.01, 0], [1, 10, 1]);
            [paras_rec_RL{3}{k, j}(:, i), fval_rec_RL{3}{k, j}(i), exitflag_rec_RL{3}{k, j}(i)] = ...
                fmincon(@(x) calculate_NLL(C_RL{k}(i, :), R_RL{k}(i, :), "suc", length(ps{k}), x, demo{k, j}), ...
                [0.5, 1, 0.5], [],[],[],[], [0, 0.01, 0], [1, 10, 1]);
        end
        
    end    
end
toc;

% calculating AIC
AIC_rec_RL = cell(size(demo));

for k = 1:length(ps)
    for j = 1:size(demo, 2)
        
        AIC_rec_RL{k, j} = zeros(N, num_models);
        
        for m = 1:num_models
            if (j == 1) % no demonstrator
                if (ismember(m, model_no_demo))
                    AIC_rec_RL{k, j}(:, m) = AIC(fval_rec_RL{m}{k}, size(paras_rec_RL{m}{k}, 1));
                else
                    AIC_rec_RL{k, j}(:, m) = 999; % a random large number
                end
            else
                if (ismember(m, model_no_demo))
                    AIC_rec_RL{k, j}(:, m) = AIC(fval_rec_RL{m}{k}, size(paras_rec_RL{m}{k}, 1));
                else
                    AIC_rec_RL{k, j}(:, m) = AIC(fval_rec_RL{m}{k, j}, size(paras_rec_RL{m}{k, j}, 1));
                end
            end
        end
        
    end
end

% finding minimum AIC
model_rec_RL = cell(size(demo));

for k = 1:length(ps)
    for j = 1:size(demo, 2)
        
        model_rec_RL{k, j} = zeros(1, N);
        
        if (j == 1) % no demonstrator
            [temp_AIC, model_rec_RL{k, j}] = min(AIC_rec_RL{k, j}, [], 2);
        else
            [temp_AIC, model_rec_RL{k, j}] = min(AIC_rec_RL{k, j}, [], 2);
        end
        
    end
end

% counting
count_rec_RL = cell(size(demo));

for k = 1:length(ps)
    for j = 1:size(demo, 2)
        
        count_rec_RL{k, j} = sum(model_rec_RL{k, j} == 1:4);
        
    end
end

%% 3.2 - unconditional-copying
paras_rec_unc = cell(1, num_models);
fval_rec_unc = paras_rec_unc;
exitflag_rec_unc = paras_rec_unc;

% initialising
paras_rec_unc{1} = cell(size(demo));
paras_rec_unc{2} = cell(size(demo));
paras_rec_unc{3} = cell(size(demo));
paras_rec_unc{4} = cell(size(demo));
fval_rec_unc{1} = paras_rec_unc{1};
fval_rec_unc{2} = paras_rec_unc{2};
fval_rec_unc{3} = paras_rec_unc{3};
fval_rec_unc{4} = paras_rec_unc{4};
exitflag_rec_unc{1} = paras_rec_unc{1};
exitflag_rec_unc{2} = paras_rec_unc{2};
exitflag_rec_unc{3} = paras_rec_unc{3};
exitflag_rec_unc{4} = paras_rec_unc{4};

% fitting (all models)
tic; % 151.08
for k = 1:length(ps)
    for j = 2:size(demo, 2)
    
        % initialising
        paras_rec_unc{1}{k, j} = zeros(size(paras_RL));
        paras_rec_unc{2}{k, j} = zeros(size(paras_unc));
        paras_rec_unc{3}{k, j} = zeros(size(paras_suc));
        paras_rec_unc{4}{k, j} = [];
        fval_rec_unc{1}{k, j} = zeros(1, N);
        fval_rec_unc{2}{k, j} = zeros(1, N);
        fval_rec_unc{3}{k, j} = fval_rec_unc{2}{k, j};
        fval_rec_unc{4}{k, j} = fval_rec_unc{1}{k, j};
        exitflag_rec_unc{1}{k, j} = fval_rec_unc{1}{k, j};
        exitflag_rec_unc{2}{k, j} = fval_rec_unc{2}{k, j};
        exitflag_rec_unc{3}{k, j} = fval_rec_unc{3}{k, j};
        exitflag_rec_unc{4}{k, j} = [];

        % fitting
        for i = 1:N
            
            [paras_rec_unc{1}{k, j}(:, i), fval_rec_unc{1}{k, j}(i), exitflag_rec_unc{1}{k, j}(i)] = ...
                fmincon(@(x) calculate_NLL(C_unc{k, j}(i, :), R_unc{k, j}(i, :), "asocial", length(ps{k}), x), ...
                paras_RL(:, i), [],[],[],[], [0, 0.01], [1, 10]); % beta: 0.01 ~ 10  
            [paras_rec_unc{2}{k, j}(:, i), fval_rec_unc{2}{k, j}(i), exitflag_rec_unc{2}{k, j}(i)] = ...
                fmincon(@(x) calculate_NLL(C_unc{k, j}(i, :), R_unc{k, j}(i, :), "unconditional", length(ps{k}), x, demo{k, j}), ...
                [0.5, 1, 0.5], [],[],[],[], [0, 0.01, 0], [1, 10, 1]);
            [paras_rec_unc{3}{k, j}(:, i), fval_rec_unc{3}{k, j}(i), exitflag_rec_unc{3}{k, j}(i)] = ...
                fmincon(@(x) calculate_NLL(C_unc{k, j}(i, :), R_unc{k, j}(i, :), "suc", length(ps{k}), x, demo{k, j}), ...
                [0.5, 1, 0.5], [],[],[],[], [0, 0.01, 0], [1, 10, 1]);
            fval_rec_unc{4}{k, j}(i) = calculate_NLL(C_unc{k, j}(i, :), R_unc{k, j}(i, :), "random", length(ps{k}), []);   
        end
        
    end    
end
toc;

% calculating AIC
AIC_rec_unc = cell(size(demo));

for k = 1:length(ps)
    for j = 2:size(demo, 2)
        
        AIC_rec_unc{k, j} = zeros(N, num_models);
        
        for m = 1:num_models
            AIC_rec_unc{k, j}(:, m) = AIC(fval_rec_unc{m}{k, j}, size(paras_rec_unc{m}{k, j}, 1));
        end
        
    end
end

% finding minimum AIC
model_rec_unc = cell(size(demo));

for k = 1:length(ps)
    for j = 2:size(demo, 2)
        
        model_rec_unc{k, j} = zeros(1, N);        
        [temp_AIC, model_rec_unc{k, j}] = min(AIC_rec_unc{k, j}, [], 2);
    end
end

% counting
count_rec_unc = cell(size(demo));

for k = 1:length(ps)
    for j = 2:size(demo, 2)
        
        count_rec_unc{k, j} = sum(model_rec_unc{k, j} == 1:4);
        
    end
end

%% 3.3 - copy-the-successful
paras_rec_suc = cell(1, num_models);
fval_rec_suc = paras_rec_suc;
exitflag_rec_suc = paras_rec_suc;

% initialising
paras_rec_suc{1} = cell(size(demo));
paras_rec_suc{2} = cell(size(demo));
paras_rec_suc{3} = cell(size(demo));
paras_rec_suc{4} = cell(size(demo));
fval_rec_suc{1} = paras_rec_suc{1};
fval_rec_suc{2} = paras_rec_suc{2};
fval_rec_suc{3} = paras_rec_suc{3};
fval_rec_suc{4} = paras_rec_suc{4};
exitflag_rec_suc{1} = paras_rec_suc{1};
exitflag_rec_suc{2} = paras_rec_suc{2};
exitflag_rec_suc{3} = paras_rec_suc{3};
exitflag_rec_suc{4} = paras_rec_suc{4};

% fitting (all models)
tic; % 147.02s
for k = 1:length(ps)
    for j = 2:size(demo, 2)
    
        % initialising
        paras_rec_suc{1}{k, j} = zeros(size(paras_RL));
        paras_rec_suc{2}{k, j} = zeros(size(paras_unc));
        paras_rec_suc{3}{k, j} = zeros(size(paras_suc));
        paras_rec_suc{4}{k, j} = [];
        fval_rec_suc{1}{k, j} = zeros(1, N);
        fval_rec_suc{2}{k, j} = zeros(1, N);
        fval_rec_suc{3}{k, j} = fval_rec_suc{2}{k, j};
        fval_rec_suc{4}{k, j} = fval_rec_suc{1}{k, j};
        exitflag_rec_suc{1}{k, j} = fval_rec_suc{1}{k, j};
        exitflag_rec_suc{2}{k, j} = fval_rec_suc{2}{k, j};
        exitflag_rec_suc{3}{k, j} = fval_rec_suc{3}{k, j};
        exitflag_rec_suc{4}{k, j} = [];

        % fitting
        for i = 1:N
            
            [paras_rec_suc{1}{k, j}(:, i), fval_rec_suc{1}{k, j}(i), exitflag_rec_suc{1}{k, j}(i)] = ...
                fmincon(@(x) calculate_NLL(C_suc{k, j}(i, :), R_suc{k, j}(i, :), "asocial", length(ps{k}), x), ...
                paras_RL(:, i), [],[],[],[], [0, 0.01], [1, 10]); % beta: 0.01 ~ 10  
            [paras_rec_suc{2}{k, j}(:, i), fval_rec_suc{2}{k, j}(i), exitflag_rec_suc{2}{k, j}(i)] = ...
                fmincon(@(x) calculate_NLL(C_suc{k, j}(i, :), R_suc{k, j}(i, :), "unconditional", length(ps{k}), x, demo{k, j}), ...
                [0.5, 1, 0.5], [],[],[],[], [0, 0.01, 0], [1, 10, 1]);
            [paras_rec_suc{3}{k, j}(:, i), fval_rec_suc{3}{k, j}(i), exitflag_rec_suc{3}{k, j}(i)] = ...
                fmincon(@(x) calculate_NLL(C_suc{k, j}(i, :), R_suc{k, j}(i, :), "suc", length(ps{k}), x, demo{k, j}), ...
                [0.5, 1, 0.5], [],[],[],[], [0, 0.01, 0], [1, 10, 1]);
            fval_rec_suc{4}{k, j}(i) = calculate_NLL(C_suc{k, j}(i, :), R_suc{k, j}(i, :), "random", length(ps{k}), []);   
        end
        
    end    
end
toc;

% calculating AIC
AIC_rec_suc = cell(size(demo));

for k = 1:length(ps)
    for j = 2:size(demo, 2)
        
        AIC_rec_suc{k, j} = zeros(N, num_models);
        
        for m = 1:num_models
            AIC_rec_suc{k, j}(:, m) = AIC(fval_rec_suc{m}{k, j}, size(paras_rec_suc{m}{k, j}, 1));
        end
        
    end
end

% finding minimum AIC
model_rec_suc = cell(size(demo));

for k = 1:length(ps)
    for j = 2:size(demo, 2)
        
        model_rec_suc{k, j} = zeros(1, N);        
        [temp_AIC, model_rec_suc{k, j}] = min(AIC_rec_suc{k, j}, [], 2);
    end
end

% counting
count_rec_suc = cell(size(demo));

for k = 1:length(ps)
    for j = 2:size(demo, 2)
        
        count_rec_suc{k, j} = sum(model_rec_suc{k, j} == 1:4);
        
    end
end

%% 3.4 - random
paras_rec_ran = cell(1, num_models);
fval_rec_ran = paras_rec_ran;
exitflag_rec_ran = paras_rec_ran;

% initialising
paras_rec_ran{1} = cell(1, length(ps));
paras_rec_ran{2} = cell(size(demo));
paras_rec_ran{3} = cell(size(demo));
paras_rec_ran{4} = cell(1, length(ps));
fval_rec_ran{1} = paras_rec_ran{1};
fval_rec_ran{2} = paras_rec_ran{2};
fval_rec_ran{3} = paras_rec_ran{3};
fval_rec_ran{4} = paras_rec_ran{4};
exitflag_rec_ran{1} = paras_rec_ran{1};
exitflag_rec_ran{2} = paras_rec_ran{2};
exitflag_rec_ran{3} = paras_rec_ran{3};
exitflag_rec_ran{4} = paras_rec_ran{4};

% RL random
tic; % 110.99s
for k = 1:length(ps)
    
    % initialising
    paras_rec_ran{1}{k} = zeros(size(paras_RL));
    paras_rec_ran{4}{k} = [];
    fval_rec_ran{1}{k} = zeros(1, N);
    fval_rec_ran{4}{k} = fval_rec_ran{1}{k};
    exitflag_rec_ran{1}{k} = fval_rec_ran{1}{k};
    exitflag_rec_ran{4}{k} = [];
    
    % fitting
    for i = 1:N
        [paras_rec_ran{1}{k}(:, i), fval_rec_ran{1}{k}(i), exitflag_rec_ran{1}{k}(i)] = ...
            fmincon(@(x) calculate_NLL(C_ran{k}(i, :), R_ran{k}(i, :), "asocial", length(ps{k}), x), ...
            paras_RL(:, i), [],[],[],[], [0, 0.01], [1, 10]); % beta: 0.01 ~ 10
        fval_rec_ran{4}{k}(i) = calculate_NLL(C_ran{k}(i, :), R_ran{k}(i, :), "random", length(ps{k}), []);        
    end
    
end

% unc suc
for k = 1:length(ps)
    for j = 2:size(demo, 2)
    
        % initialising
        paras_rec_ran{2}{k, j} = zeros(size(paras_unc));
        paras_rec_ran{3}{k, j} = zeros(size(paras_suc));
        fval_rec_ran{2}{k, j} = zeros(1, N);
        fval_rec_ran{3}{k, j} = fval_rec_ran{2}{k, j};
        exitflag_rec_ran{2}{k, j} = fval_rec_ran{2}{k, j};
        exitflag_rec_ran{3}{k, j} = fval_rec_ran{3}{k, j};

        % fitting
        for i = 1:N
            [paras_rec_ran{2}{k, j}(:, i), fval_rec_ran{2}{k, j}(i), exitflag_rec_ran{2}{k, j}(i)] = ...
                fmincon(@(x) calculate_NLL(C_ran{k}(i, :), R_ran{k}(i, :), "unconditional", length(ps{k}), x, demo{k, j}), ...
                [0.5, 1, 0.5], [],[],[],[], [0, 0.01, 0], [1, 10, 1]);
            [paras_rec_ran{3}{k, j}(:, i), fval_rec_ran{3}{k, j}(i), exitflag_rec_ran{3}{k, j}(i)] = ...
                fmincon(@(x) calculate_NLL(C_ran{k}(i, :), R_ran{k}(i, :), "suc", length(ps{k}), x, demo{k, j}), ...
                [0.5, 1, 0.5], [],[],[],[], [0, 0.01, 0], [1, 10, 1]);
        end
        
    end    
end
toc;

% calculating AIC
AIC_rec_ran = cell(size(demo));

for k = 1:length(ps)
    for j = 1:size(demo, 2)
        
        AIC_rec_ran{k, j} = zeros(N, num_models);
        
        for m = 1:num_models
            if (j == 1) % no demonstrator
                if (ismember(m, model_no_demo))
                    AIC_rec_ran{k, j}(:, m) = AIC(fval_rec_ran{m}{k}, size(paras_rec_ran{m}{k}, 1));
                else
                    AIC_rec_ran{k, j}(:, m) = 999; % a random large number
                end
            else
                if (ismember(m, model_no_demo))
                    AIC_rec_ran{k, j}(:, m) = AIC(fval_rec_ran{m}{k}, size(paras_rec_ran{m}{k}, 1));
                else
                    AIC_rec_ran{k, j}(:, m) = AIC(fval_rec_ran{m}{k, j}, size(paras_rec_ran{m}{k, j}, 1));
                end
            end
        end
        
    end
end

% finding minimum AIC
model_rec_ran = cell(size(demo));

for k = 1:length(ps)
    for j = 1:size(demo, 2)
        
        model_rec_ran{k, j} = zeros(1, N);
        
        if (j == 1) % no demonstrator
            [temp_AIC, model_rec_ran{k, j}] = min(AIC_rec_ran{k, j}, [], 2);
        else
            [temp_AIC, model_rec_ran{k, j}] = min(AIC_rec_ran{k, j}, [], 2);
        end
        
    end
end

% counting
count_rec_ran = cell(size(demo));

for k = 1:length(ps)
    for j = 1:size(demo, 2)
        
        count_rec_ran{k, j} = sum(model_rec_ran{k, j} == 1:4);
        
    end
end

%% confusion matrices
conf = cell(size(demo)); % confusion matrix

for k = 1:length(ps)
    for j = 1:size(demo, 2)
        conf{k, j} = [count_rec_RL{k, j}; count_rec_unc{k, j}; count_rec_suc{k, j}; count_rec_ran{k, j}];
    end
end

%%
clear data_simulated lambda delta eta ans alpha beta temp_AIC theta i j k phi gamma m
save('model_recovery_results.mat');

% data explanation:
% conf{1~3, 1} - no-demonstrator condition
% conf{1~3, 2~4} - with-demonstrator condition
% a good model recovery - numbers on the diag are large (close to N),
%                         others are small (close to 0)

%% parameter recovery results:
% r
[r_RL_alpha; r_p_RL_alpha; r_RL_beta; r_p_RL_beta]
[r_unc_alpha; r_p_unc_alpha; r_unc_beta; r_p_unc_beta; r_unc_eta; r_p_unc_eta]
[r_suc_alpha; r_p_suc_alpha; r_suc_beta; r_p_suc_beta; r_suc_theta; r_p_suc_theta]
% conf
conf{:, :}



