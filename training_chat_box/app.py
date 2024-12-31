from flask import Flask, request, jsonify
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for communication with the frontend

# Load and preprocess your dataset
data = pd.read_csv('/home/tamanna/Desktop/halalBites/Data/Test File - Sheet1.csv')
data['Boroughs'] = data['Boroughs'].str.lower()
data['Cuisine'] = data['Cuisine'].fillna("").str.lower()  # Replace NaN with an empty string and convert to lowercase
data['Price'] = data['Price'].fillna(0).astype(int)
data['Rating'] = data['Rating'].fillna(data['Rating'].mean())
data['Address'] = data['Address'].fillna("")  # Replace NaN with an empty string for addresses


@app.route('/')
def index():
    return "Welcome to the Restaurant Chatbot API. Use /recommend to chat about restaurants."


@app.route('/recommend', methods=['POST'])
def recommend():
    user_input = request.json

    mood = user_input.get('mood', "").lower()
    craving = user_input.get('craving', "").lower()
    borough = user_input.get('borough', None)
    zip_code = user_input.get('zip_code', None)
    price = user_input.get('price', None)

    filtered_data = data

    # Apply filters
    if craving:
        filtered_data = filtered_data[filtered_data['Cuisine'].str.contains(craving, na=False)]

    if borough:
        filtered_data = filtered_data[filtered_data['Boroughs'] == borough]

    if zip_code:
        filtered_data = filtered_data[filtered_data['Address'].str.contains(zip_code, na=False)]

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

