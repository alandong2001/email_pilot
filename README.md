# Email Pilot


https://github.com/alandong2001/email_pilot/assets/39609410/6f4d3840-118a-4ae4-84ea-78376f69944a



How to use
===============
Requirements: Google account, openai api key

Copy the code to Googe Apps Script
--------------
In the [Apps Script editor](https://script.google.com/), paste the Code.gs content into the Code.gs tab.

To add the appsscript.json content, click on the Project Settings icon (a gear icon), and check the box next to Show "appsscript.json" manifest file in editor. Then paste theh appsscript.json content into this file.

Enable Gmail API
--------------
In the Apps Script editor, click on Services (plus icon next to "Services" in the left sidebar).

Add the Gmail API by selecting it and clicking Add

Register a project in Google Cloud Platform
--------------
Go to [Google Cloud Platform](https://console.cloud.google.com/)

Create a project.

[Optional] Set the relative Credentials and OAuths.

Copy the project number.

Deploy the Add-on
--------------
Click the setting under in the Apps Script editor, and paste the project number to the Google Cloud Platform (GCP) Project.

Click on Deploy > New deployment.

Choose the type as Add-on.

Fill in the details like version, description.

Click Deploy.

Success
--------------
Congratulations! Now when you go to your gmail account, you should see the email pilot on the right bar. You just need to authorize the relative permission to enable its function.
