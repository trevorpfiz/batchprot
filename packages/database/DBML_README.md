# DBML Generation for Database Schema

This package includes a script to generate DBML (Database Markup Language) files from the Drizzle ORM schema definitions.

## Generated Files

- `schema.dbml` - The generated DBML file containing all table definitions, relationships, and constraints

## Usage

To generate or update the DBML file, run:

```bash
pnpm generate-dbml
```

This will:
1. Read all schema definitions from `src/schema.ts`
2. Generate a DBML file at `schema.dbml`
3. Include all tables, relationships, indexes, and constraints

## Schema Structure

The generated DBML includes:

### Tables
- **prot_user** - User authentication and profile data
- **prot_session** - User session management
- **prot_account** - OAuth provider accounts
- **prot_verification** - Email verification tokens
- **prot_jwks** - JSON Web Key Sets
- **prot_job** - Protein analysis job records
- **prot_protein_analysis** - Individual protein analysis results
- **prot_feedback** - User feedback submissions

### Enums
- **job_status** - Job processing states (queued, running, succeeded, failed)
- **analysis_type** - Analysis complexity levels (basic, advanced)

### Relationships
- Users can have multiple jobs, sessions, accounts, and feedback entries
- Jobs can have multiple protein analysis results
- All relationships include proper cascade delete constraints

## Visualization

The generated DBML file can be visualized using:
- [dbdiagram.io](https://dbdiagram.io/) - Online database diagram tool
- [dbml-cli](https://github.com/holistics/dbml/tree/master/packages/dbml-cli) - Command line tool for DBML conversion

## Dependencies

The generation script uses:
- `drizzle-dbml-generator` - Converts Drizzle schema to DBML
- `tsx` - TypeScript execution environment

These are installed as dev dependencies and only needed for DBML generation. 
