import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bcrypt from 'bcryptjs';

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// إعدادات الاتصال بقاعدة البيانات الجديدة
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'drivex_db'
};

let pool;

async function bootstrapDatabase() {
    const rootConnection = await mysql.createConnection({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password
    });
    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    await rootConnection.end();

    pool = mysql.createPool({ ...dbConfig, waitForConnections: true, connectionLimit: 10 });

    await pool.execute(`
        CREATE TABLE IF NOT EXISTS pepole (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_name VARCHAR(100) NOT NULL UNIQUE,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await pool.execute(`
        CREATE TABLE IF NOT EXISTS car (
            id INT AUTO_INCREMENT PRIMARY KEY,
            car_name VARCHAR(255) NOT NULL,
            car_category VARCHAR(50) NOT NULL,
            car_type VARCHAR(50) NOT NULL DEFAULT 'Sports',
            price DECIMAL(12,2) NOT NULL DEFAULT 0,
            car_condition VARCHAR(20) NOT NULL DEFAULT 'New',
            image_url VARCHAR(500),
            features TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

async function queryDatabase(sql, params = []) {
    const [rows] = await pool.execute(sql, params);
    return rows;
}

// نظام التسجيل (Register) - معدل لاستقبال الباسورد والرتبة
app.post('/api/register', async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "Please fill in all the required fields." });
    }

    try {
        const existingUsers = await queryDatabase('SELECT id FROM pepole WHERE user_name = ? OR email = ?', [username, email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: "The username or email is already registered!" });
        }

        const userRole = role === 'admin' ? 'admin' : 'user';
        const passwordHash = await bcrypt.hash(password, 10);

        await queryDatabase(
            'INSERT INTO pepole (user_name, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, passwordHash, userRole]
        );
        res.json({ message: "Account created successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error creating account: " + error.message });
    }
});

// نظام تسجيل الدخول (Login) -  للتحقق من الباسورد
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const rows = await queryDatabase('SELECT * FROM pepole WHERE user_name = ?', [username]);

        if (rows.length === 0) {
            return res.status(401).json({ message: "Invalid username or password!" });
        }

        const user = rows[0];
        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) {
            return res.status(401).json({ message: "Invalid username or password!" });
        }

        res.json({
            message: "Login successful!",
            role: user.role || 'user',
            username: user.user_name
        });
    } catch (error) {
        res.status(500).json({ message: "Server error: " + error.message });
    }
});

//جلب السيارات حسب الماركة لصفحات المعرض
app.get('/api/cars/:brand', async (req, res) => {
    const brand = req.params.brand;
    try {
        const rows = await queryDatabase('SELECT * FROM car WHERE car_category = ?', [brand]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/car-details/:id', async (req, res) => {
    const carId = req.params.id;
    try {
        const rows = await queryDatabase('SELECT * FROM car WHERE id = ?', [carId]);
        if (rows.length === 0) return res.status(404).json({ message: "Car not found!" });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/dashboard/all-cars', async (req, res) => {
    try {
        const rows = await queryDatabase('SELECT * FROM car ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/dashboard/all-users', async (req, res) => {
    try {
        const rows = await queryDatabase('SELECT id, user_name, email, role FROM pepole ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//إضافة سيارة جديدة من الداشبورد
app.post('/api/dashboard/add-car', async (req, res) => {
    const { car_name, car_category, car_type, price, car_condition, image_url, features } = req.body;

    if (!car_name || !car_category) {
        return res.status(400).json({ message: "Car name and brand are required." });
    }

    try {
        await queryDatabase(
            'INSERT INTO car (car_name, car_category, car_type, price, car_condition, image_url, features) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [car_name, car_category, car_type || 'Sports', price || 0, car_condition || 'New', image_url || null, features || null]
        );
        res.json({ message: "The car has been successfully added to the showroom!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//تعديل سيارة موجودة من الداشبورد
app.put('/api/dashboard/edit-car/:id', async (req, res) => {
    const carId = req.params.id;
    const { car_name, car_category, car_type, price, car_condition, image_url, features } = req.body;
    try {
        await queryDatabase(
            'UPDATE car SET car_name = ?, car_category = ?, car_type = ?, price = ?, car_condition = ?, image_url = ?, features = ? WHERE id = ?',
            [car_name, car_category, car_type, price || 0, car_condition, image_url || null, features || null, carId]
        );
        res.json({ message: "Vehicle data has been successfully updated!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//حذف سيارة من الداشبورد
app.delete('/api/dashboard/delete-car/:id', async (req, res) => {
    const carId = req.params.id;
    try {
        await queryDatabase('DELETE FROM car WHERE id = ?', [carId]);
        res.json({ message: "The car has been successfully removed from the showroom!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

bootstrapDatabase()
    .then(() => {
        app.listen(port, () => {
            console.log(`[DRIVEX SERVER] Running smoothly on http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.error('[DRIVEX SERVER] Failed to initialize database:', err.message);
        process.exit(1);
    });
