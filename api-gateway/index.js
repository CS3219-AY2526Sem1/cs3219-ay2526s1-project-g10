import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import httpProxy from 'express-http-proxy';

const app = express();
app.use(cors());
app.use(express.json());

// Rate Limiting - To prevent spam (100req/15min)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit to 100 requests
    message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use(limiter);

// JWT Authentication Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.sendStatus(401).json({error: 'No token provided'});
    }

    // Verify token 
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403).json({error: 'Invalid token'});
        }
        req.user = user; 
        next();
    });
}

// Routing Traffic to Microservices
app.use("/users", httpProxy(process.env.USER_SERVICE_URL));
app.use("/match", httpProxy(process.env.MATCHING_SERVICE_URL));
app.use("/questions", httpProxy(process.env.QUESTION_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/questions${req.url}`
}));
app.use("/collab", httpProxy(process.env.COLLAB_SERVICE_URL));
  
// Health Check Endpoint 
app.get('/healthz', (req, res) => {
    res.send('API Gateway is running fine');
});

// Error Handling Middleware
app.use((req, res) => {
    res.status(404).json({ error: "Route not found on API Gateway" });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Gateway Error" });
});

// Starting the server
const PORT = Number(process.env.PORT || 8080);
app.listen(PORT, "0.0.0.0", () => console.log(`API Gateway running on port ${PORT}`));