const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const typeDefs = require('./schemas/typeDefs');
const resolvers = require('./resolvers');
const cors = require('cors');
const jwt = require('jsonwebtoken');

dotenv.config();

// Initialize Express
const app = express();

// Allow larger payloads (up to 10MB for employee_photo)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbname: 'comp3133_101298914_assignment1'
})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers['authorization'] || '';
    if (token) {
      try {
        const tokenWithoutBearer = token.split(' ')[1];
        const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
        return { user: decoded }; // ✅ includes user.id
      } catch (err) {
        return {};
      }
    }
    return {};
  }
  
});

async function startServer() {
  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
