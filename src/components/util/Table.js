import React from 'react'
import moment from 'moment';
import { Link } from 'react-router-dom';
import { Tooltip } from '@mui/material';

export default function Table(props) {

  const tableHeader = props.tableHeader;
  const tableData   = props.tableData;
  const section     = props.section;
  const functions   = props.functions;

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
            <td className='text-center' colSpan={tableHeader.length}>No records Found!</td>
          </tr>
        }
        {
          tableData.map((item) => {
            return <tr key={item._id}>
                    <td>{item.title}</td>
                    <td>{item.description}</td>
                    <td>{moment(item.date).format('MMM D, YYYY, hh:mm:ss A')}</td>
                    <td>
                    <Tooltip title="Edit" placement="top" onClick={()=>{ functions.editBanner(item._id) }}><Link className="waves-effect"><i className="fas fa-pencil-alt"></i></Link></Tooltip>
                    <Tooltip title="Delete" placement="top" onClick={()=>{ functions.deleteBanner(item._id) }}><Link className="waves-effect ml-7"><i className="far fa-trash-alt"></i></Link></Tooltip>
                    </td>
                  </tr>
          })  
        }
      </tbody>
    </table>
  )
}
