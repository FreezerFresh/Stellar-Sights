
import pandas as pd
import sqlite3
from urllib.parse import urlencode

# STEP 1: NASA Transit Service API

base_url = "https://exoplanetarchive.ipac.caltech.edu/cgi-bin/TransitSearch/nph-transits-api"

planets = [
    "HD 209458 b",
    "WASP-12 b"
]

columns = [
    "planetname",
    "midpointcalendar", 
    "midpointjd",
    "propmidpointunc",
    "refname",
    "isdefault"
]

all_transits = []

# STEP 2: Download transit predictions

for planet in planets:

    print("Downloading transit predictions for:", planet)

    url = base_url + "?" + urlencode({
        "sname": planet,
        "nextTransit": 1,
        "format": "csv"
    })

    try:
        df = pd.read_csv(url)

        df = df[columns].copy()

        df["event_type"] = "predicted"

        all_transits.append(df)

        print("Records retrieved:", len(df))

    except Exception as error:
        print("Could not retrieve data for:", planet)
        print("Error:", error)

# STEP 3: Combine predictions

if not all_transits:
    print("No transit data retrieved.")
    raise SystemExit(1)

transits = pd.concat(all_transits, ignore_index=True)

print("\nTotal transit prediction records:", len(transits))

# STEP 4: Save predictions to SQLite

connection = sqlite3.connect("data/stellar_sights.db")

transits.to_sql(
    "transit_events",
    connection,
    if_exists="replace",
    index=False
)

print("\nTransit predictions saved to SQLite!")

# STEP 5: Verify saved records

cursor = connection.cursor()

cursor.execute("""
SELECT planetname, COUNT(*)
FROM transit_events
GROUP BY planetname
""")

print("\nTransit predictions by planet:")

for row in cursor.fetchall():
    print(row)

connection.close()

print("\nTransit import complete!")
