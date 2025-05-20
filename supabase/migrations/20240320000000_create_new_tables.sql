-- Create new tables for the normalized schema

-- Packages table
CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bottles table
CREATE TABLE bottles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bottle_id UUID REFERENCES bottles(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL,
    options JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_bottles_package_id ON bottles(package_id);
CREATE INDEX idx_questions_bottle_id ON questions(bottle_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bottles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to read packages"
    ON packages FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to read bottles"
    ON bottles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to read questions"
    ON questions FOR SELECT
    TO authenticated
    USING (true); 