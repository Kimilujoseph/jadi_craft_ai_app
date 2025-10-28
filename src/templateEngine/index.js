import Category from '../models/Category.js';

/**
 * Builds a refined, persona-driven prompt for the LLM based on the query's category.
 * The persona is a "wise, cultural storyteller and guide."
 */
class TemplateEngine {
  /**
   * @param {Category} category The category of the query.
   * @param {string} query The original user query.
   *  @param {Array<Object>} [promotedLinks=[]] An array of high-scoring marketplace listings.
   * @returns {string} The refined prompt.
   */
  buildPrompt(category, query,promotedLinks = []) {
    console.log(`Building storytelling prompt for category: "${category}"`);

    // The core persona for the AI. It's a storyteller and guide.
    const persona = `You are a wise and engaging cultural storyteller. Your voice is warm, knowledgeable, and slightly informal, making it perfect for audio. Your purpose is to bridge the gap between technology and tradition by telling compelling stories and providing practical, immersive guidance. Never be generic. Always end your response with a thoughtful, open-ended question to encourage a deeper conversation.`;

    let specificInstruction = '';

    switch (category) {
      case Category.PEOPLE:
        specificInstruction = `Tell me the story of the person or people in this query. Don't just list facts. Describe their character, their impact, and a memorable anecdote about them. Make them come alive.`;
        break;

      case Category.PERIOD:
        specificInstruction = `Describe this historical period as if I were there. What did it look, sound, and feel like? Paint a vivid picture of the time, focusing on the daily lives of the people.`;
        break;

      case Category.BELIEF:
        specificInstruction = `Explain this belief or myth like a village elder sharing wisdom by the fireside. Use allegory and metaphor to explain its meaning and its role in the community's life.`;
        break;

      case Category.MODERN:
        specificInstruction = `Discuss the modern-day context of this topic as the next chapter in an ongoing story. How is this tradition adapting, evolving, and finding new life today? Share a story of resilience or change.`;
        break;

      case Category.FOOD:
        specificInstruction = `You are a cultural chef and storyteller. Describe the significance of this dish and what it tastes like. Then, provide a simple, step-by-step recipe that someone could follow at home. Conclude by asking a question about their cooking experience or the ingredients.`;
        break;

      case Category.ARTIFACTS:
        specificInstruction = `Describe this artifact not as an object, but as something with a life of its own. Tell the story of how it's made, who makes it, what it's used for, and the journey it takes.`;
        break;

      case Category.LANGUAGE:
        specificInstruction = `You are a friendly language tutor. Teach a few key phrases related to the query. For each phrase, explain its literal meaning, its cultural context, and a situation where it would be used. Speak clearly and simply.`;
        break;

      case Category.CLOTHING:
        specificInstruction = `You are a cultural fashion guide. Describe this traditional attire with passion. Explain the meaning of the colors, the fabrics, and the accessories. Provide practical guidance on how it's worn and for what occasions.`;
        break;

      case Category.CUSTOMS:
        specificInstruction = `Explain this custom or ritual by telling the story behind it. Why did it begin? What does it symbolize? Walk me through the experience step-by-step, focusing on the emotions and community spirit involved.`;
        break;

      // All shopping-related categories get a unified, helpful prompt.
      case Category.SHOPPING:
      case Category.GIFTS:
      case Category.HANDMADE:
      case Category.CRAFTS:
      case Category.POTTERY:
      case Category.ART:
        specificInstruction = `You are a helpful marketplace guide. The user wants to find authentic crafts. Your response should be warm and encouraging. If there are sponsored links available, weave them naturally into your answer as helpful suggestions. If not, provide general, encouraging advice on what to look for when buying authentic goods.`;
        break;

      default:
        specificInstruction = `Answer the user's query in a way that is engaging, culturally sensitive, and tells a story. Find the human element in the topic.`;
        break;
    }

    //  Logic to include promoted links in the prompt
   let promotedLinksContext = '';
    if (promotedLinks.length > 0) {
    promotedLinksContext = '\n\n**CRITICAL INSTRUCTION:** The following links are highly relevant to the user\'s query and MUST be included in your answer if it feels natural and helpful. You MUST explicitly label them as **[PROMOTED]**. \n\n**PROMOTED LINKS:**\n';
 
     for (const link of promotedLinks) {
     promotedLinksContext += `* **[PROMOTED] ${link.title}**: ${link.url} (Description: ${link.description || 'N/A'})\n`;
   }
     promotedLinksContext += '\n';
      }
    // Combine the persona, the specific instruction, and the user's query.
    return `
      ${persona}

      Your specific task for this query:
      ${specificInstruction}

      The user's question is: "${query}"
    `;
  }
}

const templateEngine = new TemplateEngine();
export default templateEngine;
