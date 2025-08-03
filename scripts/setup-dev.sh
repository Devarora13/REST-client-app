#!/bin/bash

# Development setup script for REST Client
echo "🚀 Setting up REST Client development environment..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    echo "Visit: https://www.postgresql.org/download/"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

echo "📦 Installing dependencies..."
pnpm install

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "⚙️ Creating environment configuration..."
    cat > .env.local << EOL
# Database Configuration
DATABASE_URL=postgresql://localhost:5432/rest_client_db

# Optional: For development
NODE_ENV=development
EOL
    echo "✅ Created .env.local file"
    echo "⚠️  Please update DATABASE_URL with your PostgreSQL credentials"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "🎯 Next steps:"
echo "1. Create PostgreSQL database: createdb rest_client_db"
echo "2. Update DATABASE_URL in .env.local with your credentials"
echo "3. Run the development server: pnpm dev"
echo ""
echo "🔧 Optional: Run the database init script:"
echo "   psql -d rest_client_db -f scripts/init-database.sql"
echo ""
echo "✨ Setup complete! Happy coding!"
