import pandas as pd

# Load the uploaded CSV file
file_path = 'Data/data.csv'
data = pd.read_csv(file_path)

# Inspect the first few rows of the dataset to understand its structure
data.head()
