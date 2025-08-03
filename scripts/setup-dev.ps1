# Development setup script for REST Client (Windows PowerShell)
Write-Host "🚀 Setting up REST Client development environment..." -ForegroundColor Green

# Check if PostgreSQL is installed
try {
    psql --version | Out-Null
    Write-Host "✅ PostgreSQL found" -ForegroundColor Green
} catch {
    Write-Host "❌ PostgreSQL is not installed. Please install PostgreSQL first." -ForegroundColor Red
    Write-Host "Visit: https://www.postgresql.org/download/" -ForegroundColor Yellow
    exit 1
}

# Check if Node.js is installed
try {
    node --version | Out-Null
    Write-Host "✅ Node.js found" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    Write-Host "Visit: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if pnpm is installed
try {
    pnpm --version | Out-Null
    Write-Host "✅ pnpm found" -ForegroundColor Green
} catch {
    Write-Host "📦 Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
}

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
pnpm install

# Create .env.local if it doesn't exist
if (-not (Test-Path ".env.local")) {
    Write-Host "⚙️ Creating environment configuration..." -ForegroundColor Yellow
    @"
# Database Configuration
DATABASE_URL=postgresql://localhost:5432/rest_client_db

# Optional: For development
NODE_ENV=development
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✅ Created .env.local file" -ForegroundColor Green
    Write-Host "⚠️  Please update DATABASE_URL with your PostgreSQL credentials" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env.local already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Cyan
Write-Host "1. Create PostgreSQL database: createdb rest_client_db" -ForegroundColor White
Write-Host "2. Update DATABASE_URL in .env.local with your credentials" -ForegroundColor White
Write-Host "3. Run the development server: pnpm dev" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Optional: Run the database init script:" -ForegroundColor Cyan
Write-Host "   psql -d rest_client_db -f scripts/init-database.sql" -ForegroundColor White
Write-Host ""
Write-Host "✨ Setup complete! Happy coding!" -ForegroundColor Green
