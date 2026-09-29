import * as dotenv from 'dotenv';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { Orchestrator } from './orchestrator.js';
import { ReportGenerator } from './utils/report-generator.js';

dotenv.config();

function validateAuthentication(): void {
  const hasAnthropicKey =
    Boolean(process.env.ANTHROPIC_API_KEY);

  const hasAwsCredentials =
    Boolean(process.env.AWS_ACCESS_KEY_ID) &&
    Boolean(process.env.AWS_SECRET_ACCESS_KEY);

  if (!hasAnthropicKey && !hasAwsCredentials) {
    throw new Error(
      'Authentication is not configured. Set ANTHROPIC_API_KEY or AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.'
    );
  }

  if (hasAwsCredentials && !process.env.AWS_REGION) {
    throw new Error(
      'AWS authentication detected but AWS_REGION is not set.'
    );
  }
}

function validateModel(): string {
  const model = process.env.ANTHROPIC_MODEL;

  if (!model) {
    throw new Error(
      'ANTHROPIC_MODEL is not set. Set it to a supported Claude model identifier.'
    );
  }

  return model;
}

async function main() {
  const [owner, repo, prStr] =
    process.argv.slice(2);

  if (!owner || !repo || !prStr) {
    console.error(
      'Usage: npm run dev -- <owner> <repo> <pr-number>'
    );
    process.exit(1);
  }

  const prNumber = Number(prStr);

  if (
    !Number.isInteger(prNumber) ||
    prNumber <= 0
  ) {
    console.error(
      'PR number must be a positive integer'
    );
    process.exit(1);
  }

  try {
    validateAuthentication();

    const model = validateModel();

    console.log(`Using model: ${model}`);

    const orchestrator = new Orchestrator({
      model
    });

    const result =
      await orchestrator.reviewPullRequest(
        owner,
        repo,
        prNumber
      );

    const reportGenerator =
      new ReportGenerator();

    const reportsDir = join(
      process.cwd(),
      'reports'
    );

    mkdirSync(reportsDir, {
      recursive: true
    });

    const baseName =
      `${owner}_${repo}_${prNumber}`;

    const jsonPath = join(
      reportsDir,
      `${baseName}.json`
    );

    const markdownPath = join(
      reportsDir,
      `${baseName}.md`
    );

    const htmlPath = join(
      reportsDir,
      `${baseName}.html`
    );

    writeFileSync(
      jsonPath,
      reportGenerator.generateJSONReport(result),
      'utf-8'
    );

    writeFileSync(
      markdownPath,
      reportGenerator.generateMarkdownReport(result),
      'utf-8'
    );

    writeFileSync(
      htmlPath,
      reportGenerator.generateHTMLReport(result),
      'utf-8'
    );

    console.log(
      '\nReview completed successfully.'
    );

    console.log('\nReports generated:');
    console.log(`  JSON:     ${jsonPath}`);
    console.log(`  Markdown: ${markdownPath}`);
    console.log(`  HTML:     ${htmlPath}`);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      `Review failed: ${message}`
    );

    process.exit(1);
  }
}

main();