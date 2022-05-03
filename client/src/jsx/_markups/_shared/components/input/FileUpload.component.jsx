import { blue } from "@mui/material/colors";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

const FileUploader = styled("div")`
  position: relative;
  background: #f0f0f0;
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  border: 1px solid #a0a5aa;
  width: 100%;
  flex-grow: 1;
  min-height: 220px;
  .previewer-box {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    width: 100%;
    /* border: 1px solid #17459b; */
    .previewer {
      overflow: hidden;
      margin: auto;
      width: 200px;
      height: 200px;
      position:relative;
      img {
        object-fit: contain;
        width: 100%;
        height: 100%;
        object-position: center;
        position: relative;
        z-index: 1
      }

      .metadata{
        position: absolute;
        display: flex;
        z-index: 2;
        left: 0;
        bottom: 0;
        width: 100%
      }
    }
  }
  /*   &:hover {
    button {
      opacity: 1;
    }
  } */
  button {
    transition: opacity 0.25s ease-in;
    width: auto;
    margin-top: auto;
    &:active {
      opacity: 0.75;
      filter: contrast(120%);
    }
  }
  input {
    opacity: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 2;
  }
`;

const BtnStyle = {
  position: "relative",
  zIndex: 1,
  appearance: "none",
  border: "none",
  width: "100%",
  bottom: 0,
  background: "#a0a5aa",
  color: "white",
  padding: 8,
};

const fileTypes = [
  "image/apng",
  "image/bmp",
  "image/gif",
  "image/jpeg",
  "image/pjpeg",
  "image/png",
  "image/svg+xml",
  "image/tiff",
  "image/webp",
  "image/x-icon",
];

function validFileType(file) {
  return fileTypes.includes(file.type);
}

function returnFileSize(number) {
  if (number < 1024) {
    return number + "bytes";
  } else if (number >= 1024 && number < 1048576) {
    return (number / 1024).toFixed(1) + "KB";
  } else if (number >= 1048576) {
    return (number / 1048576).toFixed(1) + "MB";
  }
}

export default function FileUpload({
  onChange = () => null,
  noPreview = false,
  inputProps = {},
  altText = "Click to select file",
  btnStyle = BtnStyle,
}) {
  const { t } = useTranslation();
  const [previews, setPreviews] = useState([]);
  const [fileList, setFileList] = useState(null);

  function processFile(files) {
    if (files && files.length) {
      setFileList(files);
      // Single upload
      const file = files.item(0);

      if (validFileType(file)) {
        const previewObj = {
          file,
          url: URL.createObjectURL(file),
          name: file.name,
          mimetype: file.type,
          size: returnFileSize(file.size),
        };

        setPreviews([previewObj]);
      }
    }
    onChange(files);
  }

  /*  function onSelected({ target }) {
    setFileList(target.files);
  }

  useEffect(() => {
    fileList && processFile();
  }, [fileList]); */

  return (
    <FileUploader>
      {/* {console.log(previews)} */}
      {!noPreview ? (
        <div className="previewer-box">
          {previews?.map(({ url, size, name }, index) => {
            return (
              <div className="previewer" key={index}>
                <img src={url} key={index} alt="" />
                <div className="metadata">
                  <span style={{ marginRight: "auto" }} className="truncate">
                    {name}
                  </span>
                  (<small>{size}</small>)
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <input
        type="file"
        {...{
          accept: "image/png, image/jpeg, .pdf",
          id: "upload-file",
          ...inputProps,
        }}
        onChange={({ target }) => processFile(target.files)}
      />

      <button type="button" style={btnStyle}>
        {t(altText)}
      </button>
    </FileUploader>
  );
}
