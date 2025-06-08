import mongoose from 'mongoose';
import User from '../models/User.js';
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/task-manager')
    .then(async () => {
    console.log('Connected to MongoDB');
    // Count users
    const userCount = await User.countDocuments({});
    console.log(`Number of users in database: ${userCount}`);
    // List all users if any exist
    if (userCount > 0) {
        const users = await User.find({}, '-password');
        console.log('\nExisting users:');
        console.log(JSON.stringify(users, null, 2));
    }
    else {
        console.log('\nDatabase is empty - no users found');
    }
    // Close connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
})
    .catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
