const mongo = require('mongoose');

// User ID Object Model Definition in DataBase
const user = new mongo.Schema(
    {
      name : { type:String, required:true, unique:true },
      email : { type:String, required:true, unique:true },
      password : { type:String, required:true },
    }
);

// Password Reset Object Model
const UserPasswordReset = new mongo.Schema(
  {
    email : { type:String, required:true },
    token : { type:String, required:true, unique:true },
    expiry_time : { type:Date, required:true }
  }
);

// Message Object Model
const message = new mongo.Schema(
  {
    sender_id : { type:String, required:true },
    receiver_id : { type:String, required:true },
    msg : { type:String, required:true },
    timestamp: { type: Date, required:true }  // Automatically set to the current date and time
  }
);

// Create a User model based on the schema
const User = mongo.model('User', user);
const PasswordReset = mongo.model('PasswordReset',UserPasswordReset);
const Message = mongo.model('Message', message);

// Export the User model
module.exports = { User, PasswordReset, Message };