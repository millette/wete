# Notes d'implémentation

Exemples de clés pour la db:

- page:todo # pointe vers la version la plus récente
- page-version:todo:1582767757822 # timestamp en ms
- page-version:todo:1582767646711 # plusieurs versions d'une page
- change:1582767757822:todo # ordonné par les dates
- change:1582767646711:todo # pointe sur page-version:todo:1582767646711
- page-intent:wiki:1582767759000 # signalement d'intention d'éditer

## Gestion des backlinks

Les rétro-liens (_backlinks_) sont essentiels au bon fonctionnement du site. Chaque fois qu'une page sera éditée, il faudra en extraire les liens locaux et mettre à jour les _backlinks_ des pages correspondantes.

### Example de liens locaux

- Page A (vers B et D (inexistant))
- Page B (vers A et C)
- Page C (vers B et D (inexistant))
- Page inexistant D (mais demandée/linkée)
- Page inexistant E

Inversément, les _backlinks_ sont:

- Page A (depuis B)
- Page B (depuis A et C)
- Page C (depuis B)
- Page inexistant D (depuis A et C)
- Page inexistant E (aucun)

Au moment d'éditer, A pointe vers B et D. On édite A pour retirer le lien vers B. Donc:

- Page A (vers D (inexistant); on a retiré B)

Inversément, les _backlinks_ modifié sont:

- Page B (depuis C; on a retiré A)

### Représentation des liens locaux dans la DB

Les liens modifiés sont:

- Avant:
  - backlink:B:A
  - backlink:B:C
- Après
  - backlink:B:C

Et tous les liens, après le retrait du lien vers B à partir de A:

- backlink:A:B
- backlink:B:C
- backlink:C:B
- backlink:D:A
- backlink:D:C

## Création de la page "wiki"

Un utilisateur connecté peut créer une nouvelle page mais seulement en suivant un lien dans une page déjà existante, afin de minimiser les pages orphelines et améliorer la cohésion du site.

L'utilisateur doit donc trouver une page avec du contenu qu'il veut approfondir en créant une nouvelle page. Sur cette page d'origine, il peut suivre un lien vers une page inexistante ou encore il peut éditer la dite page pour faire lui-même ce lien et cliquer sur ce dernier.

Quand on visite une page inexistante, deux choses peuvent se produire:

1. 404 not found
2. 200 stub (avec backlinks) et invitation à créer la page si on est connecté

## Modification de la page "wiki"

Un utilisateur connecté peut modifier le contenu des pages.

### DB actuelle

- page:wiki # pointe vers page-version:wiki:1582767757000
- page-version:wiki:1582767757000 # la plus récente
- change:1582767757822:todo
- change:1582767757000:wiki
- change:1582767646711:todo # et plus

Un utilisateur connecté, "bob", clique `edit` sur `/wiki`

### DB après _intent to edit_

- page:wiki # aucun changement
- page-intent:wiki:1582767759000 # nouveau
- page-version:wiki:1582767757000 # aucun changement
- change:1582767757822:todo
- change:1582767757000:wiki
- change:1582767646711:todo # et plus

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
- change:1582767757822:todo
- change:1582767757000:wiki
- change:1582767646711:todo # et plus

On efface `page-intent:wiki:1582767759000`

### DB après _save edit_

- page:wiki # pointe maintenant vers page-version:wiki:1582767760000
- page-version:wiki:1582767760000 # nouveau
- page-version:wiki:1582767757000 # aucun changement
- change:1582767760000:wiki
- change:1582767757822:todo
- change:1582767757000:wiki
- change:1582767646711:todo # et plus

Donc:

1. On crée `page-version:wiki:1582767760000`.
2. On fait pointer `page:wiki` vers `page-version:wiki:1582767760000`.
3. On efface `page-intent:wiki:1582767759000`.
