import React, { useState } from 'react'
import { toast } from "react-toastify";

const CopyComponent = (data) => {
    
    async function copyClick() {
        await navigator.clipboard.writeText(data.data);
        toast.info("Invite code copied!", { hideProgressBar: true });
    }

    return (
        <>
            <div className='d-flex flex-row'>
                <div className="d-sm-inline-flex">
                    <input style={{ border: 0, backgroundColor: "#fff" }} type="text" className="form-control" value={data.data} disabled />
                </div>
                <button style={{ backgroundColor: "#fff" }} type="button" class="btn btn-light" onClick={copyClick}><i
                    className="fal fa-copy"
                ></i></button>
            </div>
        </>
    )
}

export default CopyComponent
