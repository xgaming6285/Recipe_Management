import User from '../models/User';
import jwt from 'jsonwebtoken';

// Create token function
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Register a new user
export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }
    
    // Create new user
    const newUser = await User.create({
      username,
      email,
      password
    });
    
    // Create token
    const token = createToken(newUser._id);
    
    // Remove password from output
    newUser.password = undefined;
    
    res.status(201).json({
      success: true,
      token,
      data: {
        user: newUser
      }
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    // Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect email or password'
      });
    }
    
    // If everything ok, send token to client
    const token = createToken(user._id);
    
    // Remove password from output
    user.password = undefined;
    
    res.status(200).json({
      success: true,
      token,
      data: {
        user
      }
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};