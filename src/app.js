require('dotenv').config();

const express=require('express');
const cors=require('cors');
const db=require('./config/db');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// gắn routes
const authRoutes=require('./routes/auth.routes')
app.use('/api/auth',authRoutes);

const vocabSetRouter=require('./routes/vocabSet.routes')
app.use('/api/vocab_set',vocabSetRouter);

const wordRouter = require('./routes/word.routes');
app.use('/api/words', wordRouter);

const progressRouter = require('./routes/progress.routes');
app.use('/api/progress', progressRouter);

const statsRouter = require('./routes/stats.routes');
app.use('/api/stats', statsRouter);

const userRouter = require('./routes/user.routes');
app.use('/api/users', userRouter);

const practiceRouter = require('./routes/practice.routes');
app.use('/api/practice', practiceRouter);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});