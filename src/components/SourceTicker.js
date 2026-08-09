import React, { useState, useEffect } from 'react'
import styles from '../styles/SourceTicker.module.css'

const SOURCES = [
  {
    name: 'Art Institute of Chicago',
    url: 'https://www.artic.edu/archival-collections/explore-the-collection',
  },
  { name: 'The Metropolitan Museum of Art', url: 'https://www.metmuseum.org' },
  { name: 'Rijksmuseum', url: 'https://www.rijksmuseum.nl' },
  { name: 'Harvard Art Museums', url: 'https://harvardartmuseums.org' },
  { name: 'Minneapolis Institute of Art', url: 'https://artsmia.org' },
  { name: 'Cleveland Museum of Art', url: 'https://www.clevelandart.org' },
  { name: 'National Gallery of Denmark', url: 'https://open.smk.dk' },
  { name: 'Wellcome Collection', url: 'https://wellcomecollection.org' },
  {
    name: 'New York Public Library',
    url: 'https://digitalcollections.nypl.org',
  },
  { name: 'Smithsonian Institution', url: 'https://www.si.edu/openaccess' },
  {
    name: 'Paris Musées',
    url: 'https://www.parismuseescollections.paris.fr',
  },
  { name: 'Europeana', url: 'https://www.europeana.eu' },
]

const shuffle = (list) => {
  const shuffled = [...list]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const SourceTicker = () => {
  // Shuffled after mount so the server and client render the same markup
  const [sources, setSources] = useState(SOURCES)

  useEffect(() => {
    setSources(shuffle(SOURCES))
  }, [])

  // The reel is doubled so the animation can loop seamlessly at -50%
  const reel = [...sources, ...sources]

  return (
    <div className={styles.band}>
      <div className={styles.reel}>
        {reel.map((source, i) => (
          <React.Fragment key={`${source.name}-${i}`}>
            <a href={source.url} target='_blank' rel='noreferrer'>
              {source.name}
            </a>
            <span className={styles.star} aria-hidden>
              ✦
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default SourceTicker
