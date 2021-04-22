# Basic flask application 
from flask import Flask
from flask import render_template
app=Flask(__name__)
#############################################
############    IMPORTS    ##################
from flask import Flask, request, render_template, session
import pandas as pd
import numpy as np
import warnings
from datetime import datetime
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
dt_model = joblib.load('./backend_src/notebooks/joblibs/dt.joblib')
rf_model = joblib.load('./backend_src/notebooks/joblibs/rf.joblib')
knn_model = joblib.load('./backend_src/notebooks/joblibs/knn.joblib')
logit_model = joblib.load('./backend_src/notebooks/joblibs/logit.joblib')
nn_model = joblib.load('./backend_src/notebooks/joblibs/nn.joblib')
print("Models Imported Successfully")

# Import confidence intervals
confidence_intervals = joblib.load('./backend_src/notebooks/joblibs/confidence_intervals.joblib')

# Model Dictionary
model_dict = {
    'dt_model': dt_model,
    'rf_model': rf_model,
    'knn_model': knn_model,
    'logit_model': logit_model,
    'nn_model': nn_model,
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

## Data Store
viz_data = {
            'prob_short_pass': .0,
            'prob_short_pass_upperci': .0,
            'prob_short_pass_lowerci': .0,
            'prob_long_pass': .0,
            'prob_long_pass_upperci': .0,
            'prob_long_pass_lowerci': .0,
            'prob_left_run':  .0,
            'prob_left_run_upperci': .0,
            'prob_left_run_lowerci': .0,
            'prob_middle_run': .0,
            'prob_middle_run_upperci': .0,
            'prob_middle_run_lowerci': .0,
            'prob_right_run': .0,
            'prob_right_run_upperci': .0,
            'prob_right_run_lowerci': .0
        }

#####################################
##### HOME ROUTE (Initial Route #####
@app.route('/')
def index():
        return render_template('index.html')

@app.route('/analysis', methods=['POST', 'GET'])
def generatePrediction():

    start = datetime.now()

    # Import User Request Values
    form_input_dict = request.form.to_dict()
    print("User Submitted Form: ", form_input_dict)

    # Selected Model
    selected_model = form_input_dict['selectModel']

    # Selected Team
    selected_team = form_input_dict['options']

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

    ##################
    ### Prediction ###
    pass_prediction_average = 0
    pass_lower_ci_average = 0
    pass_upper_ci_average = 0
    run_prediction_average = 0
    run_lower_ci_average = 0
    run_upper_ci_average = 0
    if selected_model == 'default':
        print("Preparing Optimized Model ... ")
        for key, model in model_dict.items():
            print("Predicting Play Type with Model: ", key)
            prediction = model.predict(x_prediction)[0]
            if key in ['dt_model', 'rf_model']:
                play = prediction
                prediction = 1*(prediction == 'run')
            else:
                prediction = int(prediction)
                if prediction:
                    play = 'run'
                else:
                    play = 'pass'
            if prediction == 0:
                pass_prediction = prediction
                pass_probability = model.predict_proba(x_prediction)[0][pass_prediction]
                pass_ci = confidence_intervals[key][play]
                pass_prediction_average += pass_probability
                pass_lower_ci_average += pass_ci[0]
                pass_upper_ci_average += pass_ci[1]
                print("Prediction for Pass: ", prediction)
                print("Probability for Pass: ", pass_probability)
                print("Confidence Interval for Pass: ", pass_ci)

                # Inverse for Run Prediction
                run_prediction_average += 1 - pass_probability
                run_lower_ci_average += 1 - pass_ci[0]
                run_upper_ci_average += 1 - pass_ci[1]

            else:
                run_prediction = prediction
                run_probability = model.predict_proba(x_prediction)[0][run_prediction]
                run_ci = confidence_intervals[key][play]
                run_prediction_average += run_probability
                run_lower_ci_average += run_ci[0]
                run_upper_ci_average += run_ci[1]
                print("Prediction for Run: ", prediction)
                print("Probability for Run: ", run_probability)
                print("Confidence Interval for Run: ", run_ci)

                # Inverse for Run Prediction
                pass_prediction_average += 1 - run_probability
                run_lower_ci_average += 1 - run_ci[0]
                run_upper_ci_average += 1 - run_ci[1]

        pass_prediction_average = pass_prediction_average/len(model_dict)
        pass_lower_ci_average = pass_lower_ci_average/len(model_dict)
        pass_upper_ci_average = pass_upper_ci_average/len(model_dict)
        run_prediction_average = run_prediction_average/len(model_dict)
        run_lower_ci_average = run_lower_ci_average/len(model_dict)
        run_upper_ci_average = run_upper_ci_average/len(model_dict)

        # Pass
        print("Optimized Final Results for Pass: ")
        print("prediction_average: ", pass_prediction_average)
        print("lower_ci_average: ", pass_lower_ci_average)
        print("upper_ci_average: ", pass_upper_ci_average)

        # Run
        print("Optimized Final Results for Run: ")
        print("prediction_average: ", run_prediction_average)
        print("lower_ci_average: ", run_lower_ci_average)
        print("upper_ci_average: ", run_upper_ci_average)

    else:
        print("User has selected model: ", selected_model)
        model = model_dict[selected_model]
        prediction = model.predict(x_prediction)[0]
        if selected_model in ['dt_model', 'rf_model']:
            play = prediction
            prediction = 1 * (prediction == 'run')
        else:
            prediction = int(prediction)
            if prediction:
                play = 'run'
            else:
                play = 'pass'
        if prediction == 0:
            pass_prediction = prediction
            pass_probability = model.predict_proba(x_prediction)[0][pass_prediction]
            pass_ci = confidence_intervals[selected_model][play]
            pass_prediction_average = pass_probability
            pass_lower_ci_average = pass_ci[0]
            pass_upper_ci_average = pass_ci[1]
            print("Prediction for Pass: ", prediction)
            print("Probability for Pass: ", pass_probability)
            print("Confidence Interval for Pass: ", pass_ci)

            # Inverse for Run Prediction
            run_prediction_average += 1 - pass_probability
            run_lower_ci_average += 1 - pass_ci[0]
            run_upper_ci_average += 1 - pass_ci[1]

        else:
            run_prediction = prediction
            run_probability = model.predict_proba(x_prediction)[0][run_prediction]
            run_ci = confidence_intervals[selected_model][play]
            run_prediction_average = run_probability
            run_lower_ci_average = run_ci[0]
            run_upper_ci_average = run_ci[1]
            print("Prediction for Run: ", prediction)
            print("Probability for Run: ", run_probability)
            print("Confidence Interval for Run: ", run_ci)

            # Inverse for Run Prediction
            pass_prediction_average += 1 - run_probability
            run_lower_ci_average += 1 - run_ci[0]
            run_upper_ci_average += 1 - run_ci[1]

        # Pass
        print("Optimized Final Results for Pass: ")
        print("prediction_average: ", pass_prediction_average)
        print("lower_ci_average: ", pass_lower_ci_average)
        print("upper_ci_average: ", pass_upper_ci_average)

        # Run
        print("Optimized Final Results for Run: ")
        print("prediction_average: ", run_prediction_average)
        print("lower_ci_average: ", run_lower_ci_average)
        print("upper_ci_average: ", run_upper_ci_average)

    # Build Output Dictionary
    print("Generating Proabilities for selected team: ", selected_team)

    if selected_team == 'nfl':
        qtr_mask = nfl_df_overall['qtr'] == quarter
        down_mask = nfl_df_overall['down'] == down
        pass_mask = nfl_df_overall['play_type'] == 'pass'
        run_mask = nfl_df_overall['play_type'] == 'run'

        # Pass Length Probability
        pass_length_numerical_mean = nfl_df_overall[qtr_mask & down_mask & pass_mask]['pass_length_numerical_mean'].values[0]
        pass_length_numerical_std = nfl_df_overall[qtr_mask & down_mask & pass_mask]['pass_length_numerical_std'].values[0]
        if pass_length_numerical_mean >= 0.5:
            long_pass_probability = pass_length_numerical_mean
            short_pass_probability = 1 - pass_length_numerical_mean
        else:
            short_pass_probability = pass_length_numerical_mean
            long_pass_probability = 1 - short_pass_probability

        # Pass Location Probability
        pass_location_numerical_mean = nfl_df_overall[qtr_mask & down_mask & pass_mask]['pass_location_numerical_mean'].values[0]
        pass_location_numerical_std = nfl_df_overall[qtr_mask & down_mask & pass_mask]['pass_location_numerical_std'].values[0]
        if pass_location_numerical_mean > 0.5:
            middle_pass_probability = pass_location_numerical_mean
            left_pass_probability = (1- pass_location_numerical_mean) / 2
            right_pass_probability = (1- pass_location_numerical_mean) / 2
        else:
            middle_pass_probability = pass_location_numerical_mean
            left_pass_probability = pass_location_numerical_std / 2
            right_pass_probability = pass_location_numerical_std / 2

        # Run Location Probability
        run_location_numerical_mean = nfl_df_overall[qtr_mask & down_mask & run_mask]['run_location_numerical_mean'].values[0]
        run_location_numerical_std = nfl_df_overall[qtr_mask & down_mask & run_mask]['run_location_numerical_std'].values[0]
        if run_location_numerical_mean > 0.5:
            middle_run_probability = run_location_numerical_mean
            left_run_probability = (1 - run_location_numerical_mean) / 2
            right_run_probability = (1 - run_location_numerical_mean) / 2
        else:
            middle_run_probability = run_location_numerical_mean
            left_run_probability = (1 - run_location_numerical_mean) / 2
            right_run_probability = (1 - run_location_numerical_mean) / 2

    else:
        pos_team_mask = nfl_df_team_view['posteam'] == str.upper(selected_team)
        qtr_mask = nfl_df_team_view['qtr'] == quarter
        down_mask = nfl_df_team_view['down'] == down
        pass_mask = nfl_df_team_view['play_type'] == 'pass'
        run_mask = nfl_df_team_view['play_type'] == 'run'

        # Pass Length Probability
        pass_length_numerical_mean = nfl_df_team_view[pos_team_mask & qtr_mask & down_mask & pass_mask]['pass_length_numerical_mean'].values[0]
        pass_length_numerical_std = nfl_df_team_view[pos_team_mask & qtr_mask & down_mask & pass_mask]['pass_length_numerical_std'].values[0]
        if pass_length_numerical_mean >= 0.5:
            long_pass_probability = pass_length_numerical_mean
            short_pass_probability = 1 - pass_length_numerical_mean
        else:
            short_pass_probability = pass_length_numerical_mean
            long_pass_probability = 1 - short_pass_probability

        # Pass Location Probability
        pass_location_numerical_mean = nfl_df_team_view[pos_team_mask & qtr_mask & down_mask & pass_mask]['pass_location_numerical_mean'].values[0]
        pass_location_numerical_std = nfl_df_team_view[pos_team_mask & qtr_mask & down_mask & pass_mask]['pass_location_numerical_std'].values[0]
        if pass_location_numerical_mean > 0.5:
            middle_pass_probability = pass_location_numerical_mean
            left_pass_probability = (1 - pass_location_numerical_mean)/2
            right_pass_probability = (1 - pass_location_numerical_mean)/2
        else:
            middle_pass_probability = pass_location_numerical_mean
            left_pass_probability = (1 - pass_location_numerical_mean)/2
            right_pass_probability = (1 - pass_location_numerical_mean)/2

        # Run Location Probability
        run_location_numerical_mean = nfl_df_team_view[pos_team_mask & qtr_mask & down_mask & run_mask]['run_location_numerical_mean'].values[0]
        run_location_numerical_std = nfl_df_team_view[pos_team_mask & qtr_mask & down_mask & run_mask]['run_location_numerical_std'].values[0]
        if run_location_numerical_mean > 0.5:
            middle_run_probability = run_location_numerical_mean
            left_run_probability = (1 - run_location_numerical_mean)/2
            right_run_probability = (1 - run_location_numerical_mean)/2
        else:
            middle_run_probability = run_location_numerical_mean
            left_run_probability = (1 - run_location_numerical_mean)/2
            right_run_probability = (1 - run_location_numerical_mean)/2

    # Integrate Model Output with Dataframe Historical Data
    print("Initalizing Output Dictionary ... ")
    f = {
        'prob_pass': pass_prediction_average,
        'prob_pass_upper_ci': pass_upper_ci_average,
        'prob_pass_lower_ci': pass_lower_ci_average,
        'prob_run': run_prediction_average,
        'prob_run_upper_ci': run_upper_ci_average,
        'prob_run_lower_ci': run_lower_ci_average,
        'prob_short_pass': short_pass_probability * pass_prediction_average,
        'prob_short_pass_upperci': short_pass_probability * pass_upper_ci_average,
        'prob_short_pass_lowerci': short_pass_probability * pass_lower_ci_average,
        'prob_long_pass': long_pass_probability * pass_prediction_average,
        'prob_long_pass_upperci': long_pass_probability * pass_upper_ci_average,
        'prob_long_pass_lowerci': long_pass_probability * pass_lower_ci_average,
        'prob_short_left_pass': short_pass_probability * left_pass_probability * pass_prediction_average,
        'prob_short_left_pass_upperci': short_pass_probability * left_pass_probability * pass_upper_ci_average,
        'prob_short_left_pass_lowerci': short_pass_probability * left_pass_probability * pass_lower_ci_average,
        'prob_short_middle_pass': short_pass_probability * middle_pass_probability * pass_prediction_average,
        'prob_short_middle_pass_upperci': short_pass_probability * middle_pass_probability * pass_upper_ci_average,
        'prob_short_middle_pass_lowerci': short_pass_probability * middle_pass_probability * pass_lower_ci_average,
        'prob_short_right_pass': short_pass_probability * right_pass_probability * pass_prediction_average,
        'prob_short_right_pass_upperci': short_pass_probability * right_pass_probability * pass_upper_ci_average,
        'prob_short_right_pass_lowerci': short_pass_probability * right_pass_probability * pass_lower_ci_average,
        'prob_long_left_pass': long_pass_probability * left_pass_probability * pass_prediction_average,
        'prob_long_left_pass_upperci': long_pass_probability * left_pass_probability * pass_upper_ci_average,
        'prob_long_left_pass_lowerci': long_pass_probability * left_pass_probability * pass_lower_ci_average,
        'prob_long_middle_pass': long_pass_probability * middle_pass_probability * pass_prediction_average,
        'prob_long_middle_pass_upperci': long_pass_probability * middle_pass_probability * pass_upper_ci_average,
        'prob_long_middle_pass_lowerci': long_pass_probability * middle_pass_probability * pass_lower_ci_average,
        'prob_long_right_pass': long_pass_probability * right_pass_probability * pass_prediction_average,
        'prob_long_right_pass_upperci': long_pass_probability * right_pass_probability * pass_upper_ci_average,
        'prob_long_right_pass_lowerci': long_pass_probability * right_pass_probability * pass_lower_ci_average,
        'prob_left_run': run_prediction_average * left_run_probability,
        'prob_left_run_upperci': run_upper_ci_average * left_run_probability,
        'prob_left_run_lowerci': run_lower_ci_average * left_run_probability,
        'prob_middle_run': run_prediction_average * middle_run_probability,
        'prob_middle_run_upperci': run_upper_ci_average * middle_pass_probability,
        'prob_middle_run_lowerci': run_lower_ci_average * middle_pass_probability,
        'prob_right_run': run_prediction_average * right_run_probability,
        'prob_right_run_upperci': run_upper_ci_average * right_run_probability,
        'prob_right_run_lowerci': run_lower_ci_average * right_run_probability,
    }

    # Print to Console
    for key, value in f.items():
        print(key, value)
    global viz_data
    viz_data = f

    # Print Calculation Time
    print("\nTime to Compute: ", datetime.now() - start)
    print("\nReturning User")
    return render_template('index.html')

@app.route('/get-data', methods=['POST', 'GET'])
def returnData():

    # Build Output Dictionary
    return json.dumps(viz_data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
