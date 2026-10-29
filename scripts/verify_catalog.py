
import sqlite3

# Connect to the existing SQLite database
connection = sqlite3.connect("data/stellar_sights.db")

cursor = connection.cursor()

# Match exoplanets with their transit predictions
cursor.execute("""
SELECT
    exoplanets.pl_name,
    exoplanets.hostname,
    transit_events.midpointcalendar,
    transit_events.event_type
FROM exoplanets
INNER JOIN transit_events
    ON exoplanets.pl_name = transit_events.planetname
""")

# Retrieve matching records
results = cursor.fetchall()

print("Matching exoplanets and transit predictions:\n")

for row in results:
    print(row)

print("\nTotal matching records:", len(results))

# Close the database
connection.close()
