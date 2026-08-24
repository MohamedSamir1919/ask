# askmosa backend

Run the backend server (needs MongoDB running).

1. Install dependencies

```bash
cd backend
npm install
```

2. Configure

Create a `.env` file with `MONGODB_URI` if you need a custom MongoDB URI.

3. Start

```bash
npm start
# or for development (nodemon required)
npm run dev
```

API Endpoints
- `GET /questions`
- `POST /login` { username, password } -> returns `{ token }` (use env `ADMIN_USER`/`ADMIN_PASS`)
- `POST /questions` { thequestion, title?, key?, publish? }
- `GET /questions/:id`
- `PUT /questions/:id`
- `DELETE /questions/:id`
- `POST /questions/:id/answers` { text?, publish? } (default text is "yes i remember !")
 - `POST /questions/:id/answers` **(admin only)** { text?, publish? } (default text is "yes i remember !")
 - `GET /admin/questions` (requires `Authorization: Bearer <token>`, returns all questions regardless of `key`)

Admin credentials (development): username `MoSaS`, password `letmein`
