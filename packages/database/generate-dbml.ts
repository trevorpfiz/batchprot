/** biome-ignore-all lint/performance/noNamespaceImport: <explanation> */
import { pgGenerate } from 'drizzle-dbml-generator';
import * as schema from './src/schema';

const out = './schema.dbml';
const relational = true;

pgGenerate({ schema, out, relational });
