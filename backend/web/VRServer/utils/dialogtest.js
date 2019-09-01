const dialogflow = require('dialogflow');
const uuid = require('uuid');

exports.test = async function(res){
  // A unique identifier for the given session
  const sessionId = uuid.v4();

  // Create a new session
  const sessionClient = new dialogflow.SessionsClient({
      keyFilename: '\config/Buzz-0a0eda1755de.json'
  });
  const sessionPath = sessionClient.sessionPath('buzz-yigwxu', sessionId);

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
  res.json(result);
}