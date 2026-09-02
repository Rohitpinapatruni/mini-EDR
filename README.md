# mini-EDR

## Run the application

Start the FastAPI backend from the repository root:

```powershell
python -m uvicorn backend.main:app --reload
```

Start the React frontend in a second terminal:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

The frontend reads the backend URL from `VITE_API_URL` and defaults to `http://127.0.0.1:8000`.
