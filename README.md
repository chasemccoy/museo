# 🏛 Museo

Museo is a visual search engine that connects you with ten of the world's great museums and libraries:

- [Art Institute of Chicago](https://www.artic.edu/archival-collections/explore-the-collection)
- [The Metropolitan Museum of Art](https://www.metmuseum.org)
- [Rijksmuseum](https://www.rijksmuseum.nl)
- [Harvard Art Museums](https://harvardartmuseums.org)
- [Minneapolis Institute of Art](https://artsmia.org)
- [Cleveland Museum of Art](https://www.clevelandart.org)
- [National Gallery of Denmark](https://open.smk.dk)
- [Wellcome Collection](https://wellcomecollection.org)
- [New York Public Library Digital Collections](https://digitalcollections.nypl.org)
- [Smithsonian Institution](https://www.si.edu/openaccess)

Every image you find with Museo is in the public domain and typically completely free to use (although crediting the source institution never hurts!)

## Development

```
yarn install
yarn dev
```

`yarn dev` runs [Netlify Dev](https://www.netlify.com/products/dev/), which serves the Next.js app alongside the serverless functions in `api/` that fan out to each museum's search API.

Some sources require (free) API tokens, provided as environment variables. Sources with missing tokens are silently skipped:

- `HARVARD_TOKEN` — [Harvard Art Museums](https://harvardartmuseums.org/collections/api)
- `NYPL_TOKEN` — [NYPL Digital Collections](https://api.repo.nypl.org/)
- `SMITHSONIAN_TOKEN` — [api.data.gov](https://api.data.gov/signup/)
- `PARIS_TOKEN` — [Paris Musées](https://www.parismusees.paris.fr/fr/les-collections-en-ligne/lapi-collections)
- `EUROPEANA_TOKEN` — [Europeana](https://apis.europeana.eu/en/apis)
