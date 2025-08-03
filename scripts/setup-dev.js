const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
    const envContent = `DATABASE_URL=postgresql://localhost:5432/rest_client_db
NODE_ENV=development
`;
    fs.writeFileSync(envPath, envContent);
    console.log('Created .env.local');
}

console.log('Run: createdb rest_client_db');
console.log('Then: npm run dev');
