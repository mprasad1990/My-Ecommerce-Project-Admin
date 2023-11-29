import React from 'react'

export default function Table(props) {

  const tableHeader = props.tableHeader;
  const tableData   = props.tableData;

  return (
    <table className="table table-striped table-bordered">
      <thead>
        <tr>
          {tableHeader.map((item) => {
            return <th key={item.colName} scope="col" style={{width: (item.colWidth ? item.colWidth : 'auto')}}>{item.colName}</th>
          })}
        </tr>
      </thead>
      <tbody>
        {
          (tableData.length === 0) &&  <tr>
            <td colSpan={4}>No records Found!</td>
          </tr>
        }
        {
          tableData.map((item) => {
            return <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{item.description}</td>
                    <td>{item.last_update}</td>
                    <td>{item.id}</td>
                  </tr>
          })  
        }
      </tbody>
    </table>
  )
}
