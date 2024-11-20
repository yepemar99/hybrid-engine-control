import paho.mqtt.client as mqtt
import time
import random
import json

def random_number_generator(min, max):
    # Generate random number
    return random.randint(min, max)

# Configuration to connect to MQTT broker
broker_address = "broker.emqx.io"
port = 1883
topic1 = "hybridenginecontrol/fueltanklevel"
topic2 = "hybridenginecontrol/batterychargelevel"
topic3 = "hybridenginecontrol/speed"
topic4 = "hybridenginecontrol/powerdemand"

# Create a client MQTT
client = mqtt.Client()

# Connect to broker
client.connect(broker_address, port=port)

# Publish data
try:
    while True:
        # Generate random data for each topicnote
        motor_temp = random_number_generator(0,55)
        battery_level = random_number_generator(0,100)
        fuel_level = random_number_generator(0,240)
        power = random_number_generator(0,300)

        # Publish motor temperature
        client.publish(topic1, json.dumps({"id":"fueltanklevel","value": motor_temp}))
        print(f"Publishing motor temperature: {motor_temp}, in topic '{topic1}'")
        time.sleep(1)# Wait for 1 second before publishing the next value

        # Publish battery charge level
        client.publish(topic2, json.dumps({"id":"batterychargelevel","value": battery_level}))
        print(f"Publishing battery charge level: {battery_level}, in topic '{topic2}'")
        time.sleep(1)# Wait for 1 second before publishing the next value

        # Publish fuel level
        client.publish(topic3, json.dumps({"id":"speed","value": fuel_level}))
        print(f"Publishing fuel level: {fuel_level}, in topic '{topic3}'")
        time.sleep(1)# Wait for 1 second before starting the next cycle

        # Publish fuel level
        client.publish(topic4, json.dumps({"id":"power","value": power}))
        print(f"Publishing fuel level: {power}, in topic '{topic4}'")
        time.sleep(1)# Wait for 1 second before starting the next cycle

except KeyboardInterrupt:
    print("Program stopped")
finally:
    client.disconnect()
