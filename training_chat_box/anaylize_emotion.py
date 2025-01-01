import pandas as pd
from collections import Counter

# Load the dataset
file_path = '/home/tamanna/Desktop/halalBites/Data/cleaned_comfort_food.csv'  # Adjust path as needed
data = pd.read_csv(file_path)

# Preprocess the data
data['comfort_food'] = data['comfort_food'].fillna("").str.lower().str.strip()
data['comfort_food_reasons'] = data['comfort_food_reasons'].fillna("").str.lower().str.strip()

# Replace spaces with commas in the 'comfort_food' column
data['comfort_food'] = data['comfort_food'].str.replace(r'\s+', ',', regex=True)

# Define emotion clusters
emotion_clusters = {
    "boredom": ["boredom", "bored"],
    "sadness": ["sadness", "sad"],
    "stress": ["stress", "stressed"],
    "comfort": ["comfort", "happiness", "joy"],
    "anger": ["anger", "frustration"],
    "hunger": ["hunger", "hungry"],
}

# Reverse map for quick lookup
emotion_reverse_map = {}
for cluster, emotions in emotion_clusters.items():
    for emotion in emotions:
        emotion_reverse_map[emotion] = cluster

# Map reasons to clusters and comfort foods
cluster_food_mapping = {}

for _, row in data.iterrows():
    foods = row['comfort_food'].split(",")  # Split foods by commas
    reasons = row['comfort_food_reasons'].split()  # Split reasons into words
    
    for reason in reasons:
        cluster = emotion_reverse_map.get(reason)
        if cluster:
            if cluster not in cluster_food_mapping:
                cluster_food_mapping[cluster] = Counter(foods)
            else:
                cluster_food_mapping[cluster].update(foods)

# Output the top foods for each emotion cluster
for cluster, foods in cluster_food_mapping.items():
    print(f"\nTop foods for emotion cluster '{cluster}':")
    for food, count in foods.most_common(5):  # Top 5 foods for each cluster
        print(f"  {food}: {count}")

# Save the results to a CSV
output_path = '/home/tamanna/Desktop/halalBites/Data/emotion_food_mapping.csv'
pd.DataFrame([
    {"Emotion Cluster": cluster, "Food": food, "Count": count}
    for cluster, foods in cluster_food_mapping.items()
    for food, count in foods.items()
]).to_csv(output_path, index=False)

print(f"\nMapping saved to {output_path}")


