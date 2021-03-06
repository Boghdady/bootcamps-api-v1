const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const colors = require('colors');

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./middleware/errorHandler');
// Load env vars
dotenv.config({ path: './config/config.env' });
// Route files
const connectDB = require('./config/db');
const bootcamps = require('./routes/bootcampRoutes');
const courses = require('./routes/courseRoutes');
const auth = require('./routes/authRoutes');
const users = require('./routes/userRoutes');
const reviews = require('./routes/reviewRoutes');

// Connect to database
connectDB();

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(mongoSanitize());
app.use(xssClean());
app.use(hpp({
  whitelist: [
    'duration', 'ratingsAverage', 'ratingsQuantity', 'maxGroupSize', 'difficulty', 'price'
  ]
}));
const limiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000, // 100 request per one hour
  message: 'Too many requests from this ip, please try again in an hour!'
});
app.use('/api', limiter);

app.use(cors());


// Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

// Handle undefined routs
app.all('*', (req, res, next) => {
  next(new AppError(`Cant't find ${req.originalUrl} on this server`, 404));
});

// GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;
const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & Exit process
  server.close(() => process.exit(1));
});
