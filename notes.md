# Notes d'implémentation

- page:todo # pointe vers la version la plus récente
- page-version:todo:1582767757822 # timestamp en ms
- page-version:todo:1582767646711 # plusieurs versions d'une page
- changes:1582767757822:todo # ordonné par les dates
- changes:1582767646711:todo # pointe sur page-version:todo:1582767646711

## Modification de la page "wiki"

Un utilisateur connecté peut modifier le contenu des pages.

### DB actuelle

- page:wiki # pointe vers page-version:wiki:1582767757000
- page-version:wiki:1582767757000 # la plus récente

* changes:1582767757822:todo
* changes:1582767757000:wiki
* changes:1582767646711:todo # et plus

Un utilisateur connecté, "bob", clique `edit` sur `/wiki`

### DB après _intent to edit_

- page:wiki # aucun changement
- page-intent:wiki:1582767759000 # nouveau
- page-version:wiki:1582767757000 # aucun changement

* changes:1582767757822:todo
* changes:1582767757000:wiki
* changes:1582767646711:todo # et plus

`page-intent:wiki:1582767759000` contiendra:

```json
{
  "user": "bob",
  "from": "page-version:wiki:1582767757000"
}
```

### DB après _cancel edit_

- page:wiki # aucun changement
- page-version:wiki:1582767757000 # aucun changement

* changes:1582767757822:todo
* changes:1582767757000:wiki
* changes:1582767646711:todo # et plus

On efface `page-intent:wiki:1582767759000`

### DB après _save edit_

- page:wiki # pointe maintenant vers page-version:wiki:1582767760000
- page-version:wiki:1582767760000 # nouveau
- page-version:wiki:1582767757000 # aucun changement

* changes:1582767760000:wiki
* changes:1582767757822:todo
* changes:1582767757000:wiki
* changes:1582767646711:todo # et plus

Donc:

1. On crée `page-version:wiki:1582767760000`.
2. On fait pointer `page:wiki` vers `page-version:wiki:1582767760000`.
3. On efface `page-intent:wiki:1582767759000`.
