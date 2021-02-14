import React from 'react'

const SearchInput = ({value, onChange}) => {
  return (
    <form action='/' method='get' onSubmit={e => e.preventDefault}>
      <input
        type="search"
        placeholder="Search the world’s museums"
        value={value}
        onChange={onChange}
        name="q"
        aria-label="Search the world’s museums"
      />

      <button type='submit'>Submit</button>
    </form>
  )
}
 
export default SearchInput