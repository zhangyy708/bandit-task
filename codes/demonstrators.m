% data explanation:
% ps - reward rates of each option in each condition
% ps{:, :}
%
% demo - demonstrators' choice sequences in each condition
% demo{:, :}
% rows 1-3: no demostrator
% rows 4-6: low-performance demonstrator (2-, 4-, and 8-arm bandits)
% rows 7-9: medium-performance demonstrator (2-, 4-, and 8-arm bandits)
% rows 10-12: high-performance demonstrator (2-, 4-, and 8-arm bandits)


%% generating reward rates
% theta_i follows distribution Beta(alpha*, beta*), where alpha* = beta* = 2 (Steyvers et al., 2009)

num_arm = [2, 4, 8]; % numbers of options in a trial
num_con = 4; % number of demonstrator conditions (no demonstration / low / medium / high performance)
ps = cell(1, length(num_arm)); % reward rates of options in all conditions

rng(4325); % setting the seed
for i = 1:length(num_arm)
    ps{i} = betarnd(2, 2, 1, num_arm(i));
end

% results:
% ps{:}
%     0.6587, 0.0749
%     0.7958, 0.3499, 0.5524, 0.3952
%     0.5257, 0.5903, 0.7394, 0.3278, 0.1815, 0.4394, 0.6862, 0.5051

num_trials = 20; 


%% generating demonstrator pool
rng(2929); % set seeds
epsilon_high = 0.2; % better than random
epsilon_mid = 0.4; % better than random
epsilon_low = 0.6; % worse than or equal to random policy

N = 1000; % simulation times
C_high = cell(length(num_arm), 1); % choices
R_exp_high = cell(length(num_arm), 1); % expected rewards of each choice sequence
C_mid = C_high;
R_exp_mid = R_exp_high;
C_low = C_high;
R_exp_low = R_exp_high;

tic; % 0.74s
for i = 1:length(num_arm)
        
    C_high{i} = zeros(num_trials, N); 
    R_exp_high{i} = zeros(1, N);
    C_mid{i} = zeros(num_trials, N); 
    R_exp_mid{i} = zeros(1, N); 
    C_low{i} = zeros(num_trials, N); 
    R_exp_low{i} = zeros(1, N);
    p = ps{i};
    num_opts = length(p);

    for k = 1:N

        [C_high{i}(:, k), rewards_temp] = simulate("demo", epsilon_high, [num_trials, num_opts, p]);
        R_exp_high{i}(k) = sum(p(C_high{i}(:, k)));

        [C_mid{i}(:, k), rewards_temp] = simulate("demo", epsilon_mid, [num_trials, num_opts, p]);
        R_exp_mid{i}(k) = sum(p(C_mid{i}(:, k)));

        [C_low{i}(:, k), rewards_temp] = simulate("demo", epsilon_low, [num_trials, num_opts, p]);
        R_exp_low{i}(k) = sum(p(C_low{i}(:, k)));

    end
end
toc;

% Use above parameters to simulate 1000 choice sequences for high-, medium- and
% low-performance demonstrators in all conditions, respectively. For each
% condition, the choice sequence whose expected total reward ranked 67% (or
% 50%, or 33%) in an ascending order at all high- (or medium-, or low-) 
% performance sequences was selected as the high- (or medium-, or low-) 
% performance demonstrator.


%% generating demonstrator chocies

demo = cell(length(num_arm), num_con);

tic; % 0.007s
for i = 1:length(num_arm)
    temp = sort(R_exp_high{i});
    prc_67 = round(N * 67/100);
    ind_high = find(R_exp_high{i} == temp(prc_67));
    demo{i, 4} = C_high{i}(:, ind_high(1))';
    
    temp = sort(R_exp_mid{i});
    prc_50 = round(N * 50/100);
    ind_mid = find(R_exp_mid{i} == temp(prc_50));
    demo{i, 3} = C_mid{i}(:, ind_mid(1))';
    
    temp = sort(R_exp_low{i});
    prc_33 = round(N * 33/100);
    ind_low = find(R_exp_low{i} == temp(prc_33));
    demo{i, 2} = C_low{i}(:, ind_low(1))';
end
toc;

% results:
% demo{:, :}
% % low performance
%  2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 1, 1, 1, 2, 2, 2, 1, 1, 2
%  3, 2, 3, 3, 2, 2, 3, 2, 1, 4, 3, 1, 1, 3, 1, 2, 1, 1, 4, 3
%  6, 5, 5, 5, 6, 3, 3, 3, 3, 3, 1, 3, 3, 2, 3, 3, 5, 4, 3, 3
% % medium performance
%  1, 2, 1, 2, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 2, 2
%  3, 2, 3, 1, 1, 1, 3, 1, 1, 4, 2, 4, 1, 4, 1, 1, 1, 1, 1, 1
%  8, 4, 3, 4, 1, 3, 3, 2, 6, 3, 3, 3, 3, 3, 8, 1, 3, 3, 3, 3
% % high performance
%  1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1
%  1, 1, 1, 3, 4, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1
%  3, 3, 3, 2, 7, 3, 7, 3, 3, 3, 3, 3, 3, 5, 3, 3, 3, 3, 3, 3
     

% expected rewards:
% low performance v.s. medium performance v.s. high performance 
[sum(ps{1}(demo{1, 2})), sum(ps{1}(demo{1, 3})), sum(ps{1}(demo{1, 4}));
 sum(ps{2}(demo{2, 2})), sum(ps{2}(demo{2, 3})), sum(ps{2}(demo{2, 4}));
 sum(ps{3}(demo{3, 2})), sum(ps{3}(demo{3, 3})), sum(ps{3}(demo{3, 4}))]


%% data saved as .mat files
save('experiment_short_probability.mat', 'ps', 'demo', 'num_trials');
