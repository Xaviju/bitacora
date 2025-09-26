# Bitacora

Creates everyday bitacora for Penpot team getting the current open stories in the current sprint in Taiga and displaying it using the current template.

## Requirements

- Node.js 22

## Installation

First, ensure that you have the required dependencies installed in your environment. Then, follow these steps:

```bash
# Copy the sample config file and configure it
cp config.example.json config.json

# Install npm dependencies
npm install
```

## Requirements

To be able to config bitacora ensure your IOP has:

- A prefix written at the beggining of your user stories. E.g.`[DESIGN TOKENS]`
- Uses a hashtag in the chat. E.g. #design-tokens
- Has a IOP channel in the Kaleidos chat

## Configuration

The script uses a configuration file `config.json` to specify various parameters. Below is a detailed explanation of each configuration option:

```json
{
  "auth": {
    "username": "username", // Your Taiga username
    "password": "password" // Your Taiga password
  },
  "taiga": {
    "apiUrl": "https://api.taiga.io",
    "project": {
      "slug": "penpot", // This is the project slug, probably don't want to change it.
      "milestoneId": "00000" // The ID of your milestone
    },
    "iop": {
      "prefix": "[IOP PREFIX]", //Each IOP should use a prefix for their stories as in [PREFIX] Story title
      "hashtag": "#iop-name", // Each iop has a hashtag as #design-tokens
      "channel": "chat-channel-name", // Name of your chat channel. Builds an URL so follow kebab-case format. E.g. "iops-tokens--variants--protoflow",
      "members": ["Júlia", "Vicent", "Mustafá", "Pepe", "Amparo"], // Team members name
      "dailies": "MON, WED, FRI" // Dailies weekdays
    }
  }
}
```

## Running the Script

To run the script, use the following command:

```bash
npm run bitacora
```
