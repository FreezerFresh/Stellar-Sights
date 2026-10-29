
import pandas as pd
import sqlite3
from urllib.parse import urlencode

# -------------------------------------------------
# STEP 1: Connect to NASA Exoplanet Archive
# -------------------------------------------------

# NASA Exoplanet Archive API
base_url = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync"

# Request 20 confirmed transiting exoplanets
query = """
SELECT TOP 20
    pl_name,
    hostname,
    ra,
    dec,
    pl_orbper
FROM pscomppars
WHERE tran_flag = 1
AND pl_name != 'HD 209458 b'
ORDER BY pl_name
"""

# Build the API request URL
url = base_url + "?" + urlencode({
    "query": query,
    "format": "csv"
})


# -------------------------------------------------
# STEP 2: Import the data using Pandas
# -------------------------------------------------

# Download NASA data into a Pandas DataFrame
df = pd.read_csv(url)

# Request HD 209458 b so transit predictions
# can be linked to an exoplanet in our catalog
extra_query = """
SELECT
    pl_name,
    hostname,
    ra,
    dec,
    pl_orbper
FROM pscomppars
WHERE pl_name = 'HD 209458 b'
"""

extra_url = base_url + "?" + urlencode({
    "query": extra_query,
    "format": "csv"
})

extra_df = pd.read_csv(extra_url)

# Add the planet to our existing catalog
df = pd.concat([df, extra_df], ignore_index=True)

# Remove duplicate planet names, if any
df = df.drop_duplicates(subset=["pl_name"])


# Display the first five exoplanets
print("First five imported exoplanets:")
print(df.head())


# -------------------------------------------------
# STEP 3: Save the data as a CSV file
# -------------------------------------------------

# Save the imported exoplanet data
df.to_csv("data/exoplanets.csv", index=False)

print("\nExoplanet data saved successfully!")
print("Total exoplanets imported:", len(df))


# -------------------------------------------------
# STEP 4: Create the SQLite database
# -------------------------------------------------

# Connect to the SQLite database
connection = sqlite3.connect("data/stellar_sights.db")

# Import the exoplanet data into a SQL table
df.to_sql(
    "exoplanets",
    connection,
    if_exists="replace",
    index=False
)

# Close the database connection
connection.close()

print("\nSQLite database created successfully!")


# -------------------------------------------------
# STEP 5: Verify the SQLite database
# -------------------------------------------------

# Reopen the database
connection = sqlite3.connect("data/stellar_sights.db")

# Create a cursor for SQL queries
cursor = connection.cursor()

# Count the number of exoplanets
cursor.execute("SELECT COUNT(*) FROM exoplanets")

total = cursor.fetchone()[0]

print("\nTotal exoplanets in SQLite database:", total)

# Retrieve the first five exoplanets
cursor.execute("SELECT * FROM exoplanets LIMIT 5")

print("\nFirst five exoplanets stored in SQLite:")

for planet in cursor.fetchall():
    print(planet)

# Close the database connection
connection.close()

print("\nDatabase verification complete!")
