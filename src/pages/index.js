import React, {useState, useEffect} from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useQuery } from 'react-query'
import SearchInput from '../components/SearchInput'
import styles from '../styles/Home.module.css'

const URL = (source, searchTerm) => `/api/${source}?q=${searchTerm}`

const interleave = ([x, ...xs], ys) => x ? [x, ...interleave(ys, xs)] : ys

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

  const {data: aiChicago} = useQuery(['ai-chicago', searchTerm], fetchData)
  const {data: nypl} = useQuery(['nypl', searchTerm], fetchData)
  const {data: rijks} = useQuery(['rijks', searchTerm], fetchData)

  let data = null

  if (aiChicago && nypl && rijks) {
    data = interleave(aiChicago, nypl)
    data = interleave(data, rijks)
  }

  useEffect(() => {
    setValue(searchTerm || '')
  }, [searchTerm])

  return (
    <React.Fragment>
      <Head>
        <title>Museo</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>🏛 Museo</h1>
          <p className={styles.subtitle}>Museo is a visual search engine that connects you with the <a href="">Art Institute of Chicago</a>, the <a href="https://www.rijksmuseum.nl/nl">Rijksmuseum</a>, and the <a href="">New York Public Library Digital Collection</a><span className={styles.badge}>more to come!</span> Every image you find here is in the public domain and completely free to use (although crediting the source institution never hurts!)</p>
          <SearchInput value={value} onChange={e => setValue(e.target.value)} />
        </header>

        {/* <div style={{display: 'flex', flexWrap: 'wrap'}}>
          {data && data.map((item, i) => (
            <figure key={i} style={{flexBasis: '20%'}}>
              <img src={item.image} alt={item.title} onError={e => e.target.parentNode.parentNode.removeChild(e.target.parentNode)} />
              <figcaption>{item.title}</figcaption>
            </figure>
          ))}
        </div> */}

        <ul className={styles.photoList}>
          {data && data.map((item, i) => (
            <li key={i}>
              <a href={item.url} target="_blank">
                <img data-src={item.image} alt={item.title} onError={e => e.target.parentNode.parentNode.removeChild(e.target.parentNode)} className="lazyload" />
              </a>
            </li>
          ))}
        </ul>
        
        {/* <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <p className={styles.description}>
          Get started by editing{' '}
          <code className={styles.code}>pages/index.js</code>
        </p>

        <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h3>Documentation &rarr;</h3>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h3>Learn &rarr;</h3>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/master/examples"
            className={styles.card}
          >
            <h3>Examples &rarr;</h3>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
          >
            <h3>Deploy &rarr;</h3>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div> */}
      </main>
    </React.Fragment>
  )
}
