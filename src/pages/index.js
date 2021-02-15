import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useQuery } from 'react-query'
import SearchInput from '../components/SearchInput'
import styles from '../styles/Home.module.css'

const URL = (source, searchTerm) => `/api/${source}?q=${searchTerm}`

const interleave = ([x, ...xs], ys) => (x ? [x, ...interleave(ys, xs)] : ys)

const fetchData = async ({ queryKey }) => {
  const [source, searchTerm] = queryKey

  if (!searchTerm || !source) {
    return null
  }

  const response = await fetch(URL(source, searchTerm))
  const data = await response.json()
  return data
}

export default function Home() {
  const { query } = useRouter()
  const searchTerm = query.q
  const [value, setValue] = useState(searchTerm || '')

  const { data: aiChicago, isLoading: loadingAIChicago } = useQuery(
    ['ai-chicago', searchTerm],
    fetchData
  )
  const { data: nypl, isLoading: loadingNYPL } = useQuery(
    ['nypl', searchTerm],
    fetchData
  )
  const { data: rijks, isLoading: loadingRijks } = useQuery(
    ['rijks', searchTerm],
    fetchData
  )

  let data = null
  const loading = loadingAIChicago || loadingNYPL || loadingRijks

  if (aiChicago && nypl && rijks) {
    data = interleave(aiChicago, nypl)
    data = interleave(data, rijks)
  }

  useEffect(() => {
    setValue(searchTerm || '')
  }, [searchTerm])

  const emptyState = loading
    ? 'Loading...'
    : searchTerm
    ? 'Hmm, there are no results for that query. Try something else?'
    : 'Try searching for something like “mountains”, “trees”, or “cities”.'

  return (
    <React.Fragment>
      <Head>
        <title>Museo</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>🏛 Museo</h1>
          <p className={styles.subtitle}>
            Museo is a visual search engine that connects you with the{' '}
            <a href='https://www.artic.edu/archival-collections/explore-the-collection'>
              Art Institute of Chicago
            </a>
            , the <a href='https://www.rijksmuseum.nl/nl'>Rijksmuseum</a>, and
            the{' '}
            <a href='https://digitalcollections.nypl.org'>
              New York Public Library Digital Collection
            </a>
            <span className={styles.badge}>more to come!</span> Every image you
            find here is in the public domain and completely free to use,
            although crediting the source institution is a nice thing to do!
          </p>

          <p className={styles.credits}>
            Lovingly constructed by{' '}
            <a href='https://chasem.co' target='_blank'>
              Chase McCoy
            </a>{' '}
            •{' '}
            <a href='https://github.com/chasemccoy/museo' target='_blank'>
              View the code on GitHub
            </a>
          </p>

          <SearchInput
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </header>

        {data && data.length > 0 ? (
          <ul className={styles.photoList}>
            {data &&
              data.map((item, i) => (
                <li key={i}>
                  <a href={item.url} target='_blank'>
                    <img
                      data-src={item.image}
                      alt={item.title}
                      onError={(e) =>
                        e.target.parentNode.parentNode.removeChild(
                          e.target.parentNode
                        )
                      }
                      className='lazyload'
                    />
                  </a>
                </li>
              ))}
          </ul>
        ) : (
          <p className={styles.emptyState}>{emptyState}</p>
        )}
      </main>
    </React.Fragment>
  )
}
