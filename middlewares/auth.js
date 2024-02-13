const { getUserFromXToken, getUserFromAuthorization } = require('../utils/auth');

/**
 * Applies Basic authentication to a route.
 * @param {express.Request} req The Express request object.
 * @param {express.Response} res The Express response object.
 * @param {express.NextFunction} next The Express next function.
 */
exports.basicAuthenticate = async (req, res, next) => {
  const user = await getUserFromAuthorization(req);

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  req.user = user;
  next();
};

/**
 * Applies X-Token authentication to a route.
 * @param {express.Request} req The Express request object.
 * @param {express.Response} res The Express response object.
 * @param {express.NextFunction} next The Express next function.
 */
exports.xTokenAuthenticate = async (req, res, next) => {
  const user = await getUserFromXToken(req);

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  req.user = user;
  next();
};
