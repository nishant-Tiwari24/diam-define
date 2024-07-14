import React, { useState } from 'react';
import QRCode from 'qrcode.react';

const QRCodeGenerator = ({upi}) => {

    return (
        <div>
                <QRCode value={upi} />
        </div>
    );
};

export default QRCodeGenerator;
