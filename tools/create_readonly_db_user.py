"""Create a read-only PostgreSQL login for teammates.

Usage (from the backend virtual environment):
    python tools/create_readonly_db_user.py

You will be asked for the Render EXTERNAL database URL (owner login) and a
password for the new read-only user. Nothing is saved to disk.
"""
from getpass import getpass

import psycopg
from psycopg import sql

ROLE = "team_readonly"

owner_url = getpass("Paste the External Database URL (hidden): ").strip()
password = getpass(f"Choose a password for '{ROLE}' (hidden): ").strip()
if len(password) < 12:
    raise SystemExit("Use a password of at least 12 characters.")

with psycopg.connect(owner_url, autocommit=True) as conn:
    db = conn.info.dbname
    exists = conn.execute("SELECT 1 FROM pg_roles WHERE rolname = %s", (ROLE,)).fetchone()
    if exists:
        conn.execute(sql.SQL("ALTER ROLE {} WITH LOGIN PASSWORD {}").format(sql.Identifier(ROLE), sql.Literal(password)))
        print(f"Updated password for existing user '{ROLE}'.")
    else:
        conn.execute(sql.SQL("CREATE ROLE {} WITH LOGIN PASSWORD {}").format(sql.Identifier(ROLE), sql.Literal(password)))
        print(f"Created user '{ROLE}'.")
    for stmt in (
        sql.SQL("GRANT CONNECT ON DATABASE {} TO {}").format(sql.Identifier(db), sql.Identifier(ROLE)),
        sql.SQL("GRANT USAGE ON SCHEMA public TO {}").format(sql.Identifier(ROLE)),
        sql.SQL("GRANT SELECT ON ALL TABLES IN SCHEMA public TO {}").format(sql.Identifier(ROLE)),
        sql.SQL("ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO {}").format(sql.Identifier(ROLE)),
    ):
        conn.execute(stmt)
    host = conn.info.host

print("\nShare these with your teammates (read-only):")
print(f"  Host:     {host}")
print("  Port:     5432")
print(f"  Database: {db}")
print(f"  Username: {ROLE}")
print("  Password: (the one you just chose)")
print("  SSL mode: require")
