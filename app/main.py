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
        
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)