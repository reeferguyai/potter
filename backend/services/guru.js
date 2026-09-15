import OpenAI from 'openai';

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const model = process.env.OPENAI_MODEL || 'gpt-5.5';

const instructions = `You are GanjaGuru, the intelligence layer of PotGrowHub. Be technically deep, evidence-aware, safety-conscious, and practical. Teach rather than preach. Distinguish established cultivation knowledge from uncertainty. Do not provide instructions that facilitate illegal activity; keep advice focused on lawful cultivation, horticulture, hemp, plant science, equipment, compliance, design, and commerce.`;

export async function askGuru(input, previousResponseId) {
  if (!client) return { configured: false, text: 'GanjaGuru API is not configured yet. Set OPENAI_API_KEY on the server.', responseId: null };
  const response = await client.responses.create({
    model,
    instructions,
    input,
    ...(previousResponseId ? { previous_response_id: previousResponseId } : {})
  });
  return { configured: true, text: response.output_text || '', responseId: response.id };
}
