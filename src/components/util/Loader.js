import React from 'react'

export default function Loader(props) {
  return (
    <div className={`react-loader ${props.status}`}>
      <div className="spinner-border text-info m-1" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  )
}
