const dialogflow = require('dialogflow');

exports.flow = async function(InUUID, Intext, callback){
  // Create a new session
  const sessionClient = new dialogflow.SessionsClient({
      keyFilename: '\config/Buzz-0a0eda1755de.json'
  });
  const sessionPath = sessionClient.sessionPath('buzz-yigwxu', InUUID);

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        // The query to send to the dialogflow agent
        text: Intext,
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
  callback(result);
}