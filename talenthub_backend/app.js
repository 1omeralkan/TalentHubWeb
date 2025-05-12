const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const profileRoutes = require('./routes/profileRoutes');
const exploreRoutes = require('./routes/explore');
const followRoutes = require('./routes/followRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', uploadRoutes);
app.use('/api', profileRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/follow', followRoutes); 