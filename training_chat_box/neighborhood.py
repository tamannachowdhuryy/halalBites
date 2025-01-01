import pandas as pd
import re

# Load and preprocess your dataset
data = pd.read_csv('/home/tamanna/Desktop/halalBites/Data/Test File - Sheet1.csv')
data['Address'] = data['Address'].fillna("").str.lower()  # Ensure Address is in lowercase

# Function to extract neighborhood from address
def extract_neighborhood(address):
    # Define a pattern to match neighborhoods (e.g., words before ", NY" or ",")
    match = re.search(r',\s*([\w\s]+?),\s*ny', address)
    if match:
        return match.group(1).strip()
    return "unknown"

# Apply the function to extract neighborhoods
data['Neighborhood'] = data['Address'].apply(extract_neighborhood)

# Check the result
print(data[['Address', 'Neighborhood']].head())

# Save the dataset with the new column
data.to_csv('/home/tamanna/Desktop/halalBites/Data/enriched_restaurants.csv', index=False)
