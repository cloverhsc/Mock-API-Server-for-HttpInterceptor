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
const jwtRefreshKey = 'my_refresh_token';
const jwtExpirySeconds = 600;
const jwtExpiryRefSeconds = 900;
const users = {
  username: 'cloverhsc',
  password: '111111Aa'
}

var authToken = '';
var refreshToken = '';

// Set up CORS options
const corsOptions = {
  origin: "http://localhost:4200", // Angular local
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allow these HTTP methods
  optionsSuccessStatus: 200, // Set the success status code
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
  credentials: true, // 要加要不然Angular HttpInterceptor 的 withCredentials: true 會沒用
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

router.post('/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password || users.username !== username || users.password !== password) {
    res.status(401).send('Wrong username or password');
    return;
  }

  // Create a new token with the username in the payload
  // and which expires 600 seconds after issue
  authToken = jwt.sign({ username }, jwtKey, {
    algorithm: 'HS256',
    expiresIn: jwtExpirySeconds,
  })
  console.log("Auth TK: ", authToken);

  refreshToken = jwt.sign({ username }, jwtRefreshKey, {
    algorithm: 'HS256',
    expiresIn: jwtExpiryRefSeconds,
  })

  console.log("Refresh TK: ", refreshToken)

  // Set the cookie as the token string, with a similar max age as the token
  // here, the max age is in milliseconds, so we multiply by 1000.
  // Also set the cookie to be httpOnly and secure (HTTPS only)
  res.cookie(
    'access_cookie',
    authToken,
    { maxAge: jwtExpirySeconds * 1000, httpOnly: true, secure: true }
  );

  // Set the refresh token with httpOnly and secure.
  res.cookie(
    'refresh_cookie',
    refreshToken,
    { maxAge: jwtExpiryRefSeconds * 1000, httpOnly: true, secure: true }
  )
  res.cookie('username', username);

  res.send({ result: 'Login success' });
})

// get the user name
router.get('/user/info', (req: Request, res: Response) => {
  // check auth token is valid then return username
  const cookies = req.headers.cookie;
  if (!cookies) {
    res.status(401).send('Unauthorized');
    return;
  }

  if (cookies.includes('access_cookie')) {
    const token = cookies.split('access_cookie=')[1].split(';')[0];
    try {
      const payload = jwt.verify(token, jwtKey);

      res.send({ username: users.username });
    } catch (e) {
      res.status(401).send('Unauthorized');
    }
  }

})



// Start the server and listen for incoming requests
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`); // Log a message when the server starts
});
