import React, { useState, useCallback, useRef, useContext, useEffect } from 'react'

import Slider from "@mui/material/Slider";
import Cropper from "react-easy-crop";
import getCroppedImg from "../cropper/Crop";

import LoaderContext from '../context/loader/LoaderContext';
import AlertContext from '../context/alert/AlertContext';
import { API_SOURCE_URL, RESOURCE_URL } from '../utils/constants';

import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import "primereact/resources/themes/saga-blue/theme.css";
import 'primereact/resources/primereact.min.css';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { Tooltip } from '@mui/material';

export default function Haircare() {
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
  const aspectRatio = 3 / 2;
  const [cropWidth, cropHeight] = [300, 200];
  const [image, setImage] = useState('/assets/images/no-image-300x200.jpg');
  const [crop, setCrop]   = useState({ x: 0, y: 0 });
  const [zoom, setZoom]   = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const [formData, setFormData] = useState({
    itemCategory: {required: true, value:"", errorClass:"", errorMessage:""},
    itemTitle: {required: true, value:"", errorClass:"", errorMessage:""},
    itemDescription: {required: true, value:"", errorClass:"", errorMessage:""},
    itemPrice: {required: true, value:"", errorClass:"", errorMessage:""},
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
    setImage('/assets/images/no-image-300x200.jpg');
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

  const [tableData, setTableData] = useState([])
  const createProductTable = async () => {
    const response = await fetch(`${API_SOURCE_URL}/admin/fetch-products`, {
      method: 'POST',
      headers:{
        "Content-Type": "application/json",
        "auth-token": localStorage.getItem('token')
      },
      body: JSON.stringify({category_id: 3})
    })
    let result = [];
    const json = await response.json();
    if(json.success){
      result = json.data;
    }
    setTableData(result);
  }

  useEffect(() => {
    createProductTable();
    // eslint-disable-next-line
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target;
    if(value.trim() !== ""){
      if(name == 'itemPrice' && isNaN(value)){
        setFormData({...formData, [name]: {...formData[name], value:value, errorClass:"form-error", errorMessage:"This field must be numeric"}});
      }
      else{
        setFormData({...formData, [name]: {...formData[name], value:value, errorClass:"", errorMessage:""}});
      }
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

      if(image.indexOf("no-image-300x200.jpg") >= 0){
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

        console.log(jsonData);

        loaderContext.setLoaderState("show");
        
        const response = await fetch(`${API_SOURCE_URL}/admin/save-product`, {
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
        setCroppedImage(RESOURCE_URL+"products/"+result.result.image+'?timestamp='+Math.random());
        
        loaderContext.setLoaderState("hide");

        if(result.success){
          alertContext.setAlertMessage({show:true, type: "success", message: result.message});
        }
        else{
          alertContext.setAlertMessage({show:true, type: "error", message: result.message});
        }
        
        setTimeout(()=>{
          sectionShowHide("table");
          createProductTable();
        }, 2500)
        

      }
      
    }
  }
  const editProduct = async (id) => {
    const response = await fetch(`${API_SOURCE_URL}/admin/fetch-each-product`, {
      method: 'POST',
      headers:{
        "Content-Type": "application/json",
        "auth-token": localStorage.getItem('token')
      },
      body: JSON.stringify({'productId': id})
    })
    let result = {};
    const json = await response.json();
    if(json.success){
      result = json.data;
    }
    
    if(Object.keys(result).length > 0){
      formData['itemTitle'].value       = result.title;
      formData['itemDescription'].value = result.description;
      formData['itemCategory'].value    = result.category_id;
      formData['itemPrice'].value       = result.price;
      formData['itemImage'].value       = result.image;
      setFormData({...formData, ...formData});
      var imageConfig = JSON.parse(result.image_config);
      console.log(result.source_image);
      setFormMode("update");
      setItemId(result._id);
      setImage(RESOURCE_URL+"products/"+result.source_image+'?timestamp='+Math.random());
      setCrop(imageConfig.crop);
      setZoom(imageConfig.zoom);
      setRotation(imageConfig.rotation);
      setCroppedAreaPixels(imageConfig.crop_area);
      setCroppedImage(RESOURCE_URL+"products/"+result.image+'?timestamp='+Math.random());

      setSectionShow("form");

    }
    else{
      alertContext.setAlertMessage({show:true, type: "error", message: "Record not found!"});
    }

  }
  const acceptDeleteProduct = async (id) => {
    const response = await fetch(`${API_SOURCE_URL}/admin/delete-product`, {
      method: 'POST',
      headers:{
        "Content-Type": "application/json",
        "auth-token": localStorage.getItem('token')
      },
      body: JSON.stringify({'productId': id})
    })

    const json = await response.json();

    if(json.success){
      createProductTable();
      alertContext.setAlertMessage({show:true, type: "success", message: json.message});
    }
    else{
      alertContext.setAlertMessage({show:true, type: "error", message: json.message});
    }

  }
  const deleteProduct = async (id) => {
    confirmDialog({
        message: 'Do you want to delete this record?',
        header: 'Delete Record',
        accept: () => acceptDeleteProduct(id),
    });
  }
  const productActionTemplate = (rowData) => {
    return (
      <>
        <Tooltip title="Edit" placement="top"><Link className="waves-effect" onClick={()=>{ editProduct(rowData._id) }}><i className="fas fa-pencil-alt"></i></Link></Tooltip>
        <Tooltip title="Delete" placement="top"><Link className="waves-effect ml-7" onClick={()=>{ deleteProduct(rowData._id) }}><i className="far fa-trash-alt"></i></Link></Tooltip>
      </>
    );
  }



  return (
    <div className="page-content">
      <div className="container-fluid">
        <div className="page-title-box">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h6 className="page-title">Hair Care</h6>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <ConfirmDialog />
                {sectionShow === "table" && (
                  <div className="table-section">
                    <div className="mb-3 text-right">
                      <button type="button" className="btn btn-primary" onClick={() => { sectionShowHide("form"); }}>
                        Add Product
                      </button>
                    </div>
                    <DataTable paginator rows={10} className="table-bordered" size="small" value={tableData} tableStyle={{ width: "100%" }} >
                      <Column field="title" header="Title" style={{ width: "20%" }} ></Column>
                      <Column field="description" header="Description" style={{ width: "47%" }} ></Column>
                      <Column field="price" header="Price" style={{ width: "10%" }} ></Column>
                      <Column body={(rowData) => { return moment(rowData.date).format( "MMM D, YYYY" ); }} header="Last Update" style={{ width: "15%" }} ></Column>
                      <Column className="text-center" body={productActionTemplate} header="Action" style={{ width: "8%" }} ></Column>
                    </DataTable>
                  </div>
                )}

                {sectionShow === "form" && (
                  <form name="productForm" onSubmit={handleFormSubmit}>
                    <div className="row">
                      <div className="text-right">
                        <button type="button" className="btn btn-primary" onClick={() => { sectionShowHide("table"); }} >
                          Back
                        </button>
                      </div>
                      <div className="col-sm-12 col-lg-6">
                        <div className={`form-group mb-2 ${formData["itemTitle"].errorClass}`} >
                          <label htmlFor="itemTitle">Title</label>
                          <input type="text" className="form-control" id="itemTitle" name="itemTitle" onChange= {handleChange} value={formData["itemTitle"].value} />
                          <small className="error-mesg"> {formData["itemTitle"].errorMessage} </small>
                        </div>
                      </div>
                      <div className="col-sm-12 col-lg-6">
                        <div className={`form-group mb-2 ${formData["itemDescription"].errorClass}`} >
                          <label htmlFor="itemDescription">Description</label>
                          <input type="text" className="form-control" id="itemDescription" name="itemDescription" onChange={handleChange} value={formData["itemDescription"].value} />
                          <small className="error-mesg"> {formData["itemDescription"].errorMessage} </small>
                        </div>
                      </div>
                      <div className="col-sm-12 col-lg-6">
                        <div className={`form-group mb-2 ${formData["itemCategory"].errorClass}`} >
                          <label htmlFor="itemCategory">Category</label>
                          <select defaultValue={formData["itemCategory"].value} className="form-control" id="itemCategory" name="itemCategory" onChange={handleChange}>
                            <option value="">--Select--</option>
                            <option value="1">Makeup</option>
                            <option value="2">Skin Care</option>
                            <option value="3">Hair Care</option>
                          </select>
                          <small className="error-mesg"> {formData["itemCategory"].errorMessage} </small>
                        </div>
                      </div>
                      <div className="col-sm-12 col-lg-6">
                        <div className={`form-group mb-2 ${formData["itemPrice"].errorClass}`} >
                          <label htmlFor="itemPrice">Price (&#8377;)</label>
                          <input type="text" className="form-control" id="itemPrice" name="itemPrice" onChange={handleChange} value={formData["itemPrice"].value} />
                          <small className="error-mesg"> {formData["itemPrice"].errorMessage} </small>
                        </div>
                      </div>

                      <div className="col-sm-12 col-lg-6">
                        <div className="container" style={{ width: "100%", height: "300px" }} >
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
                              onRotationChange={setRotation}
                            />
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
                        <button type="button" className="btn btn-primary" style={{ cursor: "pointer", marginRight: "10px" }} onClick={triggerInputFileCLick} >
                          Upload Image
                          <input type="file" ref={inputFileRef} name="cover" onChange={handleImageUpload} accept="img/*" style={{ display: "none" }} />
                        </button>
                        <button type="button" className="btn btn-primary" style={{ marginRight: "10px" }} onClick={handleFormSubmit} > Save </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
