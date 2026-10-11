const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_jwt_mediccare_key_2026_change_in_production',
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );
};

// Send token in response (cookie + body)
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      message,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        specialization: user.specialization,
        department: user.department,
        bloodGroup: user.bloodGroup,
        age: user.age,
        gender: user.gender
      }
    });
};

/**
 * @desc    Register a new user (Patient by default, Doctor/Admin if configured or allowed)
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'patient',
      phone,
      specialization,
      department,
      bloodGroup,
      age,
      gender,
      emergencyContact,
      address
    } = req.body;

    // Check duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Role safety: restrict direct admin creation if needed, allow patient and doctor for project setup
    const userRole = ['patient', 'doctor', 'admin'].includes(role) ? role : 'patient';

    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      phone,
      specialization: userRole === 'doctor' ? specialization || 'General Medicine' : undefined,
      department: userRole === 'doctor' ? department || 'Outpatient' : undefined,
      bloodGroup,
      age,
      gender,
      emergencyContact,
      address
    });

    // Log registration
    await ActivityLog.create({
      action: `New ${userRole} registered: ${user.name}`,
      user: user._id,
      userName: user.name,
      userRole: user.role,
      category: 'AUTH',
      details: `Registered with email ${user.email}`
    }).catch(() => {});

    sendTokenResponse(user, 201, res, 'User registered successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Log login activity
    await ActivityLog.create({
      action: `User login: ${user.name} (${user.role})`,
      user: user._id,
      userName: user.name,
      userRole: user.role,
      category: 'AUTH',
      details: `Successful login`
    }).catch(() => {});

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      bloodGroup: req.body.bloodGroup,
      age: req.body.age,
      gender: req.body.gender,
      emergencyContact: req.body.emergencyContact
    };

    if (req.user.role === 'doctor') {
      if (req.body.specialization) fieldsToUpdate.specialization = req.body.specialization;
      if (req.body.department) fieldsToUpdate.department = req.body.department;
      if (req.body.consultationFee) fieldsToUpdate.consultationFee = req.body.consultationFee;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user & clear cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 5 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};
