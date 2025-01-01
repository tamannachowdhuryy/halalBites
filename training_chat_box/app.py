
from flask import Flask, request, jsonify
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for communication with the frontend

# Load restaurant data
data = pd.read_csv('/home/tamanna/Desktop/halalBites/Data/enriched_restaurants.csv')
data['Boroughs'] = data['Boroughs'].str.lower()
data['Cuisine'] = data['Cuisine'].fillna("").str.lower()  # Replace NaN with an empty string and convert to lowercase
data['Price'] = data['Price'].fillna(0).astype(int)
data['Rating'] = data['Rating'].fillna(data['Rating'].mean())
data['Address'] = data['Address'].fillna("")  # Replace NaN with an empty string for addresses

# Load emotion-food mapping
emotion_food_mapping = pd.read_csv('/home/tamanna/Desktop/halalBites/Data/emotion_food_mapping.csv')

@app.route('/')
def index():
    return "Welcome to the Restaurant Chatbot API. Use /recommend to chat about restaurants."

@app.route('/recommend', methods=['POST'])
def recommend():
    user_input = request.json

    mood = user_input.get('mood', "").lower()
    craving = user_input.get('craving', "").lower()
    borough = user_input.get('borough', "").lower()
    price = user_input.get('price', None)

    # Find suggested foods for the mood
    suggested_foods = emotion_food_mapping[emotion_food_mapping['Emotion Cluster'] == mood]['Food'].tolist()

    filtered_data = data

    # Filter by suggested foods (if available)
    if suggested_foods:
        filtered_data = filtered_data[filtered_data['Cuisine'].str.contains("|".join(suggested_foods), na=False)]

    # Filter by borough (case-insensitive)
    if borough:
        filtered_data = filtered_data[filtered_data['Address'].str.contains(borough, case=False, na=False)]

    # Filter by price
    if price:
        filtered_data = filtered_data[filtered_data['Price'] <= price]

    recommendations = filtered_data[['Name', 'Cuisine', 'Address', 'Rating', 'Price']].head(5)

    if recommendations.empty:
        return jsonify({
            "response": [],
            "message": "Sorry, no matching restaurants were found. Try refining your search."
        })

    response = [
        f"We recommend: {row['Name']} ({row['Cuisine']}) at {row['Address']} - Rating: {row['Rating']} ⭐."
        for _, row in recommendations.iterrows()
    ]

    return jsonify({"response": response, "message": "Here are some recommendations."})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
