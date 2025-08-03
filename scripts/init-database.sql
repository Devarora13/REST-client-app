-- Initialize PostgreSQL database for REST Client
-- Run this script to create the database and set up the schema

-- Create database (run this as postgres superuser)
-- CREATE DATABASE rest_client_db;
-- CREATE USER rest_client_user WITH PASSWORD 'your_secure_password';
-- GRANT ALL PRIVILEGES ON DATABASE rest_client_db TO rest_client_user;

-- Connect to the database
-- \c rest_client_db;

-- Create the request_history table
CREATE TABLE IF NOT EXISTS request_history (
    id SERIAL PRIMARY KEY,
    method VARCHAR(10) NOT NULL,
    url TEXT NOT NULL,
    headers JSONB NOT NULL DEFAULT '{}',
    body TEXT,
    response TEXT NOT NULL,
    status INTEGER NOT NULL,
    response_time INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance with large datasets
CREATE INDEX IF NOT EXISTS idx_request_history_created_at ON request_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_request_history_method ON request_history(method);
CREATE INDEX IF NOT EXISTS idx_request_history_status ON request_history(status);
CREATE INDEX IF NOT EXISTS idx_request_history_url_gin ON request_history USING gin(to_tsvector('english', url));
CREATE INDEX IF NOT EXISTS idx_request_history_response_gin ON request_history USING gin(to_tsvector('english', response));

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_request_history_method_status ON request_history(method, status);
CREATE INDEX IF NOT EXISTS idx_request_history_status_created_at ON request_history(status, created_at DESC);

-- Insert some sample data for testing (optional)
INSERT INTO request_history (method, url, headers, body, response, status, response_time, created_at) VALUES
('GET', 'https://jsonplaceholder.typicode.com/posts/1', '{"Content-Type": "application/json"}', NULL, '{"userId": 1, "id": 1, "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit", "body": "quia et suscipit..."}', 200, 245, NOW() - INTERVAL '1 hour'),
('POST', 'https://jsonplaceholder.typicode.com/posts', '{"Content-Type": "application/json"}', '{"title": "foo", "body": "bar", "userId": 1}', '{"id": 101, "title": "foo", "body": "bar", "userId": 1}', 201, 312, NOW() - INTERVAL '30 minutes'),
('GET', 'https://jsonplaceholder.typicode.com/users', '{}', NULL, '[{"id": 1, "name": "Leanne Graham", "username": "Bret", "email": "Sincere@april.biz"}]', 200, 189, NOW() - INTERVAL '15 minutes'),
('PUT', 'https://jsonplaceholder.typicode.com/posts/1', '{"Content-Type": "application/json"}', '{"id": 1, "title": "updated title", "body": "updated body", "userId": 1}', '{"id": 1, "title": "updated title", "body": "updated body", "userId": 1}', 200, 298, NOW() - INTERVAL '45 minutes'),
('DELETE', 'https://jsonplaceholder.typicode.com/posts/1', '{}', NULL, '{}', 200, 156, NOW() - INTERVAL '20 minutes')
ON CONFLICT DO NOTHING;
