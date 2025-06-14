from datetime import datetime
import pymongo

myclient = pymongo.MongoClient('mongodb://localhost:27017/')
mydb = myclient['ml_heroes']

# drop db
myclient.drop_database(mydb)

# create roles table and insert records
roles_table = mydb["roles"]
roles = [
  { 
    "role": "Tank", 
    "logo_url": "https://static.wikia.nocookie.net/mobile-legends/images/f/f0/Tank_Icon.png",
    "primary_function": "Protect teammates, soak damage, and initiate team fights.",
    "key_attributes": "High health, defense, and crowd control."
  },
  { 
    "role": "Fighter", 
    "logo_url": "https://static.wikia.nocookie.net/mobile-legends/images/1/1a/Fighter_Icon.png",
    "primary_function": "Balance damage and durability, capable of engaging in fights and soaking damage.",
    "key_attributes": "Balanced stats, good damage output, and decent survivability."
  },
  { 
    "role": "Assassin", 
    "logo_url": "https://static.wikia.nocookie.net/mobile-legends/images/3/3f/Assassin_Icon.png",
    "primary_function": "Quickly eliminate enemy heroes in team fights.",
    "key_attributes": "High burst damage, mobility, and stealth."
  },
  { 
    "role": "Mage", 
    "logo_url": "https://static.wikia.nocookie.net/mobile-legends/images/5/53/Mage_Icon.png",
    "primary_function": "Deal high magic damage, often with range and crowd control.",
    "key_attributes": "High magic power, magical damage, and often crowd control."
  },
  { 
    "role": "Marksman", 
    "logo_url": "https://static.wikia.nocookie.net/mobile-legends/images/1/10/Marksman_Icon.png",
    "primary_function": "Deal high physical damage, primarily from a distance.",
    "key_attributes": "High attack speed, physical damage, and ranged attack."
  },
]
roles_table.insert_many(roles)

for x in roles_table.find():
  print(x)