# Basic flask application
from flask import Flask
from flask import render_template
app=Flask(__name__)
#############################################
############    IMPORTS    ##################
from flask import Flask, request, render_template
import pandas as pd
import numpy as np
import warnings
import joblib
import os
import json

############################################
############    CONFIG    ##################
print("Initializing Flask App ... ")
app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True


# One Hot Encoder Import
print("Importing Encoder ... ")
print(os.getcwd())
encoder = joblib.load('./backend_src/notebooks/joblibs/encoder.joblib')
print("Encoder Imported Successfully")

# Model Imports
print("Importing Machine Learning Models ... ")
clf_model = joblib.load('./backend_src/notebooks/joblibs/clf.joblib')
knn_model = joblib.load('./backend_src/notebooks/joblibs/knn.joblib')
logit_model = joblib.load('./backend_src/notebooks/joblibs/logit.joblib')
nn_model = joblib.load('./backend_src/notebooks/joblibs/nn.joblib')
rbf_model = joblib.load('./backend_src/notebooks/joblibs/rbf.joblib')
svm_model = joblib.load('./backend_src/notebooks/joblibs/svm.joblib')
print("Models Imported Successfully")

# Model Dictionary
model_dict = {
    'clf_model': clf_model,
    'knn_model': knn_model,
    'logit_model': logit_model,
    'nn_model': nn_model,
    'rbf_model': rbf_model,
    'svm_model': svm_model
}

# Dataframe Column Names
col_names = ['down',
            'no_huddle',
            'goal_to_go',
            'sp',
            'defteam_score',
            'half_seconds_remaining',
            'quarter_seconds_remaining',
            'posteam_timeouts_remaining',
            'score_differential',
            'posteam_score',
            'game_seconds_remaining',
            'ydstogo']

# Import Dataframes
print("Importing NFL Data ...")
nfl_df_overall = pd.read_csv('./backend_src/data/nfl_overall_analysis.csv', low_memory=False)
nfl_df_team_view = pd.read_csv('./backend_src/data/nfl_team_analysis.csv', low_memory=False)
print("Data imported Successfully")
print("\nFlask App Configuration Complete\n")

#####################################
##### HOME ROUTE (Initial Route #####
@app.route('/')
def index():
        return render_template('index.html')

@app.route('/get-data', methods=['POST', 'GET'])
def returnProdData():

    # Import User Request Values
    form_input_dict = request.form.to_dict()
    print("User Submitted Form: ", form_input_dict)

    # Down
    down = int(form_input_dict['selectDown'])

    # Quarter
    quarter = int(form_input_dict['selectQuarter'])

    # Huddle vs No Huddle
    no_huddle = 0 if form_input_dict['NoHuddle'] == 'Huddle' else 1

    # Goal to Go
    goaltogo = 1 if form_input_dict['goaltogo'] == 'True' else 0

    # Starting Position
    sp = int(form_input_dict['startingposition'])

    # Defensive Score
    defensive_score = int(form_input_dict['inputDefenseScore'])

    # Offensive Score
    offensive_score = int(form_input_dict['inputOffenseScore'])

    # Score Differential
    score_differential = offensive_score - defensive_score

    # Yards to Go
    yards_to_go = int(form_input_dict['inputDistance'])

    # Time Remaining_in_quarter
    time_remaining_quarter = form_input_dict['timeremaining']

    # Offensive Timeouts Remaining
    offensive_timeouts_remaining = int(form_input_dict['timeoutsremaining'])

    # quarter_seconds_remaining
    minutes_in_quarter = int(time_remaining_quarter.split(':')[0])
    seconds_in_minute = int(time_remaining_quarter.split(':')[1])
    seconds_remaining_in_quarter = minutes_in_quarter*60 + seconds_in_minute

    # half_seconds_remaining
    if quarter == 2 or quarter == 4:
       half_seconds_remaining = seconds_remaining_in_quarter
    else:
        half_seconds_remaining = seconds_remaining_in_quarter + 900

    # Game Seconds Remaining:
    if quarter == 3 or quarter == 4:
        game_seconds_remaining = half_seconds_remaining
    else:
        game_seconds_remaining = half_seconds_remaining + 1800

    # Create List of Data
    data = [[down,
             no_huddle,
             goaltogo,
             sp,
             defensive_score,
             half_seconds_remaining,
             seconds_remaining_in_quarter,
             offensive_timeouts_remaining,
             score_differential,
             offensive_score,
             game_seconds_remaining,
             yards_to_go]]
    data_frame = pd.DataFrame(data, columns=col_names)

    # Encoder
    x_enc = encoder.transform(data_frame[data_frame.columns[0:2]])
    x_enc = x_enc.toarray()

    # Concatenate
    data_frame = np.array(data_frame[[col for col in data_frame.columns if col not in data_frame.columns[0:2]]])
    x_prediction = np.concatenate([data_frame, x_enc[:, 2::]], axis=1)
    x_prediction[np.where(np.isnan(x_prediction))] = 0

    # Prediction
    prediction_score = 0
    for key, value in model_dict.items():
        print("Predicting Play Type with Model: ", key)
        prediction = value.predict(x_prediction)[0]
        prediction_score += prediction
        print("Prediction: ", prediction)

    # Calculate Final Prediction
    pass_prediction = round(prediction_score/len(model_dict), 3)
    run_prediction = round(1-pass_prediction, 3)

    # Build Output Dictionary
    ############
    ### TEST ###
    # Below are DUMMY Numbers
    # Test (Demo) Full Prediction Results
    import random
    prob_short_pass = round(random.random(), 3)
    prob_short_pass_upperci = round(random.random(), 3)
    prob_short_pass_lowerci = round(random.random(), 3)
    prob_long_pass = round(random.random(), 3)
    prob_long_pass_upperci = round(random.random(), 3)
    prob_long_pass_lowerci = round(random.random(), 3)
    prob_left_run = round(random.random(), 3)
    prob_left_run_upperci = round(random.random(), 3)
    prob_left_run_lowerci = round(random.random(), 3)
    prob_middle_run = round(random.random(), 3)
    prob_middle_run_upperci = round(random.random(), 3)
    prob_middle_run_lowerci = round(random.random(), 3)
    prob_right_run = round(random.random(), 3)
    prob_right_run_upperci = round(random.random(), 3)
    prob_right_run_lowerci = round(random.random(), 3)

    # Build Output Dictionary
    f = {
        'prob_short_pass': prob_short_pass,
        'prob_short_pass_upperci': prob_short_pass_upperci,
        'prob_short_pass_lowerci': prob_short_pass_lowerci,
        'prob_long_pass': prob_long_pass,
        'prob_long_pass_upperci': prob_long_pass_upperci,
        'prob_long_pass_lowerci': prob_long_pass_lowerci,
        'prob_left_run': prob_left_run,
        'prob_left_run_upperci': prob_left_run_upperci,
        'prob_left_run_lowerci': prob_left_run_lowerci,
        'prob_middle_run': prob_middle_run,
        'prob_middle_run_upperci': prob_middle_run_upperci,
        'prob_middle_run_lowerci': prob_middle_run_lowerci,
        'prob_right_run': prob_right_run,
        'prob_right_run_upperci': prob_right_run_upperci,
        'prob_right_run_lowerci': prob_right_run_lowerci
    }
    # Print to Console
    for key, value in f.items():
        print(key, value)

    return json.dumps(f)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)