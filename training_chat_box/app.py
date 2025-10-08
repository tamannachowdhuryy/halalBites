from flask import Flask, request, jsonify
import pandas as pd
from flask_cors import CORS
from fuzzywuzzy import process

app = Flask(__name__)
CORS(app)  # Enable CORS for communication with the frontend

# Load restaurant data
data = pd.read_csv('../Data/neb.csv')
data['Boroughs'] = data['Boroughs'].str.lower()
data['Neighborhood'] = data['Neighborhood'].fillna("").str.lower()  # Ensure Neighborhood column exists
data['Cuisine'] = data['Cuisine'].fillna("").str.lower()
data['Price'] = data['Price'].fillna(0).astype(int)
data['Rating'] = data['Rating'].fillna(data['Rating'].mean())
data['Address'] = data['Address'].fillna("")  # Replace NaN with an empty string for addresses

# Load emotion-food mapping
emotion_food_mapping = pd.read_csv('../Data/emotion_food_mapping.csv')


def match_cuisine(cuisine_list, suggested_foods):
    """Match cuisines based on suggested foods using fuzzy matching."""
    matched_cuisines = []
    for food in suggested_foods:
        matches = [cuisine for cuisine, score in process.extract(food, cuisine_list, limit=5) if score > 70]
        matched_cuisines.extend(matches)
    return matched_cuisines

@app.route('/')
def index():
    return "Welcome to the Restaurant Chatbot API. Use /recommend to chat about restaurants."

@app.route('/recommend', methods=['POST'])
def recommend():
    user_input = request.json

    # Extract and normalize user inputs
    mood = user_input.get('mood', "").lower().strip()
    craving = user_input.get('craving', "").lower().strip()
    location = user_input.get('neighborhood', "").lower().strip()

    # Split location into borough and neighborhood if applicable
    borough, neighborhood = "", ""
    if "," in location:
        parts = [part.strip() for part in location.split(",")]
        borough = parts[0]
        if len(parts) > 1:
            neighborhood = parts[1]
    else:
        borough = location

    price = user_input.get('price', None)

    print(f"User Input -> Mood: {mood}, Craving: {craving}, Borough: {borough}, Neighborhood: {neighborhood}, Price: {price}")

    filtered_data = data.copy()
    print(f"Initial Dataset Size: {len(filtered_data)}")

    # Ensure borough is provided
    if not borough:
        return jsonify({
            "response": [],
            "message": "Please specify a borough for recommendations."
        })

    # Filter by borough
    filtered_data = filtered_data[filtered_data['Boroughs'].str.contains(borough, case=False, na=False)]
    print(f"Dataset After Borough Filter: {len(filtered_data)}")

    # Filter by neighborhood (optional)
    if neighborhood:
        filtered_data = filtered_data[filtered_data['Neighborhood'].str.contains(neighborhood, case=False, na=False)]
        print(f"Dataset After Neighborhood Filter: {len(filtered_data)}")

    # Filter by mood (suggested foods)
    if mood:
        suggested_foods = emotion_food_mapping[emotion_food_mapping['Emotion Cluster'] == mood]['Food'].tolist()
        print(f"Suggested Foods: {suggested_foods}")
        if suggested_foods:
            unique_cuisines = data['Cuisine'].unique()
            matched_cuisines = match_cuisine(unique_cuisines, suggested_foods)
            print(f"Matched Cuisines: {matched_cuisines}")
            if matched_cuisines:
                filtered_data = filtered_data[filtered_data['Cuisine'].isin(matched_cuisines)]
                print(f"Dataset After Mood Filter: {len(filtered_data)}")

    # Filter by craving (cuisine)
    # Filter by cuisine
    cuisine = user_input.get('cuisine', "").lower().strip()
    if cuisine:
        filtered_data = filtered_data[filtered_data['Cuisine'].str.contains(cuisine, case=False, na=False)]
        print(f"Dataset After Cuisine Filter: {len(filtered_data)}")


    # Filter by price
    if price:
        try:
            price = int(price)
            filtered_data = filtered_data[filtered_data['Price'] <= price]
            print(f"Dataset After Price Filter: {len(filtered_data)}")
        except ValueError:
            return jsonify({"response": [], "message": "Invalid price range provided. Please try again."})

    # Sort and limit to top 5
    filtered_data = filtered_data.sort_values(by=['Rating', 'Price'], ascending=[False, True])
    print(f"Final Filtered Dataset: {filtered_data[['Name', 'Cuisine', 'Boroughs', 'Neighborhood', 'Price', 'Rating']]}")

    recommendations = filtered_data[['Name', 'Cuisine', 'Address', 'Rating', 'Price']].head(5)

    if recommendations.empty:
        return jsonify({
            "response": [],
            "message": f"Sorry, no matching restaurants were found in {borough}. Try refining your search."
        })

    response = [
        f"We recommend: {row['Name']} ({row['Cuisine']}) at {row['Address']} - Rating: {row['Rating']} ⭐."
        for _, row in recommendations.iterrows()
    ]

    return jsonify({"response": response, "message": "Here are some recommendations."})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)