import * as functions from 'firebase-functions';

// Створюємо тестову функцію, яка буде відповідати на HTTP запити
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.json({message: "Hello from Firebase!"});
});