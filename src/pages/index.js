import React, { useState, useEffect, useMemo } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useQueries } from 'react-query'
import SearchInput from '../components/SearchInput'
import SourceTicker from '../components/SourceTicker'
import styles from '../styles/Home.module.css'

// Each source is fetched independently so results render as they arrive
// instead of waiting on the slowest museum.
const SOURCE_APIS = [
  'ai-chicago',
  'artsmia',
  'harvard',
  'nypl',
  'rijks',
  'cleveland',
  'met',
  'smk',
  'wellcome',
  'smithsonian',
  'paris',
  'europeana',
]

const fetchSource = async ({ queryKey }) => {
  const [source, searchTerm] = queryKey

  try {
    const response = await fetch(
      `/api/${source}?q=${encodeURIComponent(searchTerm)}`
    )
    if (!response.ok) {
      throw `Query to ${source} failed`
    }

    return await response.json()
  } catch (error) {
    console.log(error)
    return []
  }
}

export default function Home() {
  const router = useRouter()
  const searchTerm = router.query.q
  const [value, setValue] = useState(searchTerm || '')

  // router.isReady gates the queries until after hydration commits —
  // fetches resolving mid-hydration force React to repeatedly restart it
  const results = useQueries(
    SOURCE_APIS.map((source) => ({
      queryKey: [source, searchTerm],
      queryFn: fetchSource,
      enabled: router.isReady && Boolean(searchTerm),
    }))
  )

  // Round-robin interleave whatever has arrived so far
  const data = useMemo(() => {
    const lists = results.map((r) => r.data).filter(Array.isArray)
    const interleaved = []
    const seen = new Set() // some sources return the same item twice
    const longest = Math.max(0, ...lists.map((l) => l.length))
    for (let i = 0; i < longest; i++) {
      for (const list of lists) {
        if (list[i] && !seen.has(list[i].image)) {
          seen.add(list[i].image)
          interleaved.push(list[i])
        }
      }
    }
    return interleaved
  }, [results])

  useEffect(() => {
    setValue(searchTerm || '')
  }, [searchTerm])

  const isLoading = Boolean(searchTerm) && results.some((r) => r.isLoading)

  const emptyState =
    isLoading && data.length === 0
      ? 'Loading...'
      : searchTerm && !isLoading
      ? 'Hmm, there are no results for that query. Try something else?'
      : null

  return (
    <React.Fragment>
      <Head>
        <title>Museo</title>
        <link rel='icon' href='/favicon.ico' />
        <meta
          name='description'
          content='A visual search engine for discovering free images from some of the best museums in the world.'
        />
      </Head>

      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <a href='/'>Mus&shy;eo</a>
          </h1>

          <p className={styles.subtitle}>
            Museo is a visual search engine for free, public-domain images
            from ten of the world&rsquo;s great museums and libraries. Images
            you find here are typically free to use, but please check with the
            source institution for more specifics.
          </p>

          <SourceTicker />

          {!searchTerm && !isLoading && (
            <svg
              height='100'
              viewBox='0 0 29 244'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              className={styles.divider}
            >
              <path
                d='M14.5 2C31.1667 15.3333 31.1667 28.6667 14.5 42C-2.16665 55.3333 -2.16665 68.6667 14.5 82C31.1667 95.3333 31.1667 108.667 14.5 122C-2.16666 135.333 -2.16666 148.667 14.5 162C31.1667 175.333 31.1667 188.667 14.5 202C-2.16666 215.333 -2.16666 228.667 14.5 242'
                stroke='mediumseagreen'
                strokeWidth='4'
                strokeLinecap='round'
              />
            </svg>
          )}

          <SearchInput
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onSubmit={() =>
              router.push(
                { pathname: '/', query: value ? { q: value } : {} },
                undefined,
                { shallow: true }
              )
            }
          />

          <p className={styles.credits}>
            Lovingly constructed by{' '}
            <a href='https://chsmc.org' target='_blank'>
              Chase McCoy
            </a>{' '}
            •{' '}
            <a href='https://github.com/chasemccoy/museo' target='_blank'>
              View the code on GitHub
            </a>
          </p>
        </header>

        {data && data.length > 0 ? (
          <ul className={styles.photoList}>
            {data &&
              data.map((item, i) => (
                <li key={item.image || i}>
                  <a href={item.url} target='_blank'>
                    <img
                      data-src={item.image}
                      alt={item.title}
                      onError={(e) => {
                        // Hide rather than remove — the list re-renders as
                        // sources stream in, so React must own the DOM
                        const li = e.target.closest('li')
                        if (li) li.style.display = 'none'
                      }}
                      className='lazyload'
                    />
                  </a>
                </li>
              ))}
          </ul>
        ) : (
          <>{emptyState && <p className={styles.emptyState}>{emptyState}</p>}</>
        )}
      </main>
    </React.Fragment>
  )
}
