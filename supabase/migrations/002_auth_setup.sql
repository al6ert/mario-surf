-- Create admin role
CREATE TYPE user_role AS ENUM ('admin');

-- Add role column to auth.users
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS role user_role;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Set role to admin for the specific email
  IF NEW.email = 'mariogmm@gmail.com' THEN
    NEW.role = 'admin';
  ELSE
    -- Reject signup for any other email
    RAISE EXCEPTION 'Unauthorized signup attempt';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create RLS policies for each table
-- Clients
CREATE POLICY "Admin full access to clients" ON clients
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'mariogmm@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'mariogmm@gmail.com');

-- Activities
CREATE POLICY "Admin full access to activities" ON activities
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'mariogmm@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'mariogmm@gmail.com');

-- Monitors
CREATE POLICY "Admin full access to monitors" ON monitors
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'mariogmm@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'mariogmm@gmail.com');

-- Bookings
CREATE POLICY "Admin full access to bookings" ON bookings
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'mariogmm@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'mariogmm@gmail.com');

-- Invoices
CREATE POLICY "Admin full access to invoices" ON invoices
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'mariogmm@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'mariogmm@gmail.com');

-- Invoice Items
CREATE POLICY "Admin full access to invoice_items" ON invoice_items
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'mariogmm@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'mariogmm@gmail.com');

-- Expenses
CREATE POLICY "Admin full access to expenses" ON expenses
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'mariogmm@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'mariogmm@gmail.com');

-- Payrolls
CREATE POLICY "Admin full access to payrolls" ON payrolls
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'mariogmm@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'mariogmm@gmail.com');

-- Settings
CREATE POLICY "Admin full access to settings" ON settings
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'mariogmm@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'mariogmm@gmail.com'); 