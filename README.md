# HYPR Demo App

This demo application shows how to set up passwordless authentication in a web application, using [HYPR's APIs](https://apidocs.hypr.com/). Written in Node/Express and React.

You will need the following:

- a HYPR access token, which you can get here.
- the URL for your HYPR account.
- Your computer must have a built-in FIDO2 authenticator (like Touch ID or Windows Hello).

## Setup

### Configure `hyprconfig.json`

Fill out `server/hyprconfig.json` with your HYPR access token and HYPR URL.

```
{
    "url": "https://myorganization.hypr.com",
    "accessToken": "<YOUR-ACCESS-TOKEN-HERE>"
}
```

### Install the server dependencies. 

```
cd server
npm install
```

### Run the server.

Inside of the `server` directory:

```
node app.js
```

The application can be accessed at `http://localhost:3000/nodesample`. 

