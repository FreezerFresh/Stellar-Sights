
import sqlite3

# Connect to the SQLite database
connection = sqlite3.connect("data/stellar_sights.db")

cursor = connection.cursor()

# Planet that exists in our catalog
# but has no imported transit predictions
planet_name = "55 Cnc e"

# Check whether the planet exists
cursor.execute("""
SELECT COUNT(*)
FROM exoplanets
WHERE pl_name = ?
""", (planet_name,))

planet_count = cursor.fetchone()[0]

# Check for imported transit predictions
cursor.execute("""
SELECT COUNT(*)
FROM transit_events
WHERE planetname = ?
""", (planet_name,))

transit_count = cursor.fetchone()[0]

print("Planet:", planet_name)
print("Planet records found:", planet_count)
print("Transit predictions found:", transit_count)

# Verify the expected edge case
if planet_count == 1 and transit_count == 0:
    print("EDGE CASE TEST: PASS")
else:
    print("EDGE CASE TEST: FAIL")

connection.close()
