import Anthropic from "@anthropic-ai/sdk";
// Non-generative, authenticated metadata check. The SDK consumes the secret;
// only public model IDs or a safe status are printed.
try {
  const client = new Anthropic({ timeout: 10000, maxRetries: 0 });
  const result = await client.models.list({ limit: 100 });
  console.log(JSON.stringify({ availableModels: result.data.map((model) => ({ id: model.id, name: model.display_name })) }));
} catch (error) {
  console.log(JSON.stringify({ verified: false, httpStatus: (error as { status?: number }).status ?? null }));
  process.exitCode = 1;
}
