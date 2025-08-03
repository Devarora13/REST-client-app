# REST Client Pro

A powerful REST API client built with Next.js, featuring a beautiful dark interface, request history with Neon PostgreSQL storage, and advanced filtering capabilities.

## ✨ Features

- 🌐 **Full HTTP Support**: GET, POST, PUT, DELETE, PATCH methods
- 📱 **Modern UI**: Beautiful dark interface with responsive design
- 📊 **Request History**: Persistent storage with Neon PostgreSQL and MikroORM
- 🔍 **Advanced Search**: Filter by method, status, and search content
- ⚡ **Performance**: Optimized pagination, caching, and optimistic updates
- 🚀 **Real-time**: Instant UI updates with background sync
- 📈 **Analytics**: Response time tracking and status monitoring
- ☁️ **Cloud Ready**: Deployed on Vercel with Neon serverless PostgreSQL

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: Radix UI, Tailwind CSS, Lucide Icons
- **Backend**: Next.js API Routes
- **Database**: Neon PostgreSQL with MikroORM 6.4.16
- **Deployment**: Vercel with automatic schema management
- **Styling**: Tailwind CSS with dark theme
- **State Management**: React Hooks with optimistic updates

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Neon PostgreSQL account (free tier available)
- npm or pnpm (recommended)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Devarora13/REST-client-app.git
   cd REST-client
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Configure Database**
   
   Create a free account at [Neon](https://neon.com) and get your connection string.
   
   Create `.env.local`:
   ```env
   DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require
   NODE_ENV=development
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open Browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

Note: The database schema will be automatically created on first run.

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
- **Pagination**: Navigate through history using Previous/Next buttons or page numbers
- **Reuse**: Click any history item to reload it into the request form

### Performance Features

- **Optimistic Updates**: Instant UI feedback for new requests
- **Smart Caching**: 2-minute cache with intelligent invalidation
- **Pagination**: Efficient loading with 3 items per page
- **Search Debouncing**: 300ms debounce for smooth search experience
- **Background Sync**: Real data synced after optimistic updates

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

- `POST /api/request` - Make HTTP requests and store in history
- `GET /api/history` - Fetch request history with pagination/filtering
- `DELETE /api/history` - Clear all request history
- `POST /api/setup` - Manual database schema creation (production)
- `GET /api/setup` - Check database schema status

### Query Parameters for History

- `page`: Page number (default: 1)
- `limit`: Items per page (max: 50, default: 3)
- `method`: Filter by HTTP method
- `status`: Filter by response status
- `search`: Search in URL and response content

## 🔧 Development

### Project Structure

```
├── app/
│   ├── api/
│   │   ├── request/route.ts     # HTTP request handler
│   │   ├── history/route.ts     # History API with pagination
│   │   └── setup/route.ts       # Database schema management
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                 # Main client interface
├── lib/
│   ├── entities/
│   │   └── RequestHistory.ts    # MikroORM entity
│   ├── mikro-orm.ts            # Database configuration
│   └── utils.ts
├── components/ui/               # Reusable UI components
└── public/                     # Static assets
```

### Environment Variables

```env
# Required
DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require

# Optional
NODE_ENV=development
```

### Database Performance

The application includes several optimizations for handling large datasets:

1. **Optimistic Updates**: Instant UI feedback with background sync
2. **Smart Caching**: Intelligent cache invalidation strategy
3. **Pagination**: Efficient offset-based pagination (3 items per page)
4. **Connection Pooling**: Optimized MikroORM connection management
5. **Automatic Schema**: Self-managing database schema creation

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
   - Check your Neon PostgreSQL connection string
   - Verify DATABASE_URL in `.env.local`
   - Ensure SSL mode is enabled (`?sslmode=require`)

2. **Schema Not Created (Production)**
   - Visit `/api/setup` (POST) to manually create schema
   - Check Vercel deployment logs for schema creation errors

3. **TypeScript Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check Node.js version (18+ required)

4. **Build Errors**
   - Clear Next.js cache: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

### Performance Tips

- Optimistic updates provide instant feedback
- History syncs in background after 1 second
- Cache duration is optimized for responsiveness
- Use Neon's connection pooling for better performance

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Fork this repository**
2. **Connect to Vercel**
   - Import your GitHub repository
   - Vercel will auto-detect Next.js
3. **Configure Environment Variables**
   ```env
   DATABASE_URL=your_neon_connection_string
   ```
4. **Deploy**
   - Vercel will automatically build and deploy
   - Database schema is created automatically on first request

### Manual Deployment

For other platforms:

1. Set up Neon PostgreSQL database
2. Configure environment variables
3. Build the application: `npm run build`
4. Start production server: `npm start`

Note: The application automatically handles schema creation in production.

---

🌐 **Live Demo**: [View on Vercel](https://rest-client-app-jet.vercel.app/)

