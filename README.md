# Scloudify

Scloudify is a web application for exploring your Spotify library and playlists through the Spotify Web API.

The project is currently in development and is focused on building a functional Spotify integration.

## Current Features

* Spotify authentication using OAuth 2.0 with PKCE
* View Spotify user profile information
* Browse user playlists
* View tracks within playlists
* Paginated Spotify Web API requests
* API authentication and error handling
* Responsive interface

## Tech Stack

* React
* TypeScript
* Vite
* Tailwind CSS
* Spotify Web API
* OAuth 2.0 / PKCE
* Git / GitHub

## Project Status

🚧 **In Development**

The current version focuses on Spotify authentication, playlist retrieval, and track data.

Additional playlist analysis and music discovery features are planned as development continues.

## Running Locally

Clone the repository:

```bash
git clone https://github.com/gabrielf159/SCloudify.git
cd SCloudify
```

Install dependencies:

```bash
npm install
```

Configure the required Spotify environment variables:

```env
VITE_SPOTIFY_CLIENT_ID=
VITE_SPOTIFY_REDIRECT_URI=
VITE_SPOTIFY_SCOPES=
VITE_SPOTIFY_AUTH_ENDPOINT=
```

Start the development server:

```bash
npm run dev
```

## Author

Gabriel Flores


