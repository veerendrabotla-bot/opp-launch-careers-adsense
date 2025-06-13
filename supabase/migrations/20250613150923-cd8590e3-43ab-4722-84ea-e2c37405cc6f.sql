
-- Create user profiles table
CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE,
    email text,
    name text,
    college text,
    branch text,
    location text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (id)
);

-- Create opportunities table
CREATE TABLE public.opportunities (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    type text NOT NULL CHECK (type IN ('Internship', 'Contest', 'Event', 'Scholarship')),
    domain text NOT NULL,
    location text,
    company text,
    tags text[] DEFAULT '{}',
    deadline date NOT NULL,
    source_url text NOT NULL,
    submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    is_approved boolean DEFAULT false,
    is_expired boolean DEFAULT false,
    views integer DEFAULT 0,
    applications integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create bookmarks table
CREATE TABLE public.bookmarks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    opportunity_id uuid REFERENCES public.opportunities(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, opportunity_id)
);

-- Create resumes table
CREATE TABLE public.resumes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    file_url text,
    extracted_text text,
    match_score integer,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create job descriptions table
CREATE TABLE public.job_descriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    text text NOT NULL,
    extracted_keywords text[],
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create resume audits table
CREATE TABLE public.resume_audits (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    resume_id uuid REFERENCES public.resumes(id) ON DELETE CASCADE,
    jd_id uuid REFERENCES public.job_descriptions(id) ON DELETE CASCADE,
    match_score integer NOT NULL,
    missing_skills text[],
    suggestions text[],
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_audits ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Opportunities policies
CREATE POLICY "Opportunities are viewable by everyone" ON public.opportunities
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert opportunities" ON public.opportunities
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own opportunities" ON public.opportunities
    FOR UPDATE USING (auth.uid() = submitted_by);

-- Bookmarks policies
CREATE POLICY "Users can view own bookmarks" ON public.bookmarks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" ON public.bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks
    FOR DELETE USING (auth.uid() = user_id);

-- Resumes policies
CREATE POLICY "Users can view own resumes" ON public.resumes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes" ON public.resumes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes" ON public.resumes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes" ON public.resumes
    FOR DELETE USING (auth.uid() = user_id);

-- Job descriptions policies
CREATE POLICY "Users can view own job descriptions" ON public.job_descriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own job descriptions" ON public.job_descriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Resume audits policies
CREATE POLICY "Users can view own resume audits" ON public.resume_audits
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.resumes 
            WHERE resumes.id = resume_audits.resume_id 
            AND resumes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own resume audits" ON public.resume_audits
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.resumes 
            WHERE resumes.id = resume_audits.resume_id 
            AND resumes.user_id = auth.uid()
        )
    );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', ''));
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert some sample opportunities for testing
INSERT INTO public.opportunities (title, description, type, domain, location, company, tags, deadline, source_url, is_approved) VALUES
('Frontend Developer Internship', 'Join our dynamic team to build cutting-edge web applications using React and TypeScript. Work with experienced developers and contribute to meaningful projects.', 'Internship', 'Tech', 'Remote', 'TechCorp', ARRAY['React', 'TypeScript', 'Frontend'], '2024-07-15', 'https://internshala.com/internship/detail/frontend-developer-internship-at-tech-company1703', true),
('Google Summer of Code 2024', 'Contribute to open source projects and get mentored by industry experts. Work on cutting-edge technology projects with global impact.', 'Contest', 'Tech', 'Remote', 'Google', ARRAY['Open Source', 'Programming', 'Mentorship'], '2024-06-30', 'https://summerofcode.withgoogle.com', true),
('Women in Tech Scholarship', 'Scholarship program supporting women pursuing careers in technology. Get financial support and mentorship for your tech journey.', 'Scholarship', 'Tech', 'India', 'TechFoundation', ARRAY['Women', 'Scholarship', 'Tech'], '2024-08-01', 'https://example.com/scholarship', true),
('Design Thinking Workshop', 'Learn design thinking methodologies from industry professionals. Interactive workshop with hands-on projects and real case studies.', 'Event', 'Design', 'Mumbai', 'DesignHub', ARRAY['Design', 'Workshop', 'UX'], '2024-06-25', 'https://unstop.com/events/design-workshop', true),
('Data Science Bootcamp', 'Intensive 3-month bootcamp covering machine learning, data analysis, and AI. Get hands-on experience with real datasets.', 'Event', 'Tech', 'Bangalore', 'DataCorp', ARRAY['Data Science', 'Machine Learning', 'AI'], '2024-07-20', 'https://example.com/bootcamp', true);

-- Enable realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.opportunities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookmarks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
