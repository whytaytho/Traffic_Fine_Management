# Traffic Fine Management System

## Project Overview

The Traffic Fine Management System is a full-stack web application built to manage vehicle owners, vehicles, police officers, violation types, and fines. The system provides an admin-style interface for viewing records, adding new entries, updating existing data, deleting records, and managing the complete fine lifecycle including payment, dispute, and cancellation flows.

The project follows a clear three-layer flow:

`React frontend -> Express/Node.js backend API -> MySQL database`

This keeps the frontend separate from direct database access and places the business logic in the backend and database layer.

## Tech Stack

- Frontend: React, Vite, React Router, Axios, CSS
- Backend: Node.js, Express.js
- Database: MySQL
- Database Driver: mysql2 (promise-based pool)

## Main Features

- Dashboard with summary cards and analytics
- Owner management
- Vehicle management
- Police officer management
- Violation type management
- Fine creation and update
- Fine payment, dispute, cancellation, and dispute resolution actions
- Search and filtering support

## Project Structure

```text
traffic-fine-system/
  backend/
  frontend/
```

## Setup Instructions

### 1. Database Setup

Create or import the `fine_management` MySQL database before running the project. The database should include:

- required tables
- sample data
- stored procedures
- trigger logic

### 2. Backend Setup

Go to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file using `.env.example` and configure:

```env
PORT=5001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=fine_management
CLIENT_URL=http://localhost:5173
```

Run the backend:

```bash
npm run dev
```

### 3. Frontend Setup

Go to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file using `.env.example` and configure:

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

Run the frontend:

```bash
npm run dev
```

### 4. Open the Application

Open:

```text
http://localhost:5173
```

## Notes

- The frontend does not connect directly to MySQL.
- All database operations happen through the backend API.
- Stored procedures are reused for fine-related actions where required.
- Aadhaar is stored as a separate owner field and not used as the database primary key.

## References

The following references and official documentation were used during development:

1. React Documentation  
   [https://react.dev/](https://react.dev/)

2. Node.js Documentation  
   [https://nodejs.org/en/docs](https://nodejs.org/en/docs)

3. Express.js Documentation  
   [https://expressjs.com/](https://expressjs.com/)

4. Vite Documentation  
   [https://vitejs.dev/](https://vitejs.dev/)

5. React Router Documentation  
   [https://reactrouter.com/](https://reactrouter.com/)

6. Axios Documentation  
   [https://axios-http.com/docs/intro](https://axios-http.com/docs/intro)

7. MySQL Documentation  
   [https://dev.mysql.com/doc/](https://dev.mysql.com/doc/)

8. mysql2 Package Documentation  
   [https://www.npmjs.com/package/mysql2](https://www.npmjs.com/package/mysql2)

9. MDN Web Docs  
   [https://developer.mozilla.org/](https://developer.mozilla.org/)

## Acknowledgement

This project was developed with the help of official documentation, database design concepts, and implementation references from the technologies listed above. Limited AI-assisted support was also used during frontend structuring, UI refinement, and code organization, while the final project logic, database integration, and implementation decisions were reviewed and adapted to match the project requirements.

## Group Members

Tanmay Makhija, Atulya Utkarsh , Pakhi Pragaya,Shivaj Singh , Rudra Rawat
