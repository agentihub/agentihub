import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  client: '@hey-api/client-fetch',
  // Replace with your backend API OpenAPI documentation URL
  input: 'http://localhost:8080/v3/api-docs/agent-ihub',
  output: {
    format: 'prettier',
    path: './src/api',
  },
  types: {
    dates: 'types+transform',
    enums: 'typescript',
  },
  plugins: ['@tanstack/react-query'],
});
