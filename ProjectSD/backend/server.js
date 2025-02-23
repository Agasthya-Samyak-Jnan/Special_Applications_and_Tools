/* Script to Initialise the Backend Server */

// Including Required Modules for Web App
const express = require('express');
const mongo = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { User, PasswordReset, Message } = require('./models/dbmodels'); // User and UserPasswordReset Models of Database
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const http = require('http');
const socketIo = require('socket.io');
const sharedSession = require("express-socket.io-session");

// This line loads environment variables defined in your .env file so that you can use them in your application, like the MongoDB URI.
dotenv.config();

// Creating Express Object : for defining routes and middleware configs.
const exp = express();
const PORT = process.env.PORT;

// Middlewares Setup
exp.use(cors());
exp.use(express.json());
exp.use(express.urlencoded({extended : true}));
exp.use(express.static(path.join(__dirname, 'public'))); // Serve Static files like HTML etc.

// Connection to MongoDB DataBase
mongo.connect(process.env.MONGODB_URI)
  .then( () => console.log('MongoDB DataBase is connected.') )
  .catch( err => console.error('MongoDB connection error !', err) );

// Create HTTP server and Initialize Socket.io for Listening and Updating to multiple clients at once.
const server = http.createServer(exp);
const io = socketIo(server);


// Manage User Login Sessions
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  },
});

exp.use(sessionMiddleware);

// Use shared session middleware for socket.io to access session data
io.use(sharedSession(sessionMiddleware, {
  autoSave: true,
}));


// Check User Login between reloads.
exp.get('/check-login', async (req, res) => {
  if (req.session.userId) {
      try {
          const user = await User.findById(req.session.userId);
          if (user) { return res.json({ loggedIn: true, user: { name: user.name, email: user.email } }); }
      } 
      catch (error) {
          console.error(error);
      }
  }
  res.json({ loggedIn: false });
});


/* Sign Up Routing */

/* Serve Sign-Up HTML Page */
exp.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html')); // Ensure this path is correct
});

/* Sign Up / Create New Account Route Handler */
exp.post('/signup', async(req,res) => {
  
  // Get User Details from Webpage Server
  const { name, email, password, confirm_password } = req.body;

try {
  // Find if account connected to this E-mail already exists in our DataBase
  const user = await User.findOne({ email: email });
  if (user) { return res.status(400).send('An Account with this Email already Exists. Sign into that Account.')}

  // Hash the Password for Security before Storing to Database. (10 = 10 Salting Rounds / Hashing Randomness)
  const hashed_password = await bcrypt.hash(password, 10);

  // Create the User Data Object for the New User.
  const new_user = new User (
    {
      name: name,
      email: email,
      password: hashed_password
    }
  )

  // Save User Object to Database
  await new_user.save();
  res.status(201).send('User Account Created Successfully');
}
catch (error) {
  console.error(error);
  res.status(500).send('Internal Server Error');
}

})


/* Sign in Routing */

/* Serve Sign-in HTML Page */
exp.get('/signin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signin.html')); // Ensure this path is correct
});

