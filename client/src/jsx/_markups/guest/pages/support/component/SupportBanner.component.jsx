import { useTranslation } from "react-i18next";
import { FieldGroup } from "../../../../_shared/components/styled.component";
import "../support.style.scss";

export default function SupportBanner({ setTextState, onSuggetionClick, completions }) {
  const { t } = useTranslation();
  return (
    <div className="support-banner" id="support">
      <div className="container">
        <header>
          <h4 className="banner__header">{t("Search your questions.")}</h4>
        </header>
        <div className=" support-search-input">
          <input
            type="text"
            placeholder={t("search")}
            aria-label="search"
            className="input__field"
            aria-describedby="basic-addon1"
            style={{borderRadius: 4, paddingLeft: 12}}
            onChange={(e) => setTextState(e.target.value)}
          />
          {completions && completions.length != 0 ? (
            <div id="result">
              <ul>
                {completions &&
                  completions.map((val, index) =>
                    index < 5 ? (
                      <li
                        key={index}
                        className={"font-weight-bold cursor-pointer"}
                        onClick={() => {
                          onSuggetionClick(val);
                        }}
                        key={index}
                      >
                        {val.question}
                      </li>
                    ) : null
                  )}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
