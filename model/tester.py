import joblib

# Paths to the saved files
model_path = '/home/tamanna/Desktop/halalBites/model/comfort_food_model.pkl'
vectorizer_path = '/home/tamanna/Desktop/halalBites/model/comfort_food_vectorizer.pkl'

# Load the model and vectorizer
model = joblib.load(model_path)
vectorizer = joblib.load(vectorizer_path)

# Inspect the loaded model and vectorizer
print("Model:", model)
print("Vectorizer:", vectorizer)

# Test the model with some sample input
sample_reason = ["I'm feeling sad and need something comforting."]
sample_vectorized = vectorizer.transform(sample_reason)
predicted_category = model.predict(sample_vectorized)
print("Predicted Food Category:", predicted_category[0])
