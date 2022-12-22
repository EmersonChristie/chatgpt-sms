const logErrors = (err, req, res, next) => {
  console.error(err.stack);
  next(err);
};

const errorHandler = (err, req, res, next) => {
  res.status(500);
  res.send("OOPs...Something went wrong on my end. Let's try that again... ", {
    error: err,
  });
};

module.exports = {
  logErrors,
  errorHandler,
};
