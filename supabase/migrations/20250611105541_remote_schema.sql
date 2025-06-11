

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."handle_invitation_acceptance"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Check if the invitation exists and is not used
  IF NOT EXISTS (
    SELECT 1 FROM invitations
    WHERE email = NEW.email
    AND used = false
  ) THEN
    RAISE EXCEPTION 'No valid invitation found for this email';
  END IF;

  -- Mark the invitation as used
  UPDATE invitations
  SET used = true
  WHERE email = NEW.email
  AND used = false;

  -- Set the user's role based on the invitation
  NEW.role = (
    SELECT role FROM invitations
    WHERE email = NEW.email
    AND used = true
    ORDER BY created_at DESC
    LIMIT 1
  );

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_invitation_acceptance"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."activities" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "price" numeric(10,2) NOT NULL,
    "duration" integer,
    "max_participants" integer,
    "type" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."activities" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."activities_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."activities_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."activities_id_seq" OWNED BY "public"."activities"."id";



CREATE TABLE IF NOT EXISTS "public"."bookings" (
    "id" integer NOT NULL,
    "client_id" integer,
    "activity_id" integer,
    "monitor_id" integer,
    "date" "date" NOT NULL,
    "time" time without time zone NOT NULL,
    "status" "text" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "bookings_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'confirmed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."bookings" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."bookings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."bookings_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."bookings_id_seq" OWNED BY "public"."bookings"."id";



CREATE TABLE IF NOT EXISTS "public"."clients" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "address" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "dni" "text",
    "notes" "text"
);


ALTER TABLE "public"."clients" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."clients_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."clients_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."clients_id_seq" OWNED BY "public"."clients"."id";



CREATE TABLE IF NOT EXISTS "public"."expenses" (
    "id" integer NOT NULL,
    "description" "text" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "date" "date" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "category" "text" DEFAULT 'other'::"text" NOT NULL,
    "notes" "text"
);


ALTER TABLE "public"."expenses" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."expenses_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."expenses_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."expenses_id_seq" OWNED BY "public"."expenses"."id";



CREATE TABLE IF NOT EXISTS "public"."invitations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "inviter_id" "uuid" NOT NULL,
    "invitee_email" "text" NOT NULL,
    "token" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "inserted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."invitations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invoice_items" (
    "id" integer NOT NULL,
    "invoice_id" integer,
    "description" "text" NOT NULL,
    "quantity" integer NOT NULL,
    "price" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."invoice_items" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."invoice_items_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."invoice_items_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."invoice_items_id_seq" OWNED BY "public"."invoice_items"."id";



