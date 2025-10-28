# Turborepo Configuration Guide

## Overview

The monorepo is configured to run both the Next.js frontend and Django backend together using Turborepo.

## Structure

```
weather-app/
├── apps/
│   ├── frontend/          # Next.js app
│   │   ├── package.json   # @weather-app/frontend
│   │   └── ...
│   └── backend/           # Django app
│       ├── package.json   # @weather-app/backend
│       ├── dev.bat        # Windows dev script
│       ├── dev.sh         # Unix/Mac dev script
│       ├── venv/          # Python virtual environment
│       └── ...
├── packages/              # Shared packages (future)
├── package.json           # Root workspace config
└── turbo.json            # Turborepo configuration
```

## How It Works

### 1. Workspace Configuration

The root `package.json` defines workspaces:

```json
{
  "workspaces": ["apps/*", "packages/*"]
}
```

This allows npm to recognize both frontend and backend as workspace members.

### 2. Backend Package.json

The Django backend has a `package.json` to make it compatible with Turborepo:

```json
{
  "name": "@weather-app/backend",
  "scripts": {
    "dev": "cmd /c dev.bat || bash dev.sh",
    "build": "echo 'Django backend - no build step needed'",
    ...
  }
}
```

### 3. Development Scripts

**Windows** (`dev.bat`):

```batch
call venv\Scripts\activate.bat && python manage.py runserver
```

**Unix/Mac** (`dev.sh`):

```bash
source venv/bin/activate && python manage.py runserver
```

The package.json `dev` script tries Windows first, then falls back to Unix/Mac.

### 4. Turbo Configuration

`turbo.json` defines tasks that work across both apps:

```json
{
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "staticfiles/**"]
    },
    ...
  }
}
```

## Running the Apps

### All Apps Together

From the root directory:

```bash
npm run dev
```

This starts:

- Frontend at http://localhost:3000
- Backend at http://localhost:8000

**Turborepo TUI** will show logs from both apps in an interactive terminal interface.

### Individual Apps

Run only the frontend:

```bash
npm run dev --filter=@weather-app/frontend
```

Run only the backend:

```bash
npm run dev --filter=@weather-app/backend
```

### Alternative (without Turbo)

**Frontend:**

```bash
cd apps/frontend
npm run dev
```

**Backend:**

```bash
cd apps/backend
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
python manage.py runserver
```

## Available Commands

### Development

```bash
npm run dev                    # Run all apps in dev mode
npm run dev --filter=frontend  # Run only frontend
npm run dev --filter=backend   # Run only backend
```

### Build

```bash
npm run build                  # Build all apps
npm run build --filter=frontend
```

### Backend-Specific

```bash
npm run migrate --filter=@weather-app/backend  # Run Django migrations
npm run test --filter=@weather-app/backend     # Run Django tests
npm run check --filter=@weather-app/backend    # Run Django checks
```

### Cleanup

```bash
npm run clean                  # Clean all build artifacts
```

## Environment Setup Checklist

Before running `npm run dev`, ensure:

### ✅ Backend Setup

- [ ] Python virtual environment created (`python -m venv venv`)
- [ ] Virtual environment activated
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] Migrations run (`python manage.py migrate`)
- [ ] `.env` file created with required variables

### ✅ Frontend Setup

- [ ] Node modules installed (`npm install` from root)
- [ ] `.env.local` file created with `NEXT_PUBLIC_API_URL`

## Turborepo Features

### Parallel Execution

Turbo runs tasks in parallel when possible, speeding up builds and development.

### Caching

- Build outputs are cached
- Dev tasks have caching disabled (persistent tasks)

### Dependency Graph

Turbo understands dependencies between apps and runs tasks in the correct order.

### Filtering

Run tasks for specific apps:

```bash
turbo run dev --filter=frontend
turbo run build --filter=backend
```

## Troubleshooting

### Issue: Backend doesn't start

**Solution:**

1. Ensure virtual environment is created
2. Check that dependencies are installed
3. Verify `.env` file exists

### Issue: Frontend can't connect to backend

**Solution:**

1. Verify backend is running on port 8000
2. Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
3. Verify CORS settings in Django

### Issue: Turbo doesn't recognize backend

**Solution:**

1. Ensure `apps/backend/package.json` exists
2. Run `npm install` from root to sync workspaces

### Issue: Permission denied on dev.sh

**Solution:**

```bash
chmod +x apps/backend/dev.sh
```

## Development Workflow

### Starting Development

1. **Open terminal in root directory**
2. **Run all apps:**
   ```bash
   npm run dev
   ```
3. **Access apps:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000
   - Backend API Docs: http://localhost:8000/api/docs

### Making Changes

**Frontend changes:**

- Edit files in `apps/frontend/`
- Hot reload will update automatically

**Backend changes:**

- Edit files in `apps/backend/`
- Django dev server will auto-reload
- For model changes, run migrations

### Testing Integration

1. Start both apps with `npm run dev`
2. Open frontend at http://localhost:3000
3. Search for a city to test the full stack
4. Check both terminal outputs for logs

## Production Considerations

### Building for Production

```bash
# Build all apps
npm run build

# Build specific app
npm run build --filter=@weather-app/frontend
```

### Environment Variables

**Production Frontend:**

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/weather
```

**Production Backend:**

```env
DEBUG=False
ALLOWED_HOSTS=yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
SECRET_KEY=<strong-secret-key>
```

### Deployment

- **Frontend**: Deploy to Vercel, Netlify, or static hosting
- **Backend**: Deploy to Railway, Render, AWS, or any Python hosting

## Benefits of This Setup

✅ **Unified Commands**: Run all apps with one command
✅ **Monorepo Management**: Single repository for frontend and backend
✅ **Development Speed**: Parallel task execution
✅ **Type Safety**: Shared TypeScript types across projects
✅ **Easy Onboarding**: Simple setup for new developers
✅ **Version Control**: Track both apps in one repo
✅ **Shared Tooling**: Consistent development experience

## Next Steps

- Add shared TypeScript types package
- Add shared UI components package
- Set up CI/CD pipeline with Turbo
- Add Docker configuration for deployment
- Set up remote caching for faster builds
