import requests
from bs4 import BeautifulSoup
import csv

# URL of the Yelp search results page
url = 'https://www.yelp.com/search?find_desc=Halal+Restaurant&find_loc=New+York%2C+NY'

# Send a GET request to the URL
response = requests.get(url)
soup = BeautifulSoup(response.text, 'html.parser')

# Print part of the HTML to debug (remove or comment out after you identify the correct selectors)
print(soup.prettify()[:2000])  # Print first 2000 characters for inspection

# Find restaurant names and reviews (update selectors as needed)
# Example class names; these should be updated based on actual inspection
restaurants = soup.find_all('a', class_='css-1fdy54q')  # Update with correct class
reviews = soup.find_all('span', class_='css-1e4fdj9')  # Update with correct class

# Open a CSV file for writing
with open('yelp_restaurants.csv', 'w', newline='', encoding='utf-8') as csvfile:
    # Create a CSV writer object
    csvwriter = csv.writer(csvfile)
    
    # Write the header row
    csvwriter.writerow(['Restaurant Name', 'Review'])
    
    # Write data rows
    for restaurant, review in zip(restaurants, reviews):
        name = restaurant.get_text(strip=True)
        review_text = review.get_text(strip=True)
        csvwriter.writerow([name, review_text])

print("Data has been written to yelp_restaurants.csv")
