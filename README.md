# Readme - wete

## Requirements

- node v12
- npm v6

## Download & Installation

```sh
git clone https://github.com/millette/wete.git
cd wete
npm install
```

## Configs

The wiki is automatically configured on first launch. These files are created:

- db-web-v3.0.0/ db directory with first /wiki page
- tadam.js is the page template
- dist/main.min.js is the client-side JavaScript
- dist/style.min.css is the stylesheet
- .env for the environment variables

### Env

See `.env.example` for the required environment variables.

- `DB` will default to `db-web-v3.0.0` - feel free to change it.
- `PORT` will hold the http port, defaults to 3000.
- `SECRET` will hold a randomly generated value to sign cookies.

### Customizations

- `index.html` is used to generate the template and first page at `/wiki`
- `style.scss` holds the original sass style
- `main.js` holds the client-side JS and shouldn't be modified

## Launching

From the `wete/` directory (after `git clone [...]`) simply:

```sh
node server
```

Voilà, the wiki is now listening on <http://localhost:3000/>.

There are currently no user accounts. Simply login with a username and any non-empty password to edit pages.

A page is automatically created when you link to it. For instance, head to <http://localhost:3000/wiki> to edit it and add a link to a /sandbox page, like [sandbox](sandbox), save the `/wiki` page and follow the link to `/sandbox` and you should see a stub page there, which you can now edit.
