import express, { Request, Response } from 'express'
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import { getHostName, getVersion } from './utils'
import fs from 'node:fs'

dotenv.config()

const app = express()
app.set('view engine', 'ejs')

let dbUser = process.env.DB_USER
let dbPassword = process.env.DB_PASSWORD

if (!dbUser && process.env.DB_USER_FILE) {
    dbUser = fs.readFileSync(process.env.DB_USER_FILE, 'utf-8').trim()
}

if (!dbPassword && process.env.DB_PASSWORD_FILE) {
    dbPassword = fs.readFileSync(process.env.DB_PASSWORD_FILE, 'utf-8').trim()
}

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: dbUser,
    password: dbPassword,
    database: process.env.DB_NAME,
})

app.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT title, description FROM blogs')
        res.render('index', {
            blogs: rows,
            version: getVersion(),
            host: process.env.NODE_HOST || getHostName(),
        })
    } catch (error) {
        console.error(error)
        res.status(500).send('Error retrieving blog posts')
    }
})

app.get('/health', (req: Request, res: Response) => {
    console.log('Checking health through endpoint...')
    res.json({ alive: true })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
})
