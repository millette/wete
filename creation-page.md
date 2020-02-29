# Création d'une page

Une page _stub_ est créée automatiquement quand on édite une autre page et qu'on fait un lien vers une page inexistante.

```json
{
  "stub": true,
  "date": 1234,
  "connected": "userbob",
  "cnt": "<div>Stub page with title, date, author and <a href='/origin'>origin</a>.</div",
  "internalLinks": [
    {
      "href": "/origin",
      "page": "/origin",
      "text": "origin"
    }
  ],
  "externalLinks": []
}
```

Un _backlink_ est aussi ajouté à la db:

- backlink:origin:thispage

On crée aussi une version pour ce stub:

- page-version:thispage:1234

Mais on ne crée pas de change:1234:thispage pour un _stub_.
