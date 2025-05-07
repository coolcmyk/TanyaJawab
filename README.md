# TanyaJawab

Final Project Sistem Basis Data Kelompok 14

# TanyaJawab

![TanyaJawab Logo](https://via.placeholder.com/200x70?text=TanyaJawab)

> An intelligent learning assistant powered by RAG (Retrieval-Augmented Generation) to help students better understand their course materials.

## 📚 Overview

TanyaJawab is a comprehensive web-based learning assistant that empowers students to better understand their course materials through advanced AI technology. The platform combines document management, intelligent Q&A capabilities, and study organization tools into one seamless experience.

### Key Features

- **📄 Document Intelligence**: Upload lecture notes, assignments, and syllabi in PDF format
- **🔍 Smart Q&A**: Ask questions about your documents and get contextually relevant answers
- **📅 Course Scheduling**: Manage your weekly class schedule
- **✅ Assignment Tracking**: Keep track of all your tasks and deadlines
- **🔐 Secure Authentication**: Log in via GitHub OAuth or local credentials

## 🧠 How It Works

TanyaJawab leverages cutting-edge Retrieval-Augmented Generation (RAG) to provide accurate, contextual answers about your course materials:

1. **Document Processing**:
   - Upload your PDF documents
   - Our system extracts text and images using Gemini Vision API
   - Content is split into manageable chunks and converted to vector embeddings
   - These embeddings are stored in Qdrant, a vector database optimized for semantic search

2. **Intelligent Q&A**:
   - Ask questions about any of your uploaded documents
   - The system finds the most relevant content chunks in your documents
   - It augments the question with this context and passes it to a Large Language Model
   - You receive accurate answers based specifically on your materials

## 🔧 Technical Architecture

TanyaJawab is built on a modern tech stack designed for performance, reliability, and scalability:

- **Frontend**: React.js with Tailwind CSS
- **Backend**: Python (FastAPI) with processing workers
- **Databases**:
  - PostgreSQL: Core relational data
  - Qdrant: Vector embeddings for semantic search
  - Redis: Caching for performance optimization
- **AI Integration**:
  - Gemini Vision API: Document text extraction
  - Embedding Models: Vector generation
  - LLM API: Answer generation

## 📊 System Architecture Diagram

![image](Assets/Readme/ClassUMLDiagram.png)

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- Docker and Docker Compose
- PostgreSQL 14+
- Redis 6+

### Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/yourusername/TanyaJawab.git
   cd TanyaJawab
   ```

2. Set up environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Start the databases using Docker:

   ```bash
   docker-compose up -d postgres redis qdrant
   ```

4. Install backend dependencies:

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

5. Run database migrations:

   ```bash
   alembic upgrade head
   ```

6. Install frontend dependencies:

   ```bash
   cd ../frontend
   npm install
   ```

7. Start the development servers:

   ```bash
   # In one terminal (backend)
   cd backend
   uvicorn app.main:app --reload

   # In another terminal (frontend)
   cd frontend
   npm run dev
   ```

8. Visit `http://localhost:3000` in your browser

### Environment Variables

```
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/TanyaJawab
REDIS_URL=redis://localhost:6379/0
QDRANT_URL=http://localhost:6333

# Authentication
SECRET_KEY=your_secret_key
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# AI Services
GEMINI_API_KEY=your_gemini_api_key
LLM_API_KEY=your_llm_api_key
EMBEDDING_MODEL=text-embedding-ada-002
```

## 🧪 Testing

```bash
# Run backend tests
cd backend
pytest

# Run frontend tests
cd frontend
npm test
```

## 📝 API Documentation

API documentation is available at `/docs` or `/redoc` when running the backend server.

## 🗂️ Project Structure

```
TanyaJawab/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── rag/
│   │   │   ├── document/
│   │   │   └── ...
│   │   └── main.py
│   ├── alembic/
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── contexts/
│   │   └── ...
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🧩 Database Schema

The system uses multiple data stores:

### PostgreSQL Tables

- **users**: User account information
- **courses**: Course and schedule information
- **assignments**: Task tracking with due dates
- **documents**: Document metadata
- **parsed_pages**: Extracted content from document pages

### Qdrant Collections

- **doc_chunks**: Document chunks with embeddings for semantic search

### Redis

- Used for caching extraction results and RAG query responses

## 🔐 Security

- All user data is isolated and secured
- Authentication via GitHub OAuth or secure local authentication
- Document access is restricted to the uploading user
- All sensitive environment variables are kept secure

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔮 Future Enhancements

- Mobile app version
- Support for more document types (DOCX, PPTX)
- Collaborative study sessions
- Spaced repetition flashcards generated from documents
- Advanced analytics on study habits

---

Built with ❤️ for students by students

# TanyaJawab - Detailed Installation Guide

This guide provides comprehensive installation instructions for setting up the TanyaJawab system on your local development environment.

## Prerequisites

Before starting the installation, make sure you have the following prerequisites installed:

- **Python**: Version 3.9 or higher
- **Node.js**: Version 18 or higher
- **Docker & Docker Compose**: Latest stable version
- **Git**: Latest version
- **PostgreSQL** (optional if using Docker): Version 14 or higher
- **Redis** (optional if using Docker): Version 6 or higher

## Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/TanyaJawab.git
cd TanyaJawab
```

## Step 2: Set Up Environment Variables

Create environment files for both backend and frontend:

```bash
# Copy the example environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Backend Environment Variables (.env)

Edit the `backend/.env` file with the following configuration:

```dotenv
# Application Settings
APP_NAME=TanyaJawab
APP_ENV=development
DEBUG=True
LOG_LEVEL=INFO

# Server Settings
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://localhost:3000

# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/TanyaJawab
REDIS_URL=redis://localhost:6379/0
QDRANT_URL=http://localhost:6333

# Authentication
SECRET_KEY=your_very_secure_secret_key
AUTH_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# OAuth Settings (GitHub)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:8000/api/auth/github/callback

# AI Services
GEMINI_API_KEY=your_gemini_api_key
LLM_API_KEY=your_llm_api_key
EMBEDDING_MODEL=text-embedding-ada-002
EMBEDDING_DIMENSION=1536
CHUNK_SIZE=512
CHUNK_OVERLAP=50
```

### Frontend Environment Variables (.env)

Edit the `frontend/.env` file:

```dotenv
VITE_API_BASE_URL=http://localhost:8000/api
VITE_GITHUB_AUTH_URL=http://localhost:8000/api/auth/github
```

## Step 3: Set Up Docker Environment

### Using Docker Compose for Databases Only

This setup runs only the databases in Docker while the application runs locally:

```bash
# Start the required database services
docker-compose up -d postgres redis qdrant
```

The docker-compose.yml file should contain:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: TanyaJawab
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant_data:/qdrant/storage

volumes:
  postgres_data:
  redis_data:
  qdrant_data:
```

### Using Docker for Everything (Optional)

For a full containerized setup, you can use:

```bash
# Build and start all services
docker-compose -f docker-compose.full.yml up -d
```

## Step 4: Backend Setup

### Install Python Dependencies

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Run Database Migrations

```bash
# Apply database migrations
alembic upgrade head
```

### Initialize Qdrant Collections

```bash
# Run the Qdrant initialization script
python scripts/init_qdrant.py
```

### Start the Backend Server

```bash
# Start the FastAPI server with hot reloading
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Step 5: Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## Step 6: Create Admin User (Optional)

```bash
# Run the admin user creation script
cd ../backend
python scripts/create_admin.py
```

## Step 7: Verify Installation

1. Open your browser and navigate to `http://localhost:3000`
2. Register a new account or sign in with GitHub
3. The API documentation is available at `http://localhost:8000/docs`

## Common Issues and Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

```bash
# Check if PostgreSQL container is running
docker ps | grep postgres

# Check PostgreSQL logs
docker logs TanyaJawab-postgres-1
```

### Qdrant Connection Issues

If the RAG system isn't working properly:

```bash
# Verify Qdrant is running
curl http://localhost:6333/collections

# Reinitialize the collections if needed
python scripts/init_qdrant.py --force
```

### API Authentication Issues

If you encounter authentication problems:

1. Verify your SECRET_KEY in the .env file
2. Check GitHub OAuth settings match your application settings
3. Clear browser cookies and try again

## Development Workflows

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Database Migrations

When changing models:

```bash
# Generate migration
alembic revision --autogenerate -m "Description of changes"

# Apply migration
alembic upgrade head
```

### Adding New Dependencies

```bash
# Backend
pip install new-package
pip freeze > requirements.txt

# Frontend
npm install new-package --save
```

## Production Deployment

For production deployment, additional steps are recommended:

1. Use proper SSL/TLS certificates
2. Configure proper web server (Nginx/Apache)
3. Set up monitoring (Prometheus/Grafana)
4. Configure backups for all databases
5. Set `APP_ENV=production` and `DEBUG=False`

---
