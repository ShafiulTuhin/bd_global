import { useTranslation } from 'react-i18next'
function UnderConstruction() {
  const { t } = useTranslation()
  return (
    <div
      className
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        margin: "auto",
        minHeight: "85vh",
        justifyContent: "center"
      }}
    >
      <div class="row justify-content-center h-100 align-items-center">
        <div class="col-md-5">
          <div class="form-input-content text-center error-page">
            <h1 class="error-text font-weight-bold">
              <i class="fa fa-times-circle text-danger"></i>
            </h1>
            <h4>{t("Feature is currently Unavailable")}</h4>
         
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnderConstruction;
