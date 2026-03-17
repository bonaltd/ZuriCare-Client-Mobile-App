# ZuriCare Backend API

Node.js + Express + MariaDB/MySQL backend for the ZuriCare patient app and healthcare worker dashboard.

## Setup

1. **Database**: Create the database and run the schema:
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS zuricare;"
   mysql -u root -p zuricare < ../database/zuricare_schema.sql
   ```

2. **Environment**: Copy `.env.example` to `.env` and set your DB credentials:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=zuricare
   PORT=3000
   ```

3. **Install & run**:
   ```bash
   npm install
   npm run seed    # Creates demo patient ZC-DEMO-NKOSBONA / PIN 1234
   npm run dev     # Start server on http://localhost:3000
   ```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/patient/login | Patient login (zuriCareId, pin) |
| GET | /api/patients/profile/:zuriCareId | Get patient profile |
| GET | /api/audit?zuriCareId=... | Get audit logs |
| POST | /api/audit | Add audit log |
| GET | /api/screenings?zuriCareId=... | Get screening history |
| POST | /api/screenings | Save screening |
| GET | /api/consent/requests?zuriCareId=... | Get pending consent requests |
| POST | /api/consent/requests/:id/respond | Grant/deny consent |

## Patient App Connection

Set the API base URL in the Expo app:

- **Android emulator**: `EXPO_PUBLIC_API_URL=http://10.0.2.2:3000`
- **iOS simulator**: `EXPO_PUBLIC_API_URL=http://localhost:3000`
- **Physical device**: Use your computer's local IP, e.g. `EXPO_PUBLIC_API_URL=http://192.168.1.100:3000`

Create `ZuriExpoApp/.env` with:
```
EXPO_PUBLIC_API_URL=http://localhost:3000
```
