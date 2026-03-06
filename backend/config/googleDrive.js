const { google } = require("googleapis");
require("dotenv").config();

// OAuth2 client for Google Drive API
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

// Set refresh token
if (process.env.GOOGLE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
}

const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

/**
 * Upload file to Google Drive
 * @param {Buffer} fileBuffer - File buffer
 * @param {String} fileName - Name of the file
 * @param {String} mimeType - MIME type of file
 * @returns {Object} - File info with id and webViewLink
 */
const uploadToGoogleDrive = async (fileBuffer, fileName, mimeType) => {
  try {
    const fileMetadata = {
      name: fileName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };

    const media = {
      mimeType: mimeType,
      body: require("stream").Readable.from(fileBuffer),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, name, webViewLink, webContentLink",
    });

    // Make file accessible with link
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Google Drive upload error:", error);
    throw error;
  }
};

/**
 * Get list of files in folder
 * @param {String} folderId - Google Drive folder ID
 * @returns {Array} - List of files
 */
const listFilesInFolder = async (folderId) => {
  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: "files(id, name, mimeType, createdTime, webViewLink)",
      orderBy: "createdTime desc",
    });

    return response.data.files;
  } catch (error) {
    console.error("Error listing files:", error);
    throw error;
  }
};

module.exports = {
  uploadToGoogleDrive,
  listFilesInFolder,
  oauth2Client,
};
