import dotenv from 'dotenv';

dotenv.config();

console.log('Configuration Check:');
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Set' : '❌ Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('PORT:', process.env.PORT || 'Using default 5000');
console.log('ML_SERVICE_URL:', process.env.ML_SERVICE_URL || 'Using default http://localhost:5001');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Using default development');