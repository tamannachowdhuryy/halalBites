import pandas as pd
from flask import Flask, request, jsonify
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import MinMaxScaler
import joblib
import os

# Load and preprocess the dataset
data = pd.read_csv('/home/tamanna/Desktop/halalBites/Data/Test File - Sheet1.csv')

data['Boroughs'] = data['Boroughs'].str.lower()
data['Cuisine'] = data['Cuisine'].str.lower()
data['Price'] = data['Price'].fillna(0).astype(int)
data['Rating'] = data['Rating'].fillna(data['Rating'].mean())

# Train and save the recommendation model
def train_model(data):
    scaler = MinMaxScaler()
    data[['Price', 'Rating']] = scaler.fit_transform(data[['Price', 'Rating']])

    knn = NearestNeighbors(n_neighbors=5, metric='cosine')
    knn.fit(data[['Price', 'Rating']])
    joblib.dump(knn, './model/restaurant_recommender.pkl')
    return knn

# Check if the model exists, otherwise train and save it
if not os.path.exists('./model/restaurant_recommender.pkl'):
    knn = train_model(data)
else:
    knn = joblib.load('./model/restaurant_recommender.pkl')

# Flask app
app = Flask(__name__)

@app.route('/recommend', methods=['POST'])
def recommend():
    user_input = request.json

    borough = user_input.get('borough', None)
    cuisine = user_input.get('cuisine', None)
    zip_code = user_input.get('zip_code', None)
    price = user_input.get('price', None)

    filtered_data = data

    if borough:
        filtered_data = filtered_data[filtered_data['Boroughs'] == borough]

    if cuisine:
        filtered_data = filtered_data[filtered_data['Cuisine'].str.contains(cuisine)]

    if zip_code:
        filtered_data = filtered_data[filtered_data['Address'].str.contains(zip_code)]

    if price:
        filtered_data = filtered_data[filtered_data['Price'] <= price]

    recommendations = filtered_data[['Name', 'Cuisine', 'Address', 'Rating', 'Price']].head(5)
    return jsonify(recommendations.to_dict(orient='records'))

# Dynamic port for deployment
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
