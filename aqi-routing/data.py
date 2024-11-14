import psycopg2
import random
from datetime import datetime, timedelta
import time
from concurrent.futures import ThreadPoolExecutor

# Define connection parameters
def get_db_connection():
    return psycopg2.connect(
        dbname="report",
        user="postgres",
        password="1234",
        host="localhost",
        port="5432"
    )

# Define the locations and coordinates
locations = [
    (1, 'Main Gate', '(17.445888725925958, 78.351330682387484)'),
    (2, 'OBH', '(17.44545087758107, 78.346282125368759)'),
    (3, 'Nilgiri', '(17.447418, 78.348986)'),
    (4, 'Vindhya', '(17.445351, 78.348644)'),
    (5, 'Vindhya A4', '(17.44554886380476, 78.349582159474)'),
    (6, 'football', '(17.446335, 78.348970)'),
]

# Define random value ranges for CO2, temp, and humidity
co2_range = (300, 1000)  # Random CO2 values (in ppm)
temp_range = (20, 35)  # Random temperature values (in Celsius)
humidity_range = (30, 90)  # Random humidity values (in %)

# Function to adjust timestamp to IST (-5:30)
def get_ist_timestamp():
    utc_now = datetime.utcnow()  # Get UTC time
    ist_now = utc_now + timedelta(hours=5, minutes=30)  # Add 5 hours 30 minutes for IST
    return ist_now.strftime('%Y-%m-%d %H:%M:%S.%f')  # Return full date and time with microseconds

# Prepare the batch insert query
insert_query = """
INSERT INTO air_data (id, location, coordinates, aqi, co2, temp, humidity, timestamp)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
"""

# Prepare data for batch insertion
def prepare_data():
    data_to_insert = []
    for location in locations:
        id, location_name, coordinates = location

        # Generate random values
        aqi = random.randint(0, 500)  # Random AQI value between 0 and 500
        co2 = random.randint(*co2_range)  # Random CO2 value between 300 and 1000 ppm
        temp = random.randint(*temp_range)  # Random temperature value between 20 and 35°C
        humidity = random.randint(*humidity_range)  # Random humidity value between 30% and 90%
        timestamp = get_ist_timestamp()  # Get current timestamp in IST

        # Add the record to the data list for batch insert
        data_to_insert.append((id, location_name, coordinates, aqi, co2, temp, humidity, timestamp))
    return data_to_insert

# Insert the data into the database
def insert_data(data_to_insert):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.executemany(insert_query, data_to_insert)
    conn.commit()
    print("Batch data inserted successfully.")
    cur.close()
    conn.close()

# Main function to run the async process
def main():
    while True:  # Keep the program running continuously
        # Prepare the data for insertion
        data_to_insert = prepare_data()

        # Create a thread pool to execute the insert task asynchronously
        with ThreadPoolExecutor() as executor:
            executor.submit(insert_data, data_to_insert)
        
        # Sleep for 20 seconds before running the next insertion
        time.sleep(20)

if __name__ == '__main__':
    main()
