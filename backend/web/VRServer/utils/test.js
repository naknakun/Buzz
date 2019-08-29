const dialogflow = require('dialogflow');
const uuid = require('uuid');

/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
exports.test = async function runSample(projectId = 'buzz-yigwxu') {
  // A unique identifier for the given session
  const sessionId = uuid.v4();

// Create a new session
const sessionClient = new dialogflow.SessionsClient({
    keyFilename: 'C:/Users/whskrdns/Downloads/Buzz-0a0eda1755de.json'
});
const sessionPath = sessionClient.sessionPath(projectId, sessionId);

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        // The query to send to the dialogflow agent
        text: '두시에 병원 예약해줘',
        // The language used by the client (en-US)
        languageCode: 'ko',
      },
    },
  };

  // Send request and log result
  const responses = await sessionClient.detectIntent(request);
  console.log('Detected intent');
  const result = responses[0].queryResult;
  console.log(`  Query: ${result.queryText}`);
  console.log(`  Response: ${result.fulfillmentText}`);
  if (result.intent) {
    console.log(`  Intent: ${result.intent.displayName}`);
  } else {
    console.log(`  No intent matched.`);
  }
}