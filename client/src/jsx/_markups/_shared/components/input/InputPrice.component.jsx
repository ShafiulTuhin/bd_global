import React, { useState } from 'react'

const InputPrice = () => {
    const [count, setCount] = useState(1);

    const IncNum = () => {
        setCount(parseInt(count) + 1);
    }

    const DecNum = () => {
        if (count > 0) {
            setCount(parseInt(count) - 1);
        } else {
            setCount(0);
        }
    }

    return (
        <>
            <input type="number" className="form-control" aria-label="Input group example" aria-describedby="btnGroupAddon" onChange={event => {
                setCount(event.target.value);
            }} value={count} />
            <div className="input-group-prepend">
                <div className="input-group-text btn" id="btnGroupAddon" onClick={DecNum}>-</div>
                <div className="input-group-text btn" id="btnGroupAddon" onClick={IncNum}>+</div>
            </div>
        </>
        // <div className="col-md-6">
        //     <div className="form-group">
        //         <label for="crypto">Price margin <br /> Price type</label>
        //         <div className="input-group pmt">
        //             <input type="number" className="form-control" aria-label="Input group example" aria-describedby="btnGroupAddon" onChange={event => {
        //                 setCount(event.target.value);
        //             }} value={count} />
        //             <div className="input-group-prepend">
        //                 <div className="input-group-text btn" id="btnGroupAddon" onClick={DecNum}>-</div>
        //                 <div className="input-group-text btn" id="btnGroupAddon" onClick={IncNum}>+</div>
        //             </div>
        //         </div>
        //     </div>
        // </div>
    )
}

export default InputPrice
