import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.GITHUB_TOKEN) {
  throw new Error('GITHUB_TOKEN is not set');
}

export const mcpServersConfig = {
  github: {
    type: 'stdio' as const,
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    env: {
      GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_TOKEN
    }
  },

  eslint: {
    type: 'stdio' as const,
    command: 'npx',
    args: ['-y', '@eslint/mcp@latest'],
    env: {}
  }
};