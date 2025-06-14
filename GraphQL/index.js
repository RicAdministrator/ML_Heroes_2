import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { MongoClient, ObjectId } from 'mongodb';

// types
import { typeDefs } from './schema.js';

const uri = 'mongodb://localhost:27017'; // Update with your MongoDB URI
const client = new MongoClient(uri);

const resolvers = {
    Query: {
        async roles() {
            try {
                await client.connect();
                const db = client.db('ml_heroes'); // Replace with your DB name
                const roles = await db.collection('roles').find().toArray();
                return roles;
            } finally {
                await client.close();
            }
        },
    },
    Mutation: {
        addRole: async (_, args) => {
            try {
                await client.connect();
                const db = client.db('ml_heroes'); // Replace with your DB name

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
                const db = client.db('ml_heroes'); // Replace with your DB name

                const result = await db.collection('roles').deleteOne({ _id: new ObjectId(args._id) });
                console.log('Deleted count:', result.deletedCount);
            } finally {
                await client.close();
            }
        },
        updateRole: async (_, args) => {
            try {
                await client.connect();
                const db = client.db('ml_heroes'); // Replace with your DB name

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