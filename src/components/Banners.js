import React, { useState, useCallback, useRef, useContext, useEffect } from 'react'
import Table from './util/Table'

import Slider from "@mui/material/Slider";
import Cropper from "react-easy-crop";
import getCroppedImg from "../cropper/Crop";

import LoaderContext from '../context/loader/LoaderContext';
import AlertContext from '../context/alert/AlertContext';
import { API_SOURCE_URL, RESOURCE_URL } from '../utils/constants';

import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';


export default function Banners() {

  const loaderContext = useContext(LoaderContext);
  const alertContext = useContext(AlertContext);

  // For File Upload and Crop
  const inputFileRef = useRef(null);
  const triggerInputFileCLick = (event) => {
    inputFileRef.current.click();
  }
  const handleImageUpload = async (e) => {
    //setImage(URL.createObjectURL(e.target.files[0]));
    const selectedFile = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
      const base64Image = e.target.result;
      setImage(base64Image);
    };
    reader.readAsDataURL(selectedFile);
  };
  const aspectRatio = 8 / 3;
  const [cropWidth, cropHeight] = [800, 300];
  const [image, setImage] = useState('/assets/images/no-image.jpg');
  const [crop, setCrop]   = useState({ x: 0, y: 0 });
  const [zoom, setZoom]   = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);


  const [formData, setFormData] = useState({
    itemTitle: {required: true, value:"", errorClass:"", errorMessage:""},
    itemDescription: {required: true, value:"", errorClass:"", errorMessage:""},
    itemImage: {required: false, value:"", errorClass:"", errorMessage:""}
  });
  
  const [sectionShow, setSectionShow] = useState("table");
  const [formMode, setFormMode]       = useState("insert");
  const [itemId, setItemId]           = useState("");

  const resetForm = () => {
    Object.keys(formData).forEach((element) => {
      formData[element].value = "";
      formData[element].errorMessage = "";
      formData[element].errorClass = "";
    })
    setFormData({...formData, ...formData});
    setFormMode("insert");
    setItemId("");
    setImage('/assets/images/no-image.jpg');
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    setCroppedImage(null);
  }

  const sectionShowHide = (section) => {
    resetForm();
    setSectionShow(section);
  }

  const tableHeader = [
    {colName: 'Title', colWidth: '20%'}, 
    {colName: 'Description', colWidth: '47%'}, 
    {colName: 'Last Update', colWidth: '25%'}, 
    {colName: 'Action', colWidth: '8%'}
  ];
  const [tableData, setTableData] = useState([])
  const createBannerTable = async () => {
    const response = await fetch(`${API_SOURCE_URL}/admin/fetch-banner`, {
      method: 'POST',
      headers:{
        "Content-Type": "application/json",
        "auth-token": localStorage.getItem('token')
      },
      body: JSON.stringify({})
    })
    let result = [];
    const json = await response.json();
    if(json.success){
      result = json.data;
    }
    setTableData(result);
  }
  useEffect(() => {
    createBannerTable();
    // eslint-disable-next-line
  }, [])

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

      if(image.indexOf("no-image.jpg") >= 0){
        alertContext.setAlertMessage({show:true, type: "error", message: "Please upload an image!"});
      }
      else{
        let currentCroppedImage = await getCroppedImg(image, croppedAreaPixels, rotation, cropWidth, cropHeight);

        formData['itemImage'].value = currentCroppedImage;
        setFormData({...formData, ...formData});
        
        let jsonData = {};
        Object.keys(formData).map((key) => { return jsonData[key] = formData[key].value; });
        jsonData['formMode'] = formMode;
        jsonData['itemId'] = itemId;
        
        let imageConfig = {
          'crop_area': croppedAreaPixels,
          'rotation': rotation,
          'zoom': zoom,
          'crop': crop
        }
        jsonData['itemSourceImage'] = image;
        jsonData['itemImageConfig'] = JSON.stringify(imageConfig);

        loaderContext.setLoaderState("show");
        
        const response = await fetch(`${API_SOURCE_URL}/admin/save-banner`, {
          method: 'POST',
          headers:{
            "Content-Type": "application/json",
            "auth-token": localStorage.getItem('token')
          },
          body: JSON.stringify(jsonData)
        })

        let result = await response.json();

        setFormMode("update");
        setItemId(result.result._id);
        setCroppedImage(RESOURCE_URL+"banners/"+result.result.image+'?timestamp='+Math.random());
        
        loaderContext.setLoaderState("hide");

        if(result.success){
          alertContext.setAlertMessage({show:true, type: "success", message: result.message});
        }
        else{
          alertContext.setAlertMessage({show:true, type: "error", message: result.message});
        }
        
        setTimeout(()=>{
          sectionShowHide("table");
          createBannerTable();
        }, 2500)
        

      }
      
    }
  }
  const editBanner = async (id) => {
    const response = await fetch(`${API_SOURCE_URL}/admin/fetch-each-banner`, {
      method: 'POST',
      headers:{
        "Content-Type": "application/json",
        "auth-token": localStorage.getItem('token')
      },
      body: JSON.stringify({'bannerId': id})
    })
    let result = {};
    const json = await response.json();
    if(json.success){
      result = json.data;
    }
    
    if(Object.keys(result).length > 0){
      formData['itemTitle'].value       = result.title;
      formData['itemDescription'].value = result.description;
      formData['itemImage'].value       = result.image;
      setFormData({...formData, ...formData});
      var imageConfig = JSON.parse(result.image_config);
      console.log(result.source_image);
      setFormMode("update");
      setItemId(result._id);
      setImage(RESOURCE_URL+"banners/"+result.source_image+'?timestamp='+Math.random());
      setCrop(imageConfig.crop);
      setZoom(imageConfig.zoom);
      setRotation(imageConfig.rotation);
      setCroppedAreaPixels(imageConfig.crop_area);
      setCroppedImage(RESOURCE_URL+"banners/"+result.image+'?timestamp='+Math.random());

      setSectionShow("form");

    }
    else{
      alertContext.setAlertMessage({show:true, type: "error", message: "Record not found!"});
    }

  }
  const acceptDeleteBanner = async (id) => {
    const response = await fetch(`${API_SOURCE_URL}/admin/delete-banner`, {
      method: 'POST',
      headers:{
        "Content-Type": "application/json",
        "auth-token": localStorage.getItem('token')
      },
      body: JSON.stringify({'bannerId': id})
    })

    const json = await response.json();

    if(json.success){
      createBannerTable();
      alertContext.setAlertMessage({show:true, type: "success", message: json.message});
    }
    else{
      alertContext.setAlertMessage({show:true, type: "error", message: json.message});
    }

  }
  const deleteBanner = async (id) => {
    confirmDialog({
        message: 'Do you want to delete this record?',
        header: 'Delete Record',
        accept: () => acceptDeleteBanner(id),
    });
  }
  const functionsList = {'editBanner':editBanner, 'deleteBanner':deleteBanner};

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
                <ConfirmDialog />
                {(sectionShow === 'table') && <div className="table-section">
                    <div className="mb-3 text-right">
                      <button type="button" className="btn btn-primary" onClick={() => { sectionShowHide('form') }}>Add Banner</button>
                    </div>
                    <Table tableHeader={tableHeader} tableData={tableData} section="banner" functions={functionsList}/>
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
                          <input type="text" className="form-control" id="itemTitle" name="itemTitle" onChange={handleChange} value={formData['itemTitle'].value}/>
                          <small className="error-mesg">{formData['itemTitle'].errorMessage}</small>
                        </div>
                      </div>
                      <div className="col-sm-12 col-lg-6">
                        <div className={`form-group mb-3 ${formData['itemDescription'].errorClass}`}>
                          <label htmlFor="itemDescription">Description</label>
                          <input type="text" className="form-control" id="itemDescription" name="itemDescription" onChange={handleChange} value={formData['itemDescription'].value}/>
                          <small className="error-mesg">{formData['itemDescription'].errorMessage}</small> 
                        </div>
                      </div>

                      <div className="col-sm-12 col-lg-6">
                        <div className="container" style={{width:'100%', height:'300px'}}>
                          <div className="crop-container">
                            <Cropper 
                            image={image} 
                            crop={crop} 
                            rotation={rotation} 
                            zoom={zoom} 
                            zoomSpeed={4} 
                            maxZoom={3} 
                            zoomWithScroll={true} 
                            showGrid={true} 
                            aspect={aspectRatio} 
                            onCropChange={setCrop} 
                            onCropComplete={onCropComplete} 
                            onZoomChange={setZoom} 
                            onRotationChange={setRotation}/>
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
