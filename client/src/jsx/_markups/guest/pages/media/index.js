import { useEffect, useState, useRef } from "react";
import useServiceContextHook from "../../../../_hooks/service.context.hook";
import { Badge } from "react-bootstrap";
import Feedback from "../../../_shared/components/Feedback.component";
import useQuery from "../../../../_hooks/query.hook";

function convertImgToBase64URL(url, callback, outputFormat) {
  var img = new Image();
  img.crossOrigin = "Anonymous";
  img.onload = function () {
    var canvas = document.createElement("CANVAS"),
      ctx = canvas.getContext("2d"),
      dataURL;
    canvas.height = img.height;
    canvas.width = img.width;
    ctx.drawImage(img, 0, 0);
    dataURL = canvas.toDataURL(outputFormat);
    callback(dataURL);
    canvas = null;
  };
  img.src = url;
}

export default function Media() {
  const query = useQuery();
  const ref = useRef();
  const [downloadable, setDownloadable] = useState();

  useEffect(() => {
    if (query) {
      convertImgToBase64URL(`${query.path}`, function (base64Img) {
        setDownloadable(base64Img);
      });
    }
  }, [query]);

  return (
    <div className="top_mast">
      <div className="container mx-auto " style={{ marginTop: 100 }}>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <header>
            <h2 className="h5">Media file upload</h2>
            <Badge variant="info">{query.path}</Badge>
          </header>

          <div className="ml-auto mt-auto">
            {downloadable && (
              <a
                className="btn btn-primary text-white font-bold"
                href={downloadable}
                download
              >
                Download
              </a>
            )}
          </div>
        </div>

        <div
          className="container mx-auto border rounded bg-white my-4"
          style={{ minHeight: 200 }}
        >
          {downloadable ? (
            <figure style={{ maxWidth: 500, margin: "0 auto" }}>
              <img
                ref={ref}
                className="img-responsive"
                src={downloadable}
                alt=""
              />
            </figure>
          ) : (
            <Feedback text="Image resource cannot be found!" />
          )}
        </div>
      </div>
    </div>
  );
}
