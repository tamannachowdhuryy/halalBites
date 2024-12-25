import pandas as pd
import json

# Load the CSV file
df = pd.read_csv('updated_restaurants.csv')

# Define a function to categorize by borough
def get_borough(location):
    if pd.isna(location):
        return 'Unknown'
    location = location.lower()
    if 'manhattan' in location or 'new york' in location:
        return 'Manhattan'
    elif 'brooklyn' in location:
        return 'Brooklyn'
    elif 'queens' in location:
        return 'Queens'
    elif 'bronx' in location:
        return 'Bronx'
    elif 'staten island' in location:
        return 'Staten Island'
    else:
        return 'Unknown'

# Apply the function to the 'location' column
df['borough'] = df['location'].apply(get_borough)

# Convert DataFrame to JSON
data_json = df.to_dict(orient='records')

# Save JSON data to a file
with open('categorized_by_borough.json', 'w') as f:
    json.dump(data_json, f, indent=4)

print("JSON file categorized by borough has been created.")
