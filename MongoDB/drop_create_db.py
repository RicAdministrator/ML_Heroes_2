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

# for role in roles_table.find():
#   print(role)
#   print("\n")
  
# create heroes table and insert records
heroes_table = mydb["heroes"]
heroes = [
  { 
    "name": "Gloo", 
    "image_url": "https://akmweb.youngjoygame.com/web/svnres/img/mlbb/homepage_1_9_642/100_8b401d50920f2359060a9c7a3c833df1.png",
    "description": "A mysterious creature that can split into many smaller ones."
  },
  { 
    "name": "Lukas", 
    "image_url": "https://akmweb.youngjoygame.com/web/svnres/img/mlbb/homepage_1_9_20/100_454c13b2de7b7d1a20fbf553c620510d.png",
    "description": "A legendary Sacred Beast that can take the form of a ranbunctious young man."
  },
  { 
    "name": "Nolan", 
    "image_url": "https://akmweb.youngjoygame.com/web/svnres/img/mlbb/homepage/100_0495066df0d828c149e7fe89aa63078b.png",
    "description": "A scholar that wanders the universe with split souls to save his daughter."
  },
  { 
    "name": "Zhuxin", 
    "image_url": "https://akmweb.youngjoygame.com/web/svnres/img/mlbb/homepage_92/100_13cfeec4bec7a27a09677e519f1ef9d2.png",
    "description": "A mysterious young woman who guides the ember butterflies using her Lantern ..."
  },
  { 
    "name": "Hanabi", 
    "image_url": "https://akmweb.youngjoygame.com/web/svnres/img/mlbb/homepage/100_85d213390613bbc09220cf1d9f64c5c0.png",
    "description": "Leader of the Scarlet Sect, in the Scarlet Shadow of the Cadia Riverlands."
  },
  { 
    "name": "Lesley", 
    "image_url": "https://akmweb.youngjoygame.com/web/svnres/img/mlbb/homepage/100_f4f42410c90f84e4d46b129d5e8887e8.png",
    "description": "Adopted daughter of House Vance, a clandestine sniper."
  },
]
heroes_table.insert_many(heroes)  

# for hero in heroes_table.find():
#   print(hero)
#   print("\n")

# create hero_roles table and insert records
tankId = roles_table.find_one({"role": "Tank"})["_id"]
fighterId = roles_table.find_one({"role": "Fighter"})["_id"]
assassinId = roles_table.find_one({"role": "Assassin"})["_id"]
mageId = roles_table.find_one({"role": "Mage"})["_id"]
marksmanId = roles_table.find_one({"role": "Marksman"})["_id"]

glooId = heroes_table.find_one({"name": "Gloo"})["_id"]
lukasId = heroes_table.find_one({"name": "Lukas"})["_id"]
nolanId = heroes_table.find_one({"name": "Nolan"})["_id"]
zhuxinId = heroes_table.find_one({"name": "Zhuxin"})["_id"]
hanabiId = heroes_table.find_one({"name": "Hanabi"})["_id"]
lesleyId = heroes_table.find_one({"name": "Lesley"})["_id"]

hero_roles_table = mydb["hero_roles"]
hero_roles = [
  { 
    "hero_id": glooId, 
    "role_id": tankId
  },  
  { 
    "hero_id": lukasId, 
    "role_id": fighterId
  },
  { 
    "hero_id": nolanId, 
    "role_id": assassinId
  },
  { 
    "hero_id": zhuxinId, 
    "role_id": mageId
  },
  { 
    "hero_id": hanabiId, 
    "role_id": marksmanId
  },
  { 
    "hero_id": lesleyId, 
    "role_id": assassinId
  },
  { 
    "hero_id": lesleyId, 
    "role_id": marksmanId
  },
]
hero_roles_table.insert_many(hero_roles)  

for hero_role in hero_roles_table.find():
  print(hero_role)
  print("\n")