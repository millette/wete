# Misc. notes

## DB Init

We initialize the db with:

- an `admin user`
- a `home page` (from file or stdin or whatever)

This **may** create stub pages if `home page` has local links.

## Page edit

Since modifying local links in a page automatically creates stub pages, pages are only edited during normal usage and never created directly.

## Types

There are two main types:

- `Vfile` for `unified()` processing
- JSON for db batches