/* Sign in Route Handler */
exp.post ('/signin', async(req,res) => {

  // Get User details sent from Webpage Server
  const { email, password } = req.body;

try {
  // Verify Existence of User Profile
  const user = await User.findOne({ email: email });
  if (!user) { return res.status(400).send('User Account does not exist.'); }

  // Verify Password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) { return res.status(400).send('Invalid email or password'); }

  // Store User ID for this Logged-in Session
  req.session.userId = user._id;
  req.session.username = user.name;

  // Redirect to the chat page after successful login.
  return res.redirect('/chat');
}
catch (error) {
  console.error(error);
    res.status(500).send('Internal Server Error.');
  }

  })

  /* User Account Logout Route */
  exp.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Failed to destroy session during logout:", err);
            return res.status(500).send("Error logging out.");
        }
        res.clearCookie('connect.sid');  // Ensure session cookie is cleared
        return res.redirect('/signin');  // Redirect to login page
    });
  });


  /* Forgot Password Routing */

  /* Serve Forgot Password HTML Page */
  exp.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'forgot_password.html')); // Ensure this path is correct
  });

  /* Forgot Password Route */
  exp.post ('/forgot-password', async(req,res) => {

    const email = req.body.email;

  try {
    // Find if User Exists
    const user = await User.findOne({ email: email });
    if (!user) { return res.status(400).send('There is no account connected to this E-mail.'); }

    // Create  Secure Randomized Reset Token for User Identification during Reset Process
    const reset_token = crypto.randomBytes(32).toString('hex');
    const token_time = Date.now() + 300000; // Token Valid for 5 minutes

    // Store the reset token and its expiration in the DataBase
    await PasswordReset.create( 
      {
        email: email,
        token: reset_token,
        expiry_time: token_time
      }
    );

    // Send reset link via email
    const reset_link = `http://localhost:5000/reset-password?token=${reset_token}`;

    // Send the reset link to the user's email (via nodemailer)

    // Create a transporter to send E-mail
    const transporter = nodemailer.createTransport({
    service: 'gmail', // Mail Service Provider
    auth: {
      user: process.env.EMAIL_USER, // Admin/Sender email address
      pass: process.env.EMAIL_PASS, // Admin/Sender email password 
    }
    });

    // Prepare Email data
    const reset_Email = {
      from: process.env.EMAIL_USER, // Sender's address
      to: email, // List of recipients
      subject: 'Password Reset Link', // Subject line
      text: `You requested a password reset for Your Journal Account. Click this link to reset your password: ${reset_link}`, // Plain text body
      html: `<p>You requested a password reset for Your Journal Account. Click the link to reset your password:</p><a href="${reset_link}">Reset Password</a>`, // HTML body
    };

    // Send email
    transporter.sendMail(reset_Email, (error, info) => {
      if (error) {  return res.status(500).send('Error sending Email: ' + error.toString()); }
      return res.send(`The Password reset link has been sent to your Email.`);
    });
  }
  catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }

  })


  /* Reset Password Route Handler */

  /* Serve Reset Password HTML Page */
  exp.get('/reset-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'reset_password.html')); // Ensure this path is correct
  });

  /* Reset Route Handler */
  exp.post ('/reset-password/:token', async(req,res) => {

    const token = req.params.token;

  try {
    // Find User's Password Reset Object to get E-mail of User who needs to set thier new Password.
    const user_pass = await PasswordReset.findOne({ token: token });
    if (user_pass.expiry_time < Date.now()) {
      await PasswordReset.deleteOne({ token });
      return res.status(400).send('Reset Token is Expired. Please try again.')
    }
    const email = user_pass.email;

    // Find User account on Database using Email.
    const user = await User.findOne({ email: email });

    // Get new Password and Confirm Password Inputs
    const { password, confirm_password } = req.body;

    // Reset to New Password and Save it to Database
    const Password = await bcrypt.hash(password,10);
    user.password = Password;
    await user.save();
  
    // Delete the PassWord Reset Object and send Ackowledgement
    await PasswordReset.deleteOne({ token });
    res.send('Your Password was Reset Successfully. Login to your account on Login Page.');
  }
  catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }

  })

  // Serve static files from the React build
  exp.use(express.static(path.join(__dirname, '../frontend/build')));

  /* Chat Page Route */
  exp.get('/chat', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/signin'); // Redirect to login if not authenticated.
    }
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });

  /* Route to fetch Current Logged-in Username */
  exp.get('/api/username', (req,res) => {
    if (!req.session.userId) { return res.redirect('/signin'); } // Redirect to login if not authenticated.
    res.json({ username : req.session.username });
  });

  /* Route to get List of Users with whom Logged in User had Conversation. */
  exp.get('/api/conversations', async (req, res) => {

    if (!req.session.userId) {
      return res.status(401).send('Unauthorized');
    }
  
    try {
      const currentUser = req.session.username;
  
      // Find unique users from messages where the logged-in user is either sender or receiver.
      const conversations = await Message.aggregate([
        {
          $match: {
            $or: [
              { sender_id: currentUser },
              { receiver_id: currentUser }
            ]
          }
        },
        {
          $group: {
            _id: {
              $cond: {
                if: { $eq: ["$sender_id", currentUser] },
                then: "$receiver_id",
                else: "$sender_id"
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            username: "$_id"
          }
        }
      ]);
  
      const uniqueUsers = conversations.map(convo => convo.username);
      res.json(uniqueUsers);
  
    } 
    catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ error: 'Error fetching conversations.' });
    }
  });

  /* Check if User Exists */
  exp.get('/api/check-user/:username', async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({ name: username });
        if (user) {
            res.status(200).json({ exists: true });
        } else {
            res.status(200).json({ exists: false });
        }
    } catch (error) {
        console.error('Error checking user existence:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

  /* Route to Get Latest Messages on-demand */
  exp.get('/api/messages/:username', async (req,res) => {

    if (!req.session.userId) {
      return res.redirect('/signin'); // Redirect to login if not authenticated.
    }

    try {
      const loggedInUser = req.session.username;
      const neededUser = req.params.username;

      const messages = await Message.find( 
          {
            $or: [{ sender_id: loggedInUser, receiver_id: neededUser },
                  { sender_id: neededUser, receiver_id: loggedInUser }]
          } 
        ).sort({ timestamp: 1 });

      res.json(messages);
    } 

    catch (error) {
      console.error('Error retrieving messages: ', error);
      res.status(500).json({ error: 'Error retrieving messages.' });
    }

  });

  /* Route to Delete all messages */
  exp.get('/api/delete-messages/:username', async (req,res) => {
    if (!req.session.userId) {
      return res.redirect('/signin'); // Redirect to login if not authenticated.
    }

    try {
      const loggedInUser = req.session.username;
      const neededUser = req.params.username;

      // Find and delete chats between logged-in and other specified User.
      await Message.deleteMany({
        $or: [
            { sender_id: loggedInUser, receiver_id: neededUser },
            { sender_id: neededUser, receiver_id: loggedInUser }
        ]
      });
      res.status(200).send('Messages deleted successfully');
    } 

    catch (error) {
      console.error('Error retrieving messages: ', error);
      res.status(500).json({ error: 'Error retrieving messages.' });
    }
  });

  /* Message Routes */
  const userSockets = {}; // Map to store SocketID for each connected User.

  // Listen for incoming socket connections
  io.on('connection', (socket) => {

      const username = socket.handshake.session.username;
      if (username) {
        userSockets[username] = socket.id;
        console.log(`User ${username} connected.`);
      }
      else {
        console.log(`User connection attempt failed.`);
      }

      // Listen for incoming messages from clients
      socket.on('send-message', async (data) => {

      // Emit the message only to the receiver
      const receiverSocketId = userSockets[data.receiver];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive-message', {
            message: data.message,
            sender: data.sender,
            receiver: data.receiver
        });
      }

      // Save the message to the database
      const new_msg = new Message({
        sender_id: data.sender,
        receiver_id: data.receiver,
        msg: data.message,
        timestamp: Date.now()
      });
      await new_msg.save();

    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected');
        // Remove disconnected User's SocketID.
        for (const [username, socketId] of Object.entries(userSockets)) {
          if (socketId === socket.id) {
              delete userSockets[username];
              console.log(`${username} has disconnected.`);
              break;
          }
        }
    });

  });

  // Start the server with Socket.io
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });

  // /* Start to Listen for Input Events / Requests. */
  // exp.listen(PORT, () => {
  //     console.log(`Server is running on port ${PORT}.`);
  // });
    
