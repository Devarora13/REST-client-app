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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_request_history_created_at ON request_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_request_history_method ON request_history(method);
CREATE INDEX IF NOT EXISTS idx_request_history_status ON request_history(status);

-- Insert some sample data for testing
INSERT INTO request_history (method, url, headers, body, response, status, response_time, created_at) VALUES
('GET', 'https://jsonplaceholder.typicode.com/posts/1', '{"Content-Type": "application/json"}', NULL, '{"userId": 1, "id": 1, "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit", "body": "quia et suscipit..."}', 200, 245, NOW() - INTERVAL '1 hour'),
('POST', 'https://jsonplaceholder.typicode.com/posts', '{"Content-Type": "application/json"}', '{"title": "foo", "body": "bar", "userId": 1}', '{"id": 101, "title": "foo", "body": "bar", "userId": 1}', 201, 312, NOW() - INTERVAL '30 minutes'),
('GET', 'https://jsonplaceholder.typicode.com/users', '{}', NULL, '[{"id": 1, "name": "Leanne Graham", "username": "Bret", "email": "Sincere@april.biz"}]', 200, 189, NOW() - INTERVAL '15 minutes');
