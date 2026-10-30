
import sqlite3

connection = sqlite3.connect("data/stellar_sights.db")

cursor = connection.cursor()

# Retrieve all planet names from our catalog
cursor.execute("""
SELECT pl_name
FROM exoplanets
ORDER BY pl_name
""")

planets = cursor.fetchall() #stores the results

print("Exoplanets in our catalog:\n")

for planet in planets:
    print(planet[0])

print("\nTotal planets:", len(planets))

connection.close()
