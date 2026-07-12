const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    return Promise.resolve(reqestHandler(req, res, next)).catch((err) => {
      next(err);
    });
  };
};

export { asyncHandler };