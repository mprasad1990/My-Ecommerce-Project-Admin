import { useCallback, useState } from "react";
import Slider from "@mui/material/Slider";
import Cropper from "react-easy-crop";
import getCroppedImg from "./Crop";

export default function EasyCrop({ image }) {

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = useCallback(async () => {
    try {
      const croppedImage = await getCroppedImg(
        image,
        croppedAreaPixels,
        rotation
      );
      console.log("donee", { croppedImage });
      setCroppedImage(croppedImage);
    } catch (e) {
      console.error(e);
    }
  }, [croppedAreaPixels, rotation, image]);

  const onClose = useCallback(() => {
    setCroppedImage(null);
  }, []);

  return (
    <>
      <div className="col-sm-12 col-lg-6">
        <button type="button"
          style={{
            display: image === null || croppedImage !== null ? "none" : "block",
          }}
          onClick={showCroppedImage}
        >
          Crop
        </button>
        <div className="container">
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
              aspect={4 / 3}
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
              <Slider
                value={rotation}
                min={0}
                max={360}
                step={1}
                aria-labelledby="rotate"
                onChange={(e, rotation) => setRotation(rotation)}
                className="range"
              />
            </label>
            <label>
              Zoom
              <Slider
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="zoom"
                onChange={(e, zoom) => setZoom(zoom)}
                className="range"
              />
            </label>
          </div>
          <div className="cropped-image-container">
            {croppedImage && (
              <img className="cropped-image" src={croppedImage} alt="cropped" />
            )}
            {/* {croppedImage && <button onClick={onClose}>close</button>} */}
          </div>
      </div>
    </>
  );
	
}

