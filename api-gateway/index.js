import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Placeholder health endpoint 
app.get('/', (req, res) => {
    res.send('API Gateway is running');
});

// Later to add routes to microservices here
// /users -> port 3001
// /match -> port 3002
// /questions -> port 3003
// /collab -> port 3004 

app.listen(8080, () => console.log("API Gateway running on port 8080"));