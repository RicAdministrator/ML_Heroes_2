import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { MongoClient, ObjectId } from 'mongodb';

// types
import { typeDefs } from './schema.js';

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

const resolvers = {
    Query: {
        async roles() {
            try {
                await client.connect();
                const db = client.db('ml_heroes');
                const roles = await db.collection('roles').find().toArray();
                return roles;
            } finally {
                await client.close();
            }
        },
        async heroRoles() {
            try {
                await client.connect();
                const db = client.db('ml_heroes');
                const hero_roles = await db.collection('hero_roles').find().toArray();
                return hero_roles;
            } finally {
                await client.close();
            }
        },
        async heroRolesByHeroId(_, args) {
            try {
                await client.connect();
                const db = client.db('ml_heroes');
                const hero_roles = await db.collection('hero_roles').find({
                    hero_id: new ObjectId(args.heroId)
                }).toArray();
                return hero_roles;
            } finally {
                await client.close();
            }
        },
        async heroRolesByRoleId(_, args) {
            try {
                await client.connect();
                const db = client.db('ml_heroes');
                const hero_roles = await db.collection('hero_roles').find({
                    role_id: new ObjectId(args.roleId)
                }).toArray();
                return hero_roles;
            } finally {
                await client.close();
            }
        },
        async heroes() {
            try {
                await client.connect();
                const db = client.db('ml_heroes');
                const heroes = await db.collection('heroes').find().toArray();
                return heroes;
            } finally {
                await client.close();
            }
        },
    },
    Hero: {
        hero_roles: async (parent) => {
            await client.connect();
            const db = client.db('ml_heroes');
            return db.collection('hero_roles').find({ hero_id: parent._id }).toArray();
        }
    },
    HeroRole: {
        role: async (parent) => {
            await client.connect();
            const db = client.db('ml_heroes');
            return db.collection('roles').findOne({ _id: parent.role_id });
        }
    },
    Mutation: {
        addRole: async (_, args) => {
            try {
                await client.connect();
                const db = client.db('ml_heroes');

                const newRole = {
                    ...args.role,
                    _id: new ObjectId()
                };
                await db.collection('roles').insertOne(newRole);
                return newRole;
            } finally {
                await client.close();
            }
        },
        deleteRole: async (_, args) => {
            try {
                await client.connect();
                const db = client.db('ml_heroes');

                const result = await db.collection('roles').deleteOne({ _id: new ObjectId(args._id) });
                console.log('Deleted count:', result.deletedCount);
            } finally {
                await client.close();
            }
        },
        updateRole: async (_, args) => {
            try {
                await client.connect();
                const db = client.db('ml_heroes');

                const updatedRole = {
                    ...args.edits,
                    _id: new ObjectId(args._id)
                };
                await db.collection('roles').updateOne(
                    { _id: new ObjectId(args._id) },
                    { $set: updatedRole }
                );
                return updatedRole;
            } finally {
                await client.close();
            }
        },
        addHero: async (_, args) => {
            try {
                await client.connect();
                const db = client.db('ml_heroes');

                const newHero = {
                    ...args.hero,
                    _id: new ObjectId()
                };
                await db.collection('heroes').insertOne(newHero);
                return newHero;
            } finally {
                await client.close();
            }
        },
        deleteHero: async (_, args) => {
            try {
                await client.connect();
                const db = client.db('ml_heroes');

                const result = await db.collection('heroes').deleteOne({ _id: new ObjectId(args._id) });
                console.log('Deleted count:', result.deletedCount);
            } finally {
                await client.close();
            }
        },
        updateHero: async (_, args) => {
            try {
                await client.connect();
                const db = client.db('ml_heroes');

                const updatedHero = {
                    ...args.edits,
                    _id: new ObjectId(args._id)
                };
                await db.collection('heroes').updateOne(
                    { _id: new ObjectId(args._id) },
                    { $set: updatedHero }
                );
                return updatedHero;
            } finally {
                await client.close();
            }
        },
        addHeroRole: async (_, args) => {
            try {
                await client.connect();
                const db = client.db('ml_heroes');
                const { hero_id, role_id } = args.heroRole;
                const heroRolesToInsert = role_id.map(rid => ({
                    hero_id: new ObjectId(hero_id),
                    role_id: new ObjectId(rid),
                    _id: new ObjectId()
                }));

                const result = await db.collection('hero_roles').insertMany(heroRolesToInsert);

                // Return the inserted documents (with _id as string)
                return heroRolesToInsert.map((doc, i) => ({
                    ...doc,
                    _id: doc._id.toString()
                }));
            } finally {
                await client.close();
            }
        },
        deleteHeroRoles: async (_, args) => {
            try {
                await client.connect();
                const db = client.db('ml_heroes');

                const result = await db.collection('hero_roles').deleteMany({ hero_id: new ObjectId(args.hero_id) });
                console.log('Deleted count:', result.deletedCount);
            } finally {
                await client.close();
            }
        },
    },
}

// server setup
const server = new ApolloServer({
    typeDefs,
    resolvers,
});

const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
});

console.log(`Server ready at: ${url}`);