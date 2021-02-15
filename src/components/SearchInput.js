import React from 'react'
import styles from '../styles/SearchInput.module.css'

const SearchInput = ({ value, onChange }) => {
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
          placeholder='Search the world’s museums'
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
