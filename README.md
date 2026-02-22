# Azure Blob Image Upload API

This project provides a simple Express API for uploading image files to Azure Blob Storage.

An Azure Function with a Blob Storage trigger will process uploaded images and apply a grayscale filter automatically.

### Features
- Upload images via REST API
- Store images in Azure Blob Storage
- Azure Function (TODO): Apply grayscale to new images

## Usage
1. Start the Express server
2. POST an image file to `/upload`
3. Receive a temporary URL for the uploaded image

## Environment Variables
- `AZURE_STORAGE_CONNECTION_STRING`: Azure Blob Storage connection string
- `AZURE_STORAGE_ACCOUNT_NAME`: Azure Storage account name
- `AZURE_STORAGE_ACCOUNT_KEY`: Azure Storage account key

## Mermaid Architecture Diagram

```
flowchart TD
    Client[Client uploads image] --> API[Express API]
    API --> Blob[Azure Blob Storage]
    Blob --> Function[Azure Function (Blob Trigger)]
    Function --> Gray[Apply Grayscale]
    Gray --> Blob
    API -.-> SAS[SAS URL returned to client]
```
