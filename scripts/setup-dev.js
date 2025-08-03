const fs = require('fs');
const path = require('path');

console.log('Setting up REST Client development environment...');

// Check if .env.local exists
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
    console.log('Creating environment configuration...');
    const envContent = `# Database Configuration
DATABASE_URL=postgresql://localhost:5432/rest_client_db

# Optional: For development
NODE_ENV=development
`;
    fs.writeFileSync(envPath, envContent);
    console.log('Created .env.local file');
    console.log('Please update DATABASE_URL with your PostgreSQL credentials');
} else {
    console.log('.env.local already exists');
}

console.log('');
console.log('Next steps:');
console.log('1. Create PostgreSQL database: createdb rest_client_db');
console.log('2. Update DATABASE_URL in .env.local with your credentials');
console.log('3. Run the development server: npm run dev');
console.log('');
console.log('Optional: Run the database init script:');
console.log('   npm run db:init');
console.log('');
console.log('Setup complete! Happy coding!');
