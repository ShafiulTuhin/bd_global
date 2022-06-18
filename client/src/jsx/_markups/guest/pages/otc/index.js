import React, { useEffect, useState } from "react";
import { notify } from "../../../../_helpers/notify";
import '../advert/advert.style.css'

import useServiceContextHook from "../../../../_hooks/service.context.hook";

const trade_types = ["Market", "Limit"];

export default function Otc(){
    const [activeTradeType, setActiveTradeType] = useState(trade_types[0]);
    const [data, setData] = useState(null);
    const [errors, setErrors] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [query, setQuery] = useState(null);

    const {
        session: { user },
        services: { otc, type },
      } = useServiceContextHook();
    function onTradeTypeChange(type) {
        setActiveTradeType(type);
      }

      async function loadData(refresh = false) {
        try {
          setIsLoading(true);
          // let { data } = await cacheOrFetch(refresh);
    
          // if (!data) return;
          setData(data.result);
        } catch (err) {
          setErrors(err.message);
          console.error(err);
        } finally {
          setIsLoading(otc?.isFetching);
        }
      }
     
return (<div>
     <section id="mainTop">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h3
                className="wow animate__animated fadeInDown"
                data-wow-delay="0.3s"
              >
                OTC Trade
              </h3>
            </div>
          </div>
        </div>
      </section>

      <section id="lnb">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <ul className="buy_sell clear">
                {trade_types.map((type, key) => (
                  <li
                    key={key}
                    className={activeTradeType === type ? "on" : ""}
                  >
                    <a
                      style={{ userSelect: "none" }}
                      disabled={isLoading}
                      className="text-capitalize cursor-pointer"
                      to="#"
                      onClick={() => !isLoading && onTradeTypeChange(type)}
                    >
                      {type}
                    </a>
                  </li>
                ))}
              </ul>
             
            </div>
          </div>
        </div>
      </section>
</div>)
}


