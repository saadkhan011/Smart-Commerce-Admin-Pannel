import React from 'react';
import { RotatingLines } from 'react-loader-spinner';

const Spinner = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm z-50">
        <RotatingLines
            visible={true}
            height="96"
            width="96"
            color="red"
            strokeWidth="5"
            animationDuration="0.75"
            ariaLabel="rotating-lines-loading"
            wrapperStyle={{}}
            wrapperClass=""
        />
    </div>
);

export default Spinner;
