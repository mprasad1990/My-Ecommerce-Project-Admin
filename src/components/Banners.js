import React, { useState, useCallback, useRef, useContext } from 'react'
import Table from './util/Table'

import Slider from "@mui/material/Slider";
import Cropper from "react-easy-crop";
import getCroppedImg from "../cropper/Crop";

import LoaderContext from '../context/loader/LoaderContext';
import AlertContext from '../context/alert/AlertContext';
import { API_SOURCE_URL } from '../utils/constants';


export default function Banners() {

  const loaderContext = useContext(LoaderContext);
  const alertContext = useContext(AlertContext);

  // For File Upload and Crop
  const inputFileRef = useRef(null);
  const triggerInputFileCLick = (event) => {
    inputFileRef.current.click();
  }
  const handleImageUpload = async (e) => {
    setImage(URL.createObjectURL(e.target.files[0]));
  };
  const [image, setImage] = useState('/assets/images/no-image.jpg');
  const [crop, setCrop]   = useState({ x: 0, y: 0 });
  const [zoom, setZoom]   = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);


  const [sectionShow, setSectionShow] = useState("table");
  const [formMode, setFormMode]       = useState("insert");
  const [itemId, setItemId]           = useState("");

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


  const [formData, setFormData] = useState({
    itemTitle: {required: true, value:"", errorClass:"", errorMessage:""},
    itemDescription: {required: true, value:"", errorClass:"", errorMessage:""},
    itemImage: {required: false, value:"", errorClass:"", errorMessage:""}
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    if(value.trim() !== ""){
      setFormData({...formData, [name]: {...formData[name], value:value, errorClass:"", errorMessage:""}});
    }
    else{
      setFormData({...formData, [name]: {...formData[name], value:value, errorClass:"form-error", errorMessage:"This field is required!"}});
    }
  }
  const validateForm = () => {
    const fieldName = Object.keys(formData);
    let errorCounter = 0;
    fieldName.forEach((element) => {
      if(formData[element].required && formData[element].value.trim() === ""){
        formData[element].errorMessage = "This field is required!";
        formData[element].errorClass = "form-error";
        errorCounter++;
      }
      else{
        formData[element].errorMessage = "";
        formData[element].errorClass = "";
      }
    })
    setFormData({...formData, ...formData});
    return errorCounter;
  }
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    let errorCounter = validateForm();
    if(errorCounter > 0){
      return false;
    }
    else{
      //alertContext.setAlertMessage({show:true, type: "success", message: "Form saved successfully"});
      //loaderContext.setLoaderState("show");
      if(image.indexOf("no-image.jpg") >= 0){
        alertContext.setAlertMessage({show:true, type: "error", message: "Please upload an image!"});
      }
      else{
        let currentCroppedImage = await getCroppedImg(image, croppedAreaPixels, rotation);
        formData['itemImage'].value = currentCroppedImage;
        setFormData({...formData, ...formData});
        
        let jsonData = {};
        Object.keys(formData).map((key) => { jsonData[key] = formData[key].value; });
        jsonData['formMode'] = formMode;
        jsonData['itemId'] = itemId;
        
        const response = await fetch(`${API_SOURCE_URL}/admin/save-banner`, {
          method: 'POST',
          headers:{
            "Content-Type": "application/json"
          },
          body: JSON.stringify(jsonData)
        })

      }
      //console.log(currentCroppedImage);
      //console.log(croppedAreaPixels);
      //console.log(rotation);
      //console.log(zoom);
    }
  }

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
                
                {(sectionShow === 'form') && <form name="bannerForm" onSubmit={handleFormSubmit}>
                    <div className="row">
                      <div className="text-right">
                        <button type="button" className="btn btn-primary" onClick={() => { sectionShowHide('table') }}>Back</button>
                      </div>
                      <div className="col-sm-12 col-lg-6">
                        <div className={`form-group mb-3 ${formData['itemTitle'].errorClass}`}>
                          <label htmlFor="itemTitle">Title</label>
                          <input type="text" className="form-control" id="itemTitle" name="itemTitle" onChange={handleChange}/>
                          <small className="error-mesg">{formData['itemTitle'].errorMessage}</small>
                        </div>
                      </div>
                      <div className="col-sm-12 col-lg-6">
                        <div className={`form-group mb-3 ${formData['itemDescription'].errorClass}`}>
                          <label htmlFor="itemDescription">Description</label>
                          <input type="text" className="form-control" id="itemDescription" name="itemDescription" onChange={handleChange}/>
                          <small className="error-mesg">{formData['itemDescription'].errorMessage}</small>
                        </div>
                      </div>

                      <div className="col-sm-12 col-lg-6">
                        <div className="container">
                          <div className="crop-container">
                            <Cropper image={image} crop={crop} rotation={rotation} zoom={zoom} zoomSpeed={4} maxZoom={3} zoomWithScroll={true} showGrid={true} aspect={4 / 3} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} onRotationChange={setRotation} />
                          </div>
                        </div>
                      </div>
                      <div className="col-sm-12 col-lg-6">
                        <div className="controls">
                          <label>
                            Rotate
                            <Slider value={rotation} min={0} max={360} step={1} aria-labelledby="rotate" onChange={(e, rotation) => setRotation(rotation)} className="range" />
                          </label>
                          <label>
                            Zoom
                            <Slider value={zoom} min={1} max={3} step={0.1} aria-labelledby="zoom" onChange={(e, zoom) => setZoom(zoom)} className="range" />
                          </label>
                        </div>
                        <div className="cropped-image-container">
                          {croppedImage && (
                            <img className="cropped-image" src={croppedImage} alt="cropped" />
                          )}
                        </div>
                      </div>

                      <div className="col-sm-12 col-lg-12 mt-3">
                        <button type="button" className="btn btn-primary" style={{cursor: 'pointer', marginRight: '10px'}} onClick={triggerInputFileCLick}>Upload Image
                          <input type="file" ref={inputFileRef} name="cover" onChange={handleImageUpload} accept="img/*" style={{ display: "none" }}/>
                        </button>
                        <button type="button" className="btn btn-primary" style={{marginRight: '10px'}} onClick={handleFormSubmit}>Save</button>
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