CREATE TABLE IF NOT EXISTS "public"."invoices" (
    "id" integer NOT NULL,
    "number" "text" NOT NULL,
    "client_id" integer,
    "date" "date" NOT NULL,
    "status" "text" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "iva_percentage" numeric(5,2) DEFAULT 21 NOT NULL,
    CONSTRAINT "invoices_status_check" CHECK (("status" = ANY (ARRAY['paid'::"text", 'pending'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."invoices" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."invoices_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."invoices_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."invoices_id_seq" OWNED BY "public"."invoices"."id";



CREATE TABLE IF NOT EXISTS "public"."monitors" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "specialty" "text",
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."monitors" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."monitors_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."monitors_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."monitors_id_seq" OWNED BY "public"."monitors"."id";



CREATE TABLE IF NOT EXISTS "public"."payrolls" (
    "id" integer NOT NULL,
    "monitor_id" integer,
    "hours_worked" numeric(5,2) NOT NULL,
    "hourly_rate" numeric(10,2) NOT NULL,
    "date" "date" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "year" integer,
    "month" integer,
    "paid" boolean DEFAULT false,
    "bonus" numeric DEFAULT 0,
    "deductions" numeric DEFAULT 0,
    "notes" "text"
);


ALTER TABLE "public"."payrolls" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."payrolls_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."payrolls_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."payrolls_id_seq" OWNED BY "public"."payrolls"."id";



CREATE TABLE IF NOT EXISTS "public"."settings" (
    "id" integer NOT NULL,
    "iva_percentage" numeric(5,2) DEFAULT 21.00,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "company_name" "text",
    "company_address" "text",
    "company_phone" "text",
    "company_email" "text"
);


ALTER TABLE "public"."settings" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."settings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."settings_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."settings_id_seq" OWNED BY "public"."settings"."id";



ALTER TABLE ONLY "public"."activities" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."activities_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."bookings" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."bookings_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."clients" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."clients_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."expenses" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."expenses_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."invoice_items" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."invoice_items_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."invoices" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."invoices_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."monitors" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."monitors_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."payrolls" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."payrolls_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."settings" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."settings_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_invitee_email_key" UNIQUE ("invitee_email");



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."invoice_items"
    ADD CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."monitors"
    ADD CONSTRAINT "monitors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payrolls"
    ADD CONSTRAINT "payrolls_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."settings"
    ADD CONSTRAINT "settings_pkey" PRIMARY KEY ("id");



CREATE INDEX "invitations_token_idx" ON "public"."invitations" USING "btree" ("token");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_monitor_id_fkey" FOREIGN KEY ("monitor_id") REFERENCES "public"."monitors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_inviter_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoice_items"
    ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payrolls"
    ADD CONSTRAINT "payrolls_employee_id_fkey" FOREIGN KEY ("monitor_id") REFERENCES "public"."monitors"("id") ON DELETE CASCADE;





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."handle_invitation_acceptance"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_invitation_acceptance"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_invitation_acceptance"() TO "service_role";


















GRANT ALL ON TABLE "public"."activities" TO "anon";
GRANT ALL ON TABLE "public"."activities" TO "authenticated";
GRANT ALL ON TABLE "public"."activities" TO "service_role";



GRANT ALL ON SEQUENCE "public"."activities_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."activities_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."activities_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."bookings" TO "anon";
GRANT ALL ON TABLE "public"."bookings" TO "authenticated";
GRANT ALL ON TABLE "public"."bookings" TO "service_role";



GRANT ALL ON SEQUENCE "public"."bookings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bookings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bookings_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."clients" TO "anon";
GRANT ALL ON TABLE "public"."clients" TO "authenticated";
GRANT ALL ON TABLE "public"."clients" TO "service_role";



GRANT ALL ON SEQUENCE "public"."clients_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."clients_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."clients_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."expenses" TO "anon";
GRANT ALL ON TABLE "public"."expenses" TO "authenticated";
GRANT ALL ON TABLE "public"."expenses" TO "service_role";



GRANT ALL ON SEQUENCE "public"."expenses_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."expenses_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."expenses_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."invitations" TO "anon";
GRANT ALL ON TABLE "public"."invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."invitations" TO "service_role";



GRANT ALL ON TABLE "public"."invoice_items" TO "anon";
GRANT ALL ON TABLE "public"."invoice_items" TO "authenticated";
GRANT ALL ON TABLE "public"."invoice_items" TO "service_role";



GRANT ALL ON SEQUENCE "public"."invoice_items_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."invoice_items_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."invoice_items_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."invoices" TO "anon";
GRANT ALL ON TABLE "public"."invoices" TO "authenticated";
GRANT ALL ON TABLE "public"."invoices" TO "service_role";



GRANT ALL ON SEQUENCE "public"."invoices_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."invoices_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."invoices_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."monitors" TO "anon";
GRANT ALL ON TABLE "public"."monitors" TO "authenticated";
GRANT ALL ON TABLE "public"."monitors" TO "service_role";



GRANT ALL ON SEQUENCE "public"."monitors_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."monitors_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."monitors_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."payrolls" TO "anon";
GRANT ALL ON TABLE "public"."payrolls" TO "authenticated";
GRANT ALL ON TABLE "public"."payrolls" TO "service_role";



GRANT ALL ON SEQUENCE "public"."payrolls_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."payrolls_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."payrolls_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."settings" TO "anon";
GRANT ALL ON TABLE "public"."settings" TO "authenticated";
GRANT ALL ON TABLE "public"."settings" TO "service_role";



GRANT ALL ON SEQUENCE "public"."settings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."settings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."settings_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
