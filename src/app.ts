// Import necessary packages
import bodyParser from 'body-parser';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as JWT from 'jsonwebtoken';

// Create an instance of the Express application
const app: Express = express();

// Create a router for handling API requests
const router = express.Router();

// Set the port number for the server to listen on
const port = 3000;

const cookieparser = cookieParser();
const jwt = JWT;
const jwtKey = 'my_secret_key';
const jwtExpirySeconds = 600;
const users = {
  username: 'cloverhsc',
  password: '111111Aa'
}

// Set up CORS options
const corsOptions = {
  origin: "http://localhost:4200", // 👈️ Angular local開發用
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allow these HTTP methods
  optionsSuccessStatus: 200, // Set the success status code
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
  credentials: true, // 👈️ 要加要不然Angular HttpInterceptor 的 withCredentials: true 會沒用
};

// Use the CORS middleware with the specified options
app.use(cors(corsOptions));

// Use the body-parser middleware to parse JSON request bodies
app.use(bodyParser.json());

// Use the router to handle requests to the /api endpoint
app.use('/api', router);

// Define a route for handling GET requests to /api/test
router.get('/test', (req: Request, res: Response) => {
  console.log(req.headers.authorization); // Log the Authorization header of the request
  res.send({ result: 'Hello World!' }); // Send a JSON response with a message
});

router.get('/phase/voltage', (req: Request, res: Response) => {
  console.log(req.headers.authorization); // Log the Authorization header of the request
  res.send({
    manufacturer: 'schneider',
    time_stamp: [
      "2022-11-13T04:00:00Z",
      "2022-11-13T04:10:00Z",
      "2022-11-13T04:12:00Z",
    ],
    unit: 'V',
    'Phase-1': [200, 500, 200],
  })
})

router.post('/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password || users.username !== username || users.password !== password) {
    res.status(401).send('Wrong username or password');
    return;
  }

  // Create a new token with the username in the payload
  // and which expires 600 seconds after issue
  const token = jwt.sign({ username }, jwtKey, {
    algorithm: 'HS256',
    expiresIn: jwtExpirySeconds,
  })
  console.log("token:", token);

  // Set the cookie as the token string, with a similar max age as the token
  // here, the max age is in milliseconds, so we multiply by 1000.
  // Also set the cookie to be httpOnly and secure (HTTPS only)
  res.cookie('token', token, { maxAge: jwtExpirySeconds * 1000, httpOnly: true, secure: true });
  res.cookie('username', username);

  res.send({ result: 'Login success' });
})

// Start the server and listen for incoming requests
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`); // Log a message when the server starts
});
