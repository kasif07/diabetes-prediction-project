from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import joblib
import pandas as pd
import os


app = Flask(__name__)
CORS(app)  # ✅ Enable CORS

# Load ML model
loaded_pipeline = joblib.load('diabetes_pipeline.joblib')

@app.route('/')
def home():
    return jsonify({"message": "Diabetes Prediction API is running"})

@app.route("/form")
def form():
    return render_template("index.html")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        input_df = pd.DataFrame([data])

        prediction = loaded_pipeline.predict(input_df)
        probability = loaded_pipeline.predict_proba(input_df)[0]

        return jsonify({
            "prediction_class": int(prediction[0]),
            "prediction_label": "Diabetic" if prediction[0] == 1 else "Non-Diabetic",
            "confidence": {
                "Non-Diabetic": float(probability[0]),
                "Diabetic": float(probability[1])
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)