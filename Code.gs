/**
 * Function that builds a card for the Gmail add-on.
 * @param {Object} e - the event object containing context information.
 * @return {CardService.Card} - The card to display.
 */

function getConversationHistory() {
  var userProperties = PropertiesService.getUserProperties();
  var historyJson = userProperties.getProperty('conversationHistory');
  return historyJson ? JSON.parse(historyJson) : [];
}

function saveConversationHistory(history) {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('conversationHistory', JSON.stringify(history));
}


function buildAddOn(e) {
  try {
    // Create an initial card with a pre-filled TextInput and a 'Submit' button
    var card = CardService.newCardBuilder();
    var section = CardService.newCardSection()
      .addWidget(CardService.newTextInput()
        .setFieldName('additionalRequirements')
        .setTitle('Message Email Pilot')
        .setValue('Craft a reply')  // Pre-fill the TextInput
        .setMultiline(true)) 
      .addWidget(CardService.newTextButton()
        .setText('Submit')
        .setOnClickAction(CardService.newAction()
          .setFunctionName('processUserInput')
          .setParameters({messageId: e.messageMetadata.messageId, accessToken: e.messageMetadata.accessToken})));
    card.addSection(section);
    
    // Add conversation history management as per your implementation
    var conversationHistory = []; 
    if (e.messageMetadata) {
      var accessToken = e.messageMetadata.accessToken;
      var messageId = e.messageMetadata.messageId;
      GmailApp.setCurrentMessageAccessToken(accessToken);
      var message = GmailApp.getMessageById(messageId);
      var subject = message.getSubject();
      var snippet = message.getPlainBody();
    }
    
    // ... Initialize and manage conversationHistory as needed
    conversationHistory.push({ role: "system", content: "You are a helpful email assistant. Your job is to help user craft email response[Do not include subject]." + 
                              'The subject is: ' + subject + '\n' + 'The email messages(from latest to oldest): ' + snippet})
    saveConversationHistory(conversationHistory)
    return card.build();


  } catch (error) {
    console.error('Error in buildAddOn:', error.message, error.stack);
    return createErrorCard('An error occurred while building the add-on.');
  }
}

function processUserInput(e) {
  try {
    // Retrieve user input and message details
    var additionalRequirements = e.formInput.additionalRequirements;

    var conversationHistory = getConversationHistory()
    conversationHistory.push({ role: "user", content: additionalRequirements });

    //
    console.log(conversationHistory)


    // Call the new API function with the dialogue history
    var updatedReply = callOpenAiApi(conversationHistory)
    conversationHistory.push({ role: "assistant", content: updatedReply });
    saveConversationHistory(conversationHistory)

    // Create a new card to show the entire conversation history
    var card = CardService.newCardBuilder();
    var section = CardService.newCardSection();

    // Loop through the conversation history and add each piece to the card
    conversationHistory.slice(1).forEach(function(message) {
      var contentWidget = CardService.newKeyValue()
        .setTopLabel(message.role === "user" ? "You" : "Assistant")
        .setContent(message.content)
        .setMultiline(true);

      section.addWidget(contentWidget);
    });


    // Add the text input and submit button again for further interaction
    section.addWidget(CardService.newTextInput()
      .setFieldName('additionalRequirements')
      .setTitle('Message email pilot')
      .setMultiline(true)); // Ensure the widget supports multiple lines
    section.addWidget(CardService.newTextButton()
      .setText('Submit')
      .setOnClickAction(CardService.newAction()
        .setFunctionName('processUserInput')
        .setParameters({}))); // Add necessary parameters

    card.addSection(section);

    return CardService.newNavigation().updateCard(card.build());

  } catch (error) {
    console.error('Error in processUserInput:', error.message, error.stack);
    return createErrorCard('An error occurred while processing the input.');
  }
}




// Helper function to create a card displaying an error message
function createErrorCard(errorMessage) {
  var section = CardService.newCardSection()
    .addWidget(CardService.newTextParagraph().setText(errorMessage));

  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle('Error'))
    .addSection(section)
    .build();
}

function callOpenAiApi(chatHistory, temperature = 0.4, model = "gpt-3.5-turbo-1106") {
  const SECRET_KEY = "Your openai api key";
  const url = "https://api.openai.com/v1/chat/completions";
  const payload = {
    model: model,
    messages: chatHistory,
    temperature: temperature,
  };
  const options = {
    contentType: "application/json",
    headers: { Authorization: "Bearer " + SECRET_KEY },
    payload: JSON.stringify(payload),
  };
  const res = JSON.parse(UrlFetchApp.fetch(url, options).getContentText());
  return res.choices[0].message.content.trim();
}





