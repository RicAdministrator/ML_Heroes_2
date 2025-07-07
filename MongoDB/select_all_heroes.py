import pymongo

myclient = pymongo.MongoClient("mongodb://localhost:27017/")
mydb = myclient["ml_heroes"]
mycol = mydb["heroes"]

for x in mycol.find():
  print(x)