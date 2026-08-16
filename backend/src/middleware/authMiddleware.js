import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  // Read token from cookies (requires cookie-parser)
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No session token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_neomorphic_key_123_xyz');
    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.error('JWT Verification Error:', err.message);
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired session token' });
  }
};
