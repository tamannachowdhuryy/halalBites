import requests
from bs4 import BeautifulSoup
import pandas as pd

# Load the CSV file
df = pd.read_csv('data.csv')

# Function to extract address
def get_address(yelp_url):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"}
    try:
        response = requests.get(yelp_url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        address = soup.find('address').get_text(separator=", ").strip()
        return address
    except Exception as e:
        return None

# Apply the function to each URL in the DataFrame
df['location'] = df['url'].apply(lambda x: get_address(x))

# Save the updated DataFrame to a new CSV file
df.to_csv('updated_restaurants.csv', index=False)
