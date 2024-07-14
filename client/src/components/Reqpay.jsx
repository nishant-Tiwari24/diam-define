import React, { useState, useEffect } from "react";
// import { GrRadial } from "react-icons/gr";
// import { GrRadialSelected } from "react-icons/gr";
import { ConnectWallet, useAddress, useContract, useTransferToken } from '@thirdweb-dev/react';
import Pay from "./Pay.jsx";
import api from "../utils/api.js"
import cookies from "js-cookie";

const Reqpay = () => {
  const [paytoggle, setPaytoggle] = useState(false);
  const [reqtoggle, setReqtoggle] = useState(false);
  const [data, setData] = useState([]);
  const [paythrough, setPaythrough] = useState("metamask");
  const [upi, setUpi] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setKeyword] = useState(""); 
  const [oreq, setOreq] = useState([]);
  
  const [metamaskID, setMetamaskId] = useState();
  const [USDC, setUSDC] = useState('');
  const [DAI, setDAI] = useState('');

  const { contract: usdcToken } = useContract('0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8');
    const {
        mutateAsync: transferUSDC,
        isLoading: loadingTransferUSDC,
        error: usdcError,
    } = useTransferToken(usdcToken);
    const { contract: daiToken } = useContract('0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357');
    const {
        mutateAsync: transferDAI,
        isLoading: loadingTransferDAI,
        error: daiError,
    } = useTransferToken(daiToken);

  const reqcloseHandler = () => {
    setReqtoggle(!reqtoggle);
  };

  const address = useAddress();

  const reqHandler = () => {
    try {
      (async () => {
        const res = await api.post("/money-transfer/money-requested", {
          receiver: upi,
          amount: amount,
          reason: reason
        });
        const res2 = await api.get("/money-transfer/user-money-requested");
        const a = await res2.data.data;
        console.log(a, res2);
        setOreq((prevOreq) => [...prevOreq, a]);
        console.log(res.data);
        setReqtoggle(!reqtoggle);
        setPaytoggle(false);
      })();
    } catch (error) {
      console.log(error);
    }
  };

  const payHandler = async () => {
      try {
          if(loadingTransferDAI){
              return alert('loading..');
          }
          if(loadingTransferUSDC){
              return alert('loading..');
          }
          const email = cookies.get("userEmail");
          const response = await api.post("/auth/fetchdetail", { 'waddr': address });
  
          if (response.data === 'no') {
              alert('Your wallet address is not linked!');
              return;
          }
  
          const userDetailsResponse = await api.post("/auth/fetchdetail", { email: email });
          const details = userDetailsResponse.data.user;
          setMetamaskId(details.metamaskId);
  
          if (address !== details.metamaskId) {
              alert('Wallet address not linked with your UPI, Check your wallet address');
              return;
          }
  
          if (!amount || !option || !upi) {
              alert("Missing fields!");
              return;
          }
  
          const receiverResponse = await api.post("/auth/fetchdetail", { upi: upi });
          const receiver = receiverResponse.data.data.metamaskId;
          console.log("rec", receiverResponse);
  
          let val, mtm, total, transferFunction;
          if (option === 'USDC') {
              val = ((amount / 83) * Number(USDC).toFixed(2));
              mtm = (0.2 * val).toFixed(2);
              total = (Number(val) + Number(mtm)).toFixed(2);
              transferFunction = transferUSDC;
          } else if (option === 'DAI') {
              val = ((amount / 83) * Number(DAI).toFixed(2));
              mtm = (0.2 * val).toFixed(2);
              total = (Number(val) + Number(mtm)).toFixed(2);
              transferFunction = transferDAI;
          } else {
              alert("Invalid payment option!");
              return;
          }

          if (window.confirm(`Pay: ${val}\nMTM Fee: ${mtm}\nTotal: ${total}`)) {
              console.log("rec", receiver);
          // const rmc="0x6ad330dd68BeAF54cf4ACd311d91991F8Faa94E9";
          await transferFunction({
              to: receiver,
              amount: total,
          });
  
          const date = new Date().toLocaleDateString();
          await axios.post("http://localhost:5550/pay/paymentWrite", {
              date: date,
              to: upi,
              amt: amount,
              sender: walletAddress,
              keyword: keyword,
              coin: option,
          });
          }
          else {
              console.log("transaction cancelled!")
          }
          
      } catch (error) {
          console.log(error);
      }
  };

  const closeHandler = () => {
    setPaytoggle(false);
  };
  const paythroughHandler = (type) => {
    setPaythrough(type);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/money-transfer/all-request-money");
        const res2 = await api.get("/money-transfer/user-money-requested");
        const a = await res.data;
        const b = await res2.data;
        setData(a.money.requests);
        setOreq(b.data);
        console.log(a);
        console.log(data);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);
  return (
    <>
      <p className="text-lg text-green-500">
        <strong>OUTGOING REQUESTS</strong>
      </p>
      <br></br>
      <button
        onClick={reqcloseHandler}
        className=" rounded-full p-5 bg-icon text-black w-[200px] h-[60px]"
      >
        Request
      </button>
      <br></br>
      <br></br>

      {
        oreq.length == 0 ?(
          <p className=" text-xl text-gray-400">No Request data found.</p>
        ) :
        (
          oreq.map((e, index)=>(
            <div key={index} className="flex my-3 justify-between items-center w-full border-2 border-zinc-400 rounded-lg bg-boxbg p-8">
              <p className="text-green-400 flex items-center font-bold text-2xl">
                +{e.amount}
              </p>
              <div className=" flex flex-col justify-center">
                <p className="text-sm text-stone-400 inset-x-0 bottom-0 font-medium">
                  {e.reason}
                </p>
                <p className="text-sm text-stone-400 inset-x-0 bottom-0 font-medium">
                  {e.sender}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 rounded-full h-2 bg-orange-600"></div>
                <p>pending</p>
              </div>
            </div>
          ))
        )
      }

      {/* <div className="flex justify-between items-center w-full border-2 border-zinc-400 rounded-lg bg-boxbg p-8">
        <p className="text-green-400 flex items-center font-bold text-2xl">
          +700
        </p>
        <div className=" flex flex-col justify-center">
          <p className="text-sm text-stone-400 inset-x-0 bottom-0 font-medium">
            Name
          </p>
          <p className="text-sm text-stone-400 inset-x-0 bottom-0 font-medium">
            7066661607@upi
          </p>
        </div>
        <button
          onClick={payHandler}
          className=" rounded-full p-5 bg-icon text-black w-24 h-full"
        >
          status
        </button>
      </div> */}

      <br></br>
      <p className="text-lg text-green-500">
        <strong>INCOMING REQUESTS</strong>
      </p>
      <br></br>
      {data.length == 0 ? (
        <p className=" text-xl text-gray-400">No data found.</p>
      ) : (
        data.map((e) => (
          <div
            key={e._id}
            className="flex justify-between items-center w-full border-2 border-zinc-400 rounded-lg bg-boxbg p-8"
          >
            <p className="text-red-400 flex items-center font-bold text-2xl">
              -{e.amount}
            </p>
            <div className=" flex flex-col justify-center">
              <p className="text-sm text-stone-400 inset-x-0 bottom-0 font-medium">
                {e.name}
              </p>
              <p className="text-sm text-stone-400 inset-x-0 bottom-0 font-medium">
                {e.sender}
              </p>
            </div>
            <button
              onClick={payHandler}
              className=" rounded-full p-5 bg-icon text-black w-24 h-full"
            >
              Pay
            </button>
          </div>
        ))
      )}

      {paytoggle && (
        <div className="h-full absolute inset-0 flex items-center justify-center backdrop-blur-sm">
          <p className="cursor-pointer" onClick={() => setPaytoggle(false)}>
            close
          </p>
          <Pay />
        </div>
      )}

      {reqtoggle && (
        <div className="h-full absolute inset-0 flex items-center justify-center backdrop-blur-sm">
          {/* <p className="cursor-pointer" onClick={() => setPaytoggle(false)}>
              close
            </p> */}
          <div className="flex flex-col justify-between w-1/4 h-2/4 bg-boxbg rounded-md p-5 border-2 border-stone-400">
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="UPI ID"
                onChange={(e) => setUpi(e.target.value)}
                className="p-4 bg-neutral-700 outline-none rounded-md"
              />
              <input
                type="number"
                placeholder="Amount INR"
                onChange={(e) => setAmount(e.target.value)}
                className="p-4 bg-neutral-700 outline-none rounded-md"
              />
              <input
                    type="text"
                    placeholder="Ex: groccery,snacks,fun"
                    onChange={(e) => setKeyword(e.target.value)}
                    className='p-4 bg-neutral-700 outline-none rounded-md'
                />
            </div>
            <div className="flex gap-4">
              <button
                onClick={reqcloseHandler}
                className="w-full bg-blue-900 p-4 rounded-full"
              >
                cancel
              </button>
              <button
                onClick={reqHandler}
                className="w-full bg-fadeBlue p-4 rounded-full"
              >
                Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Reqpay;
