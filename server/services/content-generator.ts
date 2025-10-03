import OpenAI from "openai";
import type { Business } from "@shared/schema";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface GeneratedPost {
  content: string;
  imageUrl: string;
  postType: 'informative' | 'fun_fact' | 'promotional';
}

const DEFAULT_PROMPTS = {
  informative: `Create an informative social media post about pet grooming benefits and tips. 
The post should be educational, engaging, and around 2-3 sentences. 
Focus on topics like coat health, skin care, nail trimming, ear cleaning, or seasonal grooming tips.
Make it valuable for pet owners.`,

  fun_fact: `Create a fun fact post about pets, pet grooming, or pet ownership. 
The post should be entertaining, surprising, and shareable. 
Keep it to 1-2 sentences with an enthusiastic tone. 
Include interesting statistics or little-known facts that pet owners will enjoy.`,

  promotional: `Create a promotional post for a pet grooming business. 
The post should highlight services, special offers, or encourage bookings. 
Keep it friendly and inviting, around 2-3 sentences. 
Include a clear call-to-action without being too salesy.`
};

function getPromptForPostType(business: Business, postType: 'informative' | 'fun_fact' | 'promotional'): string {
  const customPrompts = {
    informative: business.customPromptInformative,
    fun_fact: business.customPromptFunFact,
    promotional: business.customPromptPromotional,
  };

  const customPrompt = customPrompts[postType];
  const defaultPrompt = DEFAULT_PROMPTS[postType];

  if (!customPrompt) {
    return defaultPrompt + `\n\nContext: This is for ${business.businessName}.`;
  }

  return customPrompt;
}

function getImagePromptForPostType(postType: 'informative' | 'fun_fact' | 'promotional', content: string): string {
  const basePrompts = {
    informative: "A professional, clean image of a happy, well-groomed pet (dog or cat) that illustrates the educational content about grooming",
    fun_fact: "A cute, playful image of pets that matches the fun and entertaining tone of the fact",
    promotional: "An inviting, professional pet grooming scene showing happy pets and quality grooming service",
  };

  return `${basePrompts[postType]}. Style: bright, professional, friendly. High quality photograph.`;
}

export async function generateSinglePost(
  business: Business,
  postType: 'informative' | 'fun_fact' | 'promotional'
): Promise<GeneratedPost> {
  const contentPrompt = getPromptForPostType(business, postType);

  const systemPrompt = `You are a social media content creator specializing in pet grooming businesses. Create engaging, professional posts that resonate with pet owners.
  
Business Context:
- Business Name: ${business.businessName}
${business.address ? `- Location: ${business.address}` : ''}
${business.phone ? `- Contact: ${business.phone}` : ''}
${business.website ? `- Website: ${business.website}` : ''}
`;

  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: contentPrompt,
      },
    ],
    temperature: 0.8,
    max_tokens: 200,
  });

  const content = chatCompletion.choices[0]?.message?.content?.trim() || "";

  const imagePrompt = getImagePromptForPostType(postType, content);

  const imageResponse = await openai.images.generate({
    model: "dall-e-3",
    prompt: imagePrompt,
    n: 1,
    size: "1024x1024",
    quality: "standard",
  });

  const imageUrl = imageResponse.data?.[0]?.url || "";

  return {
    content,
    imageUrl,
    postType,
  };
}

export async function generateWeeklyPosts(business: Business): Promise<GeneratedPost[]> {
  const postTypes: Array<'informative' | 'fun_fact' | 'promotional'> = [
    'informative',
    'informative', 
    'informative',
    'fun_fact',
    'fun_fact',
    'promotional',
    'promotional',
  ];

  const posts = await Promise.all(
    postTypes.map(type => generateSinglePost(business, type))
  );

  return posts;
}
