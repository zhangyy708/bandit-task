# About

This project stores all files that have been used in the conduct and the analysis of the experiments in *Yuyan Zhang*'s MSc dissertation work 
(named as *When and how people use individual and social learning in multi-armed bandit problems*).


# The Experiment

NArmedBandit.js, index.html, and all files in the static folder are used for the construction of the experiment website. 
The github version of the task (https://zhangyy708.github.io/bandit-task/) can work as a sample of the real experiment, 
except that the data would not be sent to the database.

These codes were adapted from an online tutorial (http://www.urihertz.net/images/Tutorial.pdf).
It was really helpful!

The bandit-task-master_doors_version folder stores an old version of this task. 
It could work, but is less intuitive than the current one.


# Data Analysis
Files in the codes folder have been used for the parameter generation and data analysis.
Figures and analysed data (all of which can be generated from the codes in the folder) are also included.

*demonstrators.m*
 - to generate the reward rates and artifical demonstrators in the task

*model_recovery.m*
 - to test the model recovery ability of the models used in the dissertation

*analysis_model.m*
 - to fit each participant's data to all models and find a best-fit one for each individual

*analysis_parameters.m*
 - to calculate the parameters of the models for each participant, including learning rate, temperature, and copying rate

*simulate.m*
 - the function that simulates choices in a game

*calculate_NLL.m*
 - the function that calculate the negative log likelihood value

*data_analysis_script.R* and *data_analysis_document.Rmd*
 - R codes that have been used to analyse the behavioural data
