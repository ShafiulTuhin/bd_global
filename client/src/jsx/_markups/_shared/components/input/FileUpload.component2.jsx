import { blue } from "@mui/material/colors";
import { indexOf } from "lodash";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

const FileUploader = styled("div")`
  .wrapimg {
    width: 500px;
    margin: auto;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 4px;
    background-color: #ffffff;
    box-shadow: 0 1px 2px 0 #c9ced1;
    padding: 1.25rem;
    margin-bottom: 1.25rem;
    display: contents;
  }

  .wrapimg h1 {
    margin: 0 0 20px;
    padding-top: 15px;
    font-size: 18px;
  }

  /* ------------------------------ UPLOAD BTNS BEGIN ------------------------------ */
  .upload__wrapimg {
    padding-bottom: 0.9375rem;
    margin-bottom: 0.9375rem;
    border-bottom: 1px dotted #edeff0;
  }

  .upload__mess {
    border-left: solid 3px #ffb74d;
    padding-left: 0.5rem;
    color: #b5bac1;
  }

  .upload p {
    line-height: 2;
  }

  .upload p strong {
    color: #2f3640;
    padding-left: 0.3125rem;
  }

  .upload__item {
    position: relative;
    display: inline-block;
    vertical-align: top;
    margin-right: 1.5625rem;
    margin-bottom: 1.5625rem;
  }

  .upload__del {
    display: block;
    position: absolute;
    right: -8px;
    top: -8px;
    width: 21px;
    height: 22px;
    background: url("http://timra.ru/portfolio/8_auto.uz/img/icons/delete-icon-copy.svg")
      0 0 no-repeat;
    cursor: pointer;
    opacity: 0.8;
  }

  .upload__del:hover {
    opacity: 1;
  }

  .upload__img {
    width: 5.6875rem;
    height: 5.6875rem;
    -o-object-fit: contain;
    object-fit: contain;
  }

  .upload__btn {
    position: relative;
    display: inline-block;
    vertical-align: top;
    width: 5.6875rem;
    height: 5.6875rem;
    line-height: 5.6875rem;
    border-radius: 2px;
    border: solid 0.5px #dee1e6;
    text-align: center;
    cursor: pointer;
    opacity: 0.6;
    overflow: hidden;
  }

  .upload__btn:after {
    content: "+";
    color: #dee1e6;
    font-size: 2.5rem;
    line-height: 5rem;
    cursor: pointer;
  }

  .upload__btn:hover {
    opacity: 0.99;
  }

  .upload__btn:active {
    box-shadow: inset 10px 10px 90px -30px rgba(0, 0, 0, 0.1);
  }

  .upload__input {
    opacity: 0;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    cursor: pointer;
    z-index: 100;
  }

  .hidden_ms {
    display: none;
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
  files,
  setFieldValue = { setFieldValue },
}) {
  const { t } = useTranslation();
  const [previews, setPreviews] = useState([]);
  const [fileList, setFileList] = useState(null);

  function processFile(files) {
    if (files && files.length) {
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
        const tempArray1 = [...previews, previewObj];
        setPreviews(tempArray1);
      }
    }
    onChange(previews);
  }

  function omRemoveItem(e) {
    let id = e.target.attributes.getNamedItem("dataId").value;
    let obj = previews?.find((o) => o.file.size == id);
    let ind = previews.indexOf(obj);
    const tempArray = [...previews];
    tempArray.splice(ind, 1);
    setPreviews(tempArray);
  }
  // console.log(previews);

  useEffect(() => {
    setFieldValue("files", previews);
  }, [previews]);

  return (
    <FileUploader>
      <div className="wrapimg">
        {/* <h1>File upload multiple</h1> */}
        <div className="upload upload">
          <div className="upload__wrapimg">
            {previews?.map(({ url, size, name, file }, index) => {
              return (
                <div className="upload__item" key={index}>
                  <img src={url} key={index} className="upload__img" alt="" />
                  <a
                    dataId={file.size}
                    className="upload__del"
                    onClick={(e) => {
                      omRemoveItem(e);
                    }}
                  ></a>
                </div>
              );
            })}
            <div className="upload__btn">
              <input
                className="upload__input"
                type="file"
                name="upload[]"
                multiple="multiple"
                data-max-count="4"
                accept="image/*"
                onChange={({ target }) => processFile(target.files)}
              />
            </div>
          </div>
        </div>
      </div>
    </FileUploader>
  );
}
