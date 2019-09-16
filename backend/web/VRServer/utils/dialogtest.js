const dialogflow = require('dialogflow');

// DIALOG
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
  const result = responses[0].queryResult;
  callback(result);
}

// CONTEXT DELETE
exports.ContextDelete = async function(sessionId, callback) {
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');
 
  // Instantiates clients
  const contextsClient = new dialogflow.ContextsClient({
    keyFilename: '\config/Buzz-0a0eda1755de.json'
  });
 
  // The path to identify the agent that owns the contexts.
  const sessionPath = contextsClient.sessionPath('buzz-yigwxu', sessionId);
  const request = {
    parent: sessionPath
  };
  
  const response = await contextsClient.deleteAllContexts(request);
  var tmp = response[0];
  if(tmp != null && typeof tmp == "object" && !Object.keys(tmp).length){
    callback(true);   
  }
  else{
    callback(false);
  }
 }