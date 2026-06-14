const { GoogleGenAI } = require('@google/genai');

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: 'AIzaSyBJcGsuxMWk9IF6W0U7PG5qT8vPgGB20jk' });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Say hello world'
    });
    console.log('SUCCESS:', response.text);
  } catch (err) {
    console.error('ERROR:', err.message);
  }
}

test();
