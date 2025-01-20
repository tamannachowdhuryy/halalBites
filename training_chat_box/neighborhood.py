import pandas as pd
import re

# Load and preprocess your dataset
data = pd.read_csv('/home/tamanna/Desktop/halalBites/Data/Full_version_Restrants - parsed_restaurants.csv')
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

# Function to format strings in proper case, ensuring NY is capitalized
def format_proper_case(text):
    # Title-case the entire text
    formatted_text = text.title()
    # Correct specific abbreviations like "NY" to uppercase
    formatted_text = re.sub(r'\bNy\b', 'NY', formatted_text)
    return formatted_text

# Apply the proper case formatting to both Address and Neighborhood
data['Address'] = data['Address'].apply(format_proper_case)
data['Neighborhood'] = data['Neighborhood'].apply(lambda x: x.title() if x != "unknown" else x)

# Check the result
print(data[['Address', 'Neighborhood']].head())

# Save the dataset with the new column
data.to_csv('/home/tamanna/Desktop/halalBites/Data/neb.csv', index=False)


