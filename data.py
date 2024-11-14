import random
import json

# Define nodes with AQI values
def generate_nodes():
    nodes = []
    for i in range(10):  # Adjust the number of nodes as required
        node = {
            "id": i,
            "lat": 17.4 + random.uniform(-0.1, 0.1),
            "lon": 78.4 + random.uniform(-0.1, 0.1),
            "aqi": random.randint(50, 150)  # AQI values range from 50 to 150
        }
        nodes.append(node)
    return nodes

nodes = generate_nodes()
with open("nodes.json", "w") as f:
    json.dump(nodes, f, indent=4)
