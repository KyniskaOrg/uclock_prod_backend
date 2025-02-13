const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const mime = require("mime-types");

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

// Authenticate with Google Drive API
const auth = new google.auth.GoogleAuth({
    credentials: {
    type: process.env.gapi_type,
    project_id: process.env.project_id,
    private_key_id: process.env.private_key_id,
    private_key:process.env.private_key,
    client_email:process.env.client_email,
    client_id: process.env.client_id,
    auth_uri: process.env.auth_uri,
    token_uri: process.env.token_uri,
    auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
    client_x509_cert_url:process.env.client_x509_cert_url,
    universe_domain: process.env.universe_domain,
  },
  scopes: SCOPES,
});

const drive = google.drive({ version: "v3", auth });

async function uploadFile(filePath) {
  try {
    const fileMetadata = {
      name: `Uclock_Report_${Date.now()}`,
     // parents: ["YOUR_DRIVE_FOLDER_ID"], // Replace with the Google Drive folder ID (optional)
    };

    const media = {
      mimeType: mime.lookup(filePath),
      body: fs.createReadStream(filePath),
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id",
    });

    const fileId = file.data.id;

    // Make the file publicly accessible (optional)
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    // Get a shareable link
    const result = await drive.files.get({
      fileId: fileId,
      fields: "webViewLink, webContentLink",
    });

    return {
      fileId: fileId,
      viewLink: result.data.webViewLink, // View online
      downloadLink: result.data.webContentLink, // Direct download
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
}

module.exports = { uploadFile };
