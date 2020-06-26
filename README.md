# HYPR Demo App

This demo application shows how to set up passwordless authentication in a web application, using [HYPR's APIs](https://apidocs.hypr.com/). Written in Node/Express and React.

<video width="600" controls autoplay>
  <source src="https://github.com/HYPR-Corp-Public/HYPR-Node-Demo/blob/master/demo.mov?raw=true">
</video>

You will need the following:

- a HYPR access token, which you can get here.
- the URL for your HYPR account.

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

The application can be accessed at `http://localhost:3000`. 

