-- Insert sample data for testing

-- Insert settings
INSERT INTO settings (invoice_prefix, invoice_sequence, iva_percentage, company_name, company_address, company_phone, company_email)
VALUES ('FAC', 3, 21.00, 'Turismo Activo Aventura', 'Calle del Mar, 123, Playa del Sol', '900 123 456', 'info@turismoactivoaventura.com');

-- Insert clients
INSERT INTO clients (name, email, phone, dni, notes)
VALUES 
    ('Juan Pérez', 'juan@example.com', '600111222', '12345678A', 'Cliente habitual'),
    ('María García', 'maria@example.com', '600222333', '87654321B', ''),
    ('Carlos López', 'carlos@example.com', '600333444', '45678912C', 'Prefiere clases por la tarde');

-- Insert activities
INSERT INTO activities (name, description, duration, price, max_participants, type)
VALUES 
    ('Surf Iniciación', 'Clase básica de surf para principiantes', 2.00, 40.00, 8, 'surf'),
    ('Paddle Surf', 'Clase de paddle surf en aguas tranquilas', 1.50, 30.00, 6, 'paddle'),
    ('Kitesurf', 'Clase avanzada de kitesurf', 3.00, 80.00, 4, 'kitesurf');

-- Insert monitors
INSERT INTO monitors (name, email, phone, specialty, active)
VALUES 
    ('Ana Martínez', 'ana@surfschool.com', '611111111', 'Surf, Paddle Surf', true),
    ('David Sánchez', 'david@surfschool.com', '622222222', 'Kitesurf', true),
    ('Laura Gómez', 'laura@surfschool.com', '633333333', 'Surf, Yoga', false);

-- Insert bookings
INSERT INTO bookings (client_id, activity_id, monitor_id, date, time, status, notes)
VALUES 
    (1, 1, 1, CURRENT_DATE, '10:00', 'confirmed', 'Primera clase de surf'),
    (2, 2, 2, CURRENT_DATE, '12:00', 'confirmed', ''),
    (3, 1, 1, CURRENT_DATE + INTERVAL '1 day', '15:00', 'pending', 'Esperando confirmación de pago');

-- Insert invoices
INSERT INTO invoices (number, client_id, date, status, notes)
VALUES 
    ('2023-001', 1, CURRENT_DATE - INTERVAL '5 days', 'paid', 'Pago en efectivo'),
    ('2023-002', 2, CURRENT_DATE, 'pending', 'Pendiente de transferencia');

-- Insert invoice items
INSERT INTO invoice_items (invoice_id, description, quantity, price)
VALUES 
    (1, 'Clase de surf', 1, 40.00),
    (2, 'Clase de paddle surf', 2, 30.00);

-- Insert expenses
INSERT INTO expenses (description, amount, date, category, notes)
VALUES 
    ('Compra de tablas de surf', 1200.00, CURRENT_DATE - INTERVAL '10 days', 'equipment', '3 tablas nuevas'),
    ('Material de oficina', 85.50, CURRENT_DATE, 'supplies', '');

-- Insert payrolls
INSERT INTO payrolls (monitor_id, month, year, hours, hourly_rate, bonus, deductions, notes, paid)
VALUES 
    (1, EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE), 80.00, 12.00, 100.00, 50.00, 'Horas extras incluídas', true),
    (2, EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE), 60.00, 15.00, 0.00, 30.00, '', false); 