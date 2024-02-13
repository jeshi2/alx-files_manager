/**
 * Applies Basic authentication to a route.
 * @param {Error} err The error object.
 * @param {express.Request} req The Express request object.
 * @param {express.Response} res The Express response object.
 * @param {express.NextFunction} next The Express next function.
 **/
exports.errorResponse = (err, req, res, next) => {
  const defaultMsg = `Failed to process ${req.url}`;

  if (err instanceof APIError) {
    res.status(err.code).json({ error: err.message || defaultMsg });
    return;
  }
  res.status(500).json({
    error: err ? err.message || err.toString() : defaultMsg,
  });
};
