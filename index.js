import express from 'express';
import multer from 'multer';
import { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, SASProtocol, StorageSharedKeyCredential } from '@azure/storage-blob';

const app = express();
const port = 3000;

// Set up Multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

app.get('/', (req, res) => {
  res.send('Express server is running');
});

// Replace with your Azure Blob Storage connection string
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING || 'YOUR_CONNECTION_STRING';
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || 'YOUR_ACCOUNT_NAME';
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY || 'YOUR_ACCOUNT_KEY';
const CONTAINER_NAME = 'uploads';

app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  if (!req.file.mimetype.startsWith('image/')) {
    return res.status(400).send('Only image files are allowed');
  }

  try {
    // Create BlobServiceClient
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    // Get container client
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    // Create container if it doesn't exist
    await containerClient.createIfNotExists();

    // Create block blob client
    const blobName = req.file.originalname;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload file buffer
    await blockBlobClient.upload(req.file.buffer, req.file.buffer.length, {
      blobHTTPHeaders: { blobContentType: req.file.mimetype }
    });

    // Generate SAS URL for 1 day
    const expiresOn = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
    const startsOn = new Date();

    const sasParams = generateBlobSASQueryParameters({
      containerName: CONTAINER_NAME,
      blobName,
      permissions: BlobSASPermissions.parse('r'),
      startsOn,
      expiresOn,
      protocol: SASProtocol.Https,
    },
      new StorageSharedKeyCredential(accountName, accountKey)
    );

    const sasUrl = `${blockBlobClient.url}?${sasParams.toString()}`;

    res.json({
      message: `File uploaded to Azure Blob Storage as ${blobName}`,
      url: sasUrl,
      expires: expiresOn,
    });
  } catch (error) {
    console.error('Azure Blob upload error:', error);
    res.status(500).send('Error uploading file to Azure Blob Storage');
  }
});

await app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}; PID: ${process.pid}`);
});
