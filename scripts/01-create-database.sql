-- Create database schema for Skill Swap Platform

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    profile_photo VARCHAR(500),
    is_public BOOLEAN DEFAULT true,
    availability TEXT[], -- Array of availability slots
    role VARCHAR(20) DEFAULT 'user', -- 'user' or 'admin'
    is_banned BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'offered' or 'wanted'
    description TEXT,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Swap requests table
CREATE TABLE IF NOT EXISTS swap_requests (
    id SERIAL PRIMARY KEY,
    requester_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    offered_skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    wanted_skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'completed', 'cancelled'
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ratings table
CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    swap_request_id INTEGER REFERENCES swap_requests(id) ON DELETE CASCADE,
    rater_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rated_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin messages table
CREATE TABLE IF NOT EXISTS admin_messages (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'announcement', -- 'announcement', 'update', 'maintenance'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user
INSERT INTO users (email, password_hash, name, role, is_public, availability) 
VALUES (
    'admin@skillswap.com', 
    '$2b$10$rQZ9QmjlhQZ9QmjlhQZ9Qu', -- password: admin123
    'Admin User', 
    'admin', 
    true, 
    ARRAY['weekdays', 'weekends']
) ON CONFLICT (email) DO NOTHING;

-- Insert sample users
INSERT INTO users (email, password_hash, name, location, is_public, availability) VALUES
('john@example.com', '$2b$10$rQZ9QmjlhQZ9QmjlhQZ9Qu', 'John Doe', 'New York, NY', true, ARRAY['weekends', 'evenings']),
('sarah@example.com', '$2b$10$rQZ9QmjlhQZ9QmjlhQZ9Qu', 'Sarah Chen', 'San Francisco, CA', true, ARRAY['weekdays']),
('mike@example.com', '$2b$10$rQZ9QmjlhQZ9QmjlhQZ9Qu', 'Mike Johnson', 'Austin, TX', true, ARRAY['weekends'])
ON CONFLICT (email) DO NOTHING;

-- Insert sample skills
INSERT INTO skills (user_id, name, type, description, is_approved) VALUES
(2, 'React Development', 'offered', 'Frontend development with React and TypeScript', true),
(2, 'Photography', 'wanted', 'Portrait and landscape photography basics', true),
(3, 'UI/UX Design', 'offered', 'User interface and experience design', true),
(3, 'Spanish Language', 'wanted', 'Conversational Spanish for beginners', true),
(4, 'Guitar Lessons', 'offered', 'Acoustic guitar for beginners and intermediate', true),
(4, 'Web Development', 'wanted', 'Full-stack web development', true);
