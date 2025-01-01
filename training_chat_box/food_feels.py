import os
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib

# Load the dataset
file_path = '/home/tamanna/Desktop/halalBites/Data/cleaned_comfort_food.csv'  # Replace with the actual cleaned file path
data = pd.read_csv(file_path)

# Inspect the dataset
print("Dataset Info:")
print(data.info())

# Ensure the dataset has no missing values
data = data.dropna(subset=['comfort_food', 'comfort_food_reasons', 'comfort_food_category'])

# Prepare data for training
X = data['comfort_food_reasons']  # Features (comfort food reasons)
y = data['comfort_food_category']  # Labels (categories)

# Vectorize text data
vectorizer = TfidfVectorizer(stop_words='english')
X_vectorized = vectorizer.fit_transform(X)

# Split the dataset into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X_vectorized, y, test_size=0.2, random_state=42)

# Train a machine learning model
model = RandomForestClassifier(random_state=42)
model.fit(X_train, y_train)

# Evaluate the model
y_pred = model.predict(X_test)
print("Classification Report:")
print(classification_report(y_test, y_pred))
print("Accuracy:", accuracy_score(y_test, y_pred))

# Define paths for saving the model and vectorizer
model_dir = '/home/tamanna/Desktop/halalBites/model'
model_path = os.path.join(model_dir, 'comfort_food_model.pkl')
vectorizer_path = os.path.join(model_dir, 'comfort_food_vectorizer.pkl')

# Create the directory if it doesn't exist
os.makedirs(model_dir, exist_ok=True)

# Save the trained model and vectorizer
joblib.dump(model, model_path)
joblib.dump(vectorizer, vectorizer_path)

print(f"Model saved to {model_path}")
print(f"Vectorizer saved to {vectorizer_path}")

