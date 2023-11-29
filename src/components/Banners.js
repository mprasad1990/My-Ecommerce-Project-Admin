import React, { useState, useRef } from 'react'
import Table from './util/Table'
import EasyCrop from '../cropper/EasyCrop';

export default function Banners() {
  
  const inputFileRef = useRef(null);
  const triggerInputFileCLick = (event) => {
    inputFileRef.current.click();
  }

  const [image, setImage] = useState('/assets/images/no-image.jpg');

  const handleImageUpload = async (e) => {
    setImage(URL.createObjectURL(e.target.files[0]));
  };


  const [sectionShow, setSectionShow] = useState("table");

  const sectionShowHide = (section) => {
    setSectionShow(section);
  }

  const tableHeader = [
    {colName: 'Title', colWidth: '20%'}, 
    {colName: 'Description', colWidth: '50%'}, 
    {colName: 'Last Update', colWidth: '20%'}, 
    {colName: 'Action', colWidth: '10%'}
  ];

  const [tableData, setTableData] = useState([
    {
      id: 1,
      title: 'Title 1',
      description: 'Description 1',
      last_update: '2022-03-10',
    },
    {
      id: 2,
      title: 'Title 2',
      description: 'Description 2',
      last_update: '2022-03-10',
    }
  ])

  return (
    <div className="page-content">
      <div className="container-fluid">
        <div className="page-title-box">
          <div className="row align-items-center"> 
            <div className="col-md-8">
                <h6 className="page-title">Banners</h6>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">


                {(sectionShow === 'table') && <div className="table-section">
                    <div className="mb-3 text-right">
                      <button type="button" className="btn btn-primary" onClick={() => { sectionShowHide('form') }}>Add Banner</button>
                    </div>
                    <Table tableHeader={tableHeader} tableData={tableData}/>
                  </div>
                }
                
                {(sectionShow === 'form') && <form>
                    <div className="row">
                      <div className="text-right">
                        <button type="button" className="btn btn-primary" onClick={() => { sectionShowHide('table') }}>Back</button>
                      </div>
                      <div className="col-sm-12 col-lg-6">
                        <div className="form-group mb-3">
                          <label htmlFor="bannerTitle">Title</label>
                          <input type="text" className="form-control" id="bannerTitle" name="bannerTitle"/>
                        </div>
                      </div>
                      <div className="col-sm-12 col-lg-6">
                        <div className="form-group mb-3">
                          <label htmlFor="bannerDescription">Description</label>
                          <input type="text" className="form-control" id="bannerDescription" name="bannerDescription"/>
                        </div>
                      </div>

                      <EasyCrop image={image}  />

                      <div className="col-sm-12 col-lg-12 mt-3">
                        <button type="button" className="btn btn-primary" style={{cursor: 'pointer', marginRight: '10px'}} onClick={triggerInputFileCLick}>Upload Image
                          <input type="file" ref={inputFileRef} name="cover" onChange={handleImageUpload} accept="img/*" style={{ display: "none" }}/>
                        </button>
                        <button type="button" className="btn btn-primary" style={{marginRight: '10px'}}>Save</button>
                        <button type="button" className="btn btn-primary" style={{marginRight: '10px'}}>Cancel</button>
                      </div>
                    </div>
                  </form>
                }
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div> 
  )
}
