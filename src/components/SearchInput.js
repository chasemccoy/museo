import React from 'react'
import styles from '../styles/SearchInput.module.css'

const PLACEHOLDERS = [
  'Trees',
  'Paintings of nature',
  'Maps',
  'Statues',
  'Art with flowers',
  'Scenes from history',
  'Portraits',
  'Clouds',
  'Book illustrations',
  'Abstract art',
  'Mythology paintings',
  'Animal sculptures',
  'Vintage posters',
  'Mountains',
  'Patterns and designs',
  'Landscapes',
  'Art about cities',
  'Still life',
  'Photos of people',
  'Cities',
]

const SearchInput = ({ value, onChange }) => {
  const placeholder =
    PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]

  return (
    <form
      action='/'
      method='get'
      onSubmit={(e) => e.preventDefault}
      className={styles.form}
    >
      <div className={styles.wrapper}>
        <input
          type='search'
          placeholder={`“${placeholder}”`}
          value={value}
          onChange={onChange}
          name='q'
          aria-label='Search the world’s museums'
          className={styles.input}
        />

        <button type='submit' className={styles.button}>
          Search
        </button>
      </div>
    </form>
  )
}

export default SearchInput
