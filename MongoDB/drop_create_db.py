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
  }
]
roles_table.insert_many(roles)

for x in roles_table.find():
  print(x)