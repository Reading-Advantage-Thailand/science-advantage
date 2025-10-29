/**
 * Test script to verify OpenAI API key works
 * Run with: npx tsx scripts/test-openai-key.ts
 */

import { config } from 'dotenv';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function testOpenAIKey() {
  console.log('Testing OpenAI API key...\n');

  // Check if key is set
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.AI_RECOMMENDER_MODEL || 'gpt-4o-mini';
  const timeout = parseInt(process.env.AI_RECOMMENDATION_TIMEOUT_MS || '8000', 10);

  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY is not set in environment');
    process.exit(1);
  }

  console.log('✓ OPENAI_API_KEY is set');
  console.log(`✓ Model: ${model}`);
  console.log(`✓ Timeout: ${timeout}ms\n`);

  // Test a simple API call
  try {
    console.log('Making test API call...');

    const schema = z.object({
      answer: z.string(),
      confidence: z.enum(['high', 'medium', 'low']),
    });

    const result = await generateObject({
      model: openai(model),
      schema,
      messages: [
        { role: 'system', content: 'You are a helpful assistant. Keep responses brief.' },
        { role: 'user', content: 'What is 2+2? Respond with just the answer.' },
      ],
    });

    console.log('✅ API call successful!');
    console.log('Response:', result.object);
    console.log('\nThe OpenAI key is working correctly.');

  } catch (error) {
    console.error('❌ API call failed:');
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Stack:', error.stack);
    } else {
      console.error('Unknown error:', error);
    }
    process.exit(1);
  }
}

testOpenAIKey();
