# REST Client Pro

A powerful REST API client built with Next.js, featuring a beautiful dark interface, request history with PostgreSQL storage, and advanced filtering capabilities.

![REST Client Pro](public/placeholder-logo.svg)

## ✨ Features

- 🌐 **Full HTTP Support**: GET, POST, PUT, DELETE, PATCH methods
- 📱 **Modern UI**: Beautiful dark interface with responsive design
- 📊 **Request History**: Persistent storage with PostgreSQL and MikroORM
- 🔍 **Advanced Search**: Filter by method, status, and search content
- ⚡ **Performance**: Optimized pagination, lazy loading, and caching
- 🚀 **Real-time**: No page reloads, instant responses
- 📈 **Analytics**: Response time tracking and status monitoring

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: Radix UI, Tailwind CSS, Lucide Icons
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with MikroORM
- **Styling**: Tailwind CSS with dark theme
- **State Management**: React Hooks

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd REST-client
   ```

2. **Run setup script** (Windows)
   ```powershell
   .\scripts\setup-dev.ps1
   ```
   
   Or manually:
   ```bash
   pnpm install
   ```

3. **Configure Database**
   
   Create a PostgreSQL database:
   ```sql
   createdb rest_client_db
   ```
   
   Update `.env.local`:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/rest_client_db
   NODE_ENV=development
   ```

4. **Initialize Database** (Optional - MikroORM will auto-create tables)
   ```bash
   psql -d rest_client_db -f scripts/init-database.sql
   ```

5. **Start Development Server**
   ```bash
   pnpm dev
   ```

6. **Open Browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### Making Requests

1. Select HTTP method (GET, POST, PUT, DELETE, PATCH)
2. Enter the URL
3. Add headers (optional): `Content-Type: application/json`
4. Add request body (for POST/PUT/PATCH)
5. Click "Send"

### Request History

- **Search**: Use the search bar to find requests by URL or response content
- **Filter**: Filter by HTTP method or response status
- **Load More**: Click "Load More" to fetch additional history items
- **Reuse**: Click any history item to reload it into the request form

### Performance Features

- **Pagination**: Efficient loading of large datasets (10 items per page)
- **Caching**: Response caching with appropriate cache headers
- **Lazy Loading**: Load more items on demand
- **Search Debouncing**: 300ms debounce for smooth search experience
- **Database Indexing**: Optimized queries with proper indexes

## 🏗️ Architecture

### Database Schema

```sql
CREATE TABLE request_history (
    id SERIAL PRIMARY KEY,
    method VARCHAR(10) NOT NULL,
    url TEXT NOT NULL,
    headers JSONB DEFAULT '{}',
    body TEXT,
    response TEXT NOT NULL,
    status INTEGER NOT NULL,
    response_time INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### API Endpoints

- `POST /api/request` - Make HTTP requests
- `GET /api/history` - Fetch request history with pagination/filtering
- `DELETE /api/history` - Clear all request history

### Query Parameters for History

- `page`: Page number (default: 1)
- `limit`: Items per page (max: 50, default: 10)
- `method`: Filter by HTTP method
- `status`: Filter by response status
- `search`: Search in URL and response content

## 🔧 Development

### Project Structure

```
├── app/
│   ├── api/
│   │   ├── request/route.ts     # HTTP request handler
│   │   └── history/route.ts     # History API
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                 # Main client interface
├── lib/
│   ├── entities/
│   │   └── RequestHistory.ts    # MikroORM entity
│   ├── mikro-orm.ts            # Database configuration
│   └── utils.ts
├── components/ui/               # Reusable UI components
├── scripts/
│   ├── init-database.sql       # Database initialization
│   ├── setup-dev.ps1          # Windows setup script
│   └── setup-dev.sh           # Unix setup script
└── public/                     # Static assets
```

### Environment Variables

```env
# Required
DATABASE_URL=postgresql://username:password@localhost:5432/rest_client_db

# Optional
NODE_ENV=development
```

### Database Performance

The application includes several optimizations for handling large datasets:

1. **Indexing**: Multiple indexes on commonly queried fields
2. **Pagination**: Efficient offset-based pagination
3. **Field Selection**: Only fetch required fields
4. **Response Truncation**: Large responses truncated in history view
5. **Connection Pooling**: Optimized database connection management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check PostgreSQL is running
   - Verify DATABASE_URL in `.env.local`
   - Ensure database exists

2. **TypeScript Errors**
   - Run `pnpm install` to ensure all dependencies are installed
   - Check Node.js version (18+ required)

3. **Build Errors**
   - Clear Next.js cache: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && pnpm install`

### Performance Tips

- Use appropriate indexes for custom queries
- Monitor database query performance
- Consider implementing response compression for large datasets
- Use Redis for caching in production

## 🚀 Deployment

For production deployment:

1. Set up PostgreSQL database
2. Configure environment variables
3. Build the application: `pnpm build`
4. Start production server: `pnpm start`

Consider using platforms like Vercel, Railway, or Docker for easy deployment.

---

Built with ❤️ using Next.js and PostgreSQL
