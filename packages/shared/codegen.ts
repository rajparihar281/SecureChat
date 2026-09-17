import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './schema.graphql',
  documents: ['./src/graphql/operations.graphql'],
  generates: {
    './src/graphql/schema-types.ts': {
      plugins: ['typescript'],
      config: {
        avoidOptionals: false,
        maybeValue: 'T | null | undefined',
        scalars: {
          ID: 'string',
          String: 'string',
          Boolean: 'boolean',
          Int: 'number',
          Float: 'number',
        },
      },
    },
    './src/graphql/generated.ts': {
      plugins: ['typescript-operations'],
      config: {
        importSchemaTypesFrom: './src/graphql/schema-types',
        importExtension: '.js',
        avoidOptionals: false,
        maybeValue: 'T | null | undefined',
        scalars: {
          ID: 'string',
          String: 'string',
          Boolean: 'boolean',
          Int: 'number',
          Float: 'number',
        },
      },
    },
  },
};

export default config;
