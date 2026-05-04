# Service Booking Platform

Fresh full-stack app built with:

- React frontend with hooks and React Router
- Node.js and Express backend
- MongoDB with Mongoose
- JWT authentication
- bcrypt password hashing
- role-based access for users and vendors
- MVC backend structure

## Structure

```text
backend/
  config/
  controllers/
  middleware/
  models/
  routes/
  utils/
frontend/
  src/
```

## Run Backend First

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## Then Run Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Default frontend API URL:

```text
http://127.0.0.1:5000/api
```
