import pandas as pd
import json
import re

# Load JSON data
json_file = 'restrants.json'  # Replace with your JSON file path
with open(json_file, 'r') as f:
    data = json.load(f)

# If data is a dictionary with a key holding the list of interest
if 'selection1' in data:
    df = pd.json_normalize(data['selection1'])
else:
    df = pd.json_normalize(data)  # Default case if the structure is flat

# Print column names for debugging
print("Columns in DataFrame:", df.columns)

# Extract rating if 'rate' column is found
if 'rate' in df.columns:
    df['rating'] = df['rate'].str.extract(r'(\d+\.\d+)')  # Extracts the numeric part from the 'rate' field
else:
    print("Column 'rate' not found. Check the column names.")

# Modify 'type_food' to insert commas between food types
def format_type_food(type_food):
    # Use regular expression to insert commas before capital letters following lowercase letters
    if isinstance(type_food, str):
        return re.sub(r'(?<=[a-z])(?=[A-Z])', ', ', type_food)
    return type_food

df['type_food'] = df['type_food'].apply(format_type_food)

# Clean 'name' column to remove any leading/trailing whitespace
df['name'] = df['name'].str.strip()

# Remove duplicates based on 'name'
df = df.drop_duplicates(subset='name', keep='first')

# Select specific columns
columns = ['name', 'url', 'type_food', 'location', 'rating']
df = df[columns] if all(col in df.columns for col in columns) else df

# Convert to CSV
csv_file = 'data.csv'  # Replace with your desired CSV file path
df.to_csv(csv_file, index=False)
