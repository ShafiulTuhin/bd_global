import React, { useState, useEffect } from "react";
import { ToggleButton, ToggleButtonGroup, Modal, Breadcrumb, Button } from "react-bootstrap";
import "./support.style.scss";

import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import useServiceContextHook from "../../../../_hooks/service.context.hook";
import useQuery from "../../../../_hooks/query.hook";

// HELPERS
import { routeMap } from "../../routes";

import useToggler from "../../../../_hooks/toggler.hook";
import SupportBanner from "./component/SupportBanner.component";

export default function SupportByID() {
    const { t } = useTranslation();
    const { services: { faq } } = useServiceContextHook();
    const [data, setData] = useState(null);
    const params = useParams();

    async function fetchData() {
        try {
            let { data, error } = await faq.findByID(params.id);
            if (error) throw new Error(error);
            // console.log(data);
            setData(data)

        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <>
            <div className="content">

                <section className="">
                    <div className="container-fluid">
                        <div className="container">
                            <div className="Support-detail">
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className=" py-3 d-md-flex justify-content-between">
                                            <div className="bc-icons-2">
                                                <ol className="breadcrumb purple lighten-4">
                                                    <li className="breadcrumb-item"><Link className="black-text home-text font-weight-bold" to={routeMap?.home}>Home</Link><i className="fa fa-angle-right mx-2" aria-hidden="true"></i></li>
                                                    <li className="breadcrumb-item"><Link className="black-text home-text font-weight-bold" to={routeMap?.support}>support</Link><i className="fa fa-angle-right mx-2" aria-hidden="true"></i></li>
                                                    <li className="breadcrumb-item active dt-text font-weight-bold">Data</li>
                                                </ol>
                                            </div>
                                            {/* <div className="form-group has-search px-3">
                                                <span className="fa fa-search form-control-feedback"></span>
                                                <input type="text" className="form-control ser-box" placeholder="Search" />
                                            </div> */}
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-12">
                                        <div className="sec-head-text px-3" >{data?.question}</div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-12">
                                        <div className="py-3 px-3 sub-details">
                                            {data?.answer}
                                        </div>
                                        {/* <div className="mn-sub-details px-3">For deposits and withdrawals in Korean Won and digital asset withdrawals from Mobile AM, Kakao Pay   is essential.
                                        </div>
                                        <div className="pt-3 px-3 sub-details">
                                            If you have never used a KakaoPay certificate before, you must register for KakaoPay only once for the first time.
                                        </div>
                                        <div className="pt-3 px-3 sub-details">
                                            Please follow the path below to activate Kakao Pay simple authentication before use.
                                        </div>
                                        <div className="pc-wec-text px-3">*PC web</div>
                                        <div className="pt-1 px-3 sub-details">
                                            470 -[Click “Register” for 2-channel authentication] -[Enable Kakao Pay authentication]
                                        </div>
                                        <div className="pc-wec-text px-3">* Mobile app</div>
                                        <div className="pt-1 px-3 sub-details">
                                            When information] -[Membership level] -[Kakao Pay authentication]-[Activation authentication]
                                        </div> */}
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-12">
                                        <div className="box-border">
                                        </div>
                                    </div>
                                </div>

                                <div className="row justify-content-center mb-5">
                                    <div className="col-12 text-center">
                                        {/* <p className="pb-2 btn-top-bottom-text">Was this helpful?</p> */}
                                        <Link to={routeMap?.support} className="mr-1 btn btn-primary mr-3">
                                            <i className="fa fa-arrow-left"></i>{" "}
                                            {t("List")}
                                        </Link>
                                        {/* <button type="button" className="mr-1 btn btn-primary mr-3 ">
                                            <i className="fa fa-check" aria-hidden="true"></i> Yes
                                        </button> */}
                    {/* <button type="button" className="mr-1 btn btn-primary">
                                            <i className="fa fa-close" aria-hidden="true"></i> No
                                        </button> */}
                    {/* <p className="pt-2 btn-top-bottom-text">61 out of 1572 found it helpful.</p> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
