require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Using a Pool for production stability
const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 4000, 
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // CRITICAL: TiDB Cloud Starter requires SSL to connect
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true,
        port: process.env.DB_PORT
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test route
// Test route with a built-in HTML form
app.get('/', (req, res) => {
    res.send(`
        <html>
            <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
                <h2>TiDB + Render Test Form</h2>
                <form action="/api/login" method="POST" style="display: flex; flex-direction: column; gap: 10px; width: 300px;">
                    <input type="text" name="username" placeholder="Username" required style="padding: 10px;">
                    <input type="password" name="password" placeholder="Password" required style="padding: 10px;">
                    <button type="submit" style="padding: 10px; background: #007bff; color: white; border: none; cursor: pointer;">
                        Submit to Database
                    </button>
                </form>
                <p>Check your TiDB dashboard after clicking submit!</p>
            </body>
        </html>
    `);
});

// Login/Insert route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sqlInsert = "INSERT INTO users (username, password) VALUES (?, ?)";

    db.query(sqlInsert, [username, password], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Database error");
        }
        res.status(200).send(`User ${username} added successfully!`);
    });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});