import React, { useEffect, useState } from 'react';
import Pay from '../components/Pay';
import Request from './Request';
import Reqpay from '../components/Reqpay';
import Moralis from 'moralis';
import { useAddress, useBalance } from '@thirdweb-dev/react';
import { FiArrowUp } from 'react-icons/fi';
import axios from 'axios';
import cookies from 'js-cookie';


const Payements = () => {
    const [active, setActive] = useState("upi");
    const [USDC, setUSDC] = useState(0);
    const [userUSDC, setUserUSDC] = useState(0);
    const [userDAI, setUserDAI] = useState(0);
    const [DAI, setDAI] = useState(0);
    const [refresh, setRefresh] = useState(false);
    const [state, setState] = useState();

    const [name, setName] = useState('');
    const [upi, setUPI] = useState('');
    const [start, setStart] = useState('');
    const [last, setLast] = useState('');

    const [history, setHistory] = useState([
        // { date: '15/6/2024', token: 'USDC', loan: '10', pl: '+1.1' },
    ]);
    const [connected, setConnected] = useState('');


    const wallet = useAddress();

    const { data: userUSDCBalance, isLoading: loadingUSDCToken } = useBalance("0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8");
    const { data: userDAIBalance, isLoading: loadingDAIToken } = useBalance("0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357");

    useEffect(() => {
        const init = async () => {
            try {
                const mail = cookies.get('userEmail');
                await axios.post("http://localhost:5550/api/auth/fetchdetail",{ email: mail})
                .then((res) => {
                    console.log(res.data.user);
                    const obj = res.data.user;
                    
                    setName(obj.name);
                    const date = new Date(obj.updatedAt);
                    const d = date.getDate();
                    const m = date.getMonth() + 1;
                    const y = date.getFullYear();
                    setLast(`${d}/${m}/${y}`);
                    const dat = new Date(obj.updatedAt);
                    const dd = date.getDate();
                    const mm = date.getMonth() + 1;
                    const yy = date.getFullYear();
                    setStart(`${dd}/${mm}/${yy}`);
                    setUPI(obj.upiId);
                })
                .catch((err)=>{
                    console.log(err);
                })
            } catch (error) {
                console.log(error);
            }
        }
        init();
    })

    useEffect(() => {
        const init = async () => {
            try {
                if (loadingUSDCToken) {
                    setUserUSDC(0);
                }
                else {
                    setUserUSDC(`${userUSDCBalance.displayValue}`);
                    const response = await Moralis.EvmApi.token.getTokenPrice({
                        "chain": "0x1",
                        "include": "percent_change",
                        "exchange": "uniswapv3",
                        "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
                    });

                    console.log(response.raw.usdPrice);
                    setUSDC(response.raw.usdPrice);
                }
            } catch (error) {
                console.log(error);
            }
        }
        init();
    }, [loadingUSDCToken, wallet])

    useEffect(() => {
        if (!wallet) {
            setConnected(false);
        } else {
            setConnected(true);
            axios.post("http://localhost:5550/pay/paymentRead", { sender: wallet })
                .then((res) => {
                    const obj = res.data;
                    console.log(res.data);

                    // Create a new array to store updated history
                    const updatedHistory = obj.map((item) => {
                        const date = new Date(item.date);
                        const d = date.getDate();
                        const m = date.getMonth() + 1;
                        const y = date.getFullYear();
                        return { date: `${d}/${m}/${y}`, to: item.toUPI, keyword: item.keyword, amount: item.amount, coin: item.coin, address: item.sender };
                    });
                    

                    // Update the history state with the new array
                    setHistory(updatedHistory);
                })
                .catch((err) => {
                    alert("Failed to fetch loan history");
                });
        }
    }, [wallet]);

    useEffect(() => {
        const init = async () => {
            try {
                // await Moralis.start({
                //     apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6Ijc0MzU1NDE4LTZmNTUtNGRiZi04M2E5LTg0YmVmMWU2ZTg3ZSIsIm9yZ0lkIjoiMzk4MDY1IiwidXNlcklkIjoiNDA5MDI2IiwidHlwZUlkIjoiNmNiZGM1ZWItMTE0MS00Nzg4LWExZDItM2FkZjk3MWI2MzA0IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MTk1MDI5NjAsImV4cCI6NDg3NTI2Mjk2MH0.AJXjaSjXiJSpmYFfjFwkbK06cEcMdjHzq3b1fu3PHwQ"
                // });
                if (loadingDAIToken) {
                    setUserDAI(0);
                }
                else {
                    setUserDAI(`${userDAIBalance.displayValue}`);
                    const resp = await Moralis.EvmApi.token.getTokenPrice({
                        "chain": "0x1",
                        "include": "percent_change",
                        "exchange": "uniswapv3",
                        "address": "0x6b175474e89094c44da98b954eedeac495271d0f"
                    });

                    console.log(resp.raw);
                    setDAI(resp.raw.usdPrice);
                }
            } catch (error) {
                console.log(error);
            }
        }
        init();
    }, [loadingDAIToken, wallet])


    const toggleHandler = (paymentType) => {
        setActive(paymentType);
    }

    return (
        <div className='flex flex-col bg-black w-full text-white font-mono h-screen'>
            <div className='flex flex-col bg-black w-full text-white min-h-screen font-mono'>
    <div className="flex justify-around gap-4">
        <div className="border-2 bg-gradient-to-t from-black to-zinc-800 border-zinc-600 rounded-lg p-4 shadow-lg h-[300px] w-[550px]">
            <p className="text-lg">
                Available USDC Balance: <span className='text-lime-500'>{Number(USDC * userUSDC * 83).toFixed(2)} INR</span>
            </p>
            <p className="text-lg">
                Available DAI Balance: <span className='text-lime-500'>{Number(DAI * userDAI * 83).toFixed(2)} INR</span>
            </p>
            <div className="flex justify-around mt-4">
                <button onClick={() => toggleHandler("upi")} className={`text-end px-14 py-2 rounded ${active === "pay" ? 'bg-amber-500' : 'bg-zinc-700'} hover:bg-amber-500`}>
                    Pay
                </button>
                <button onClick={() => toggleHandler("metamask")} className={`text-end px-14 py-2 rounded ${active === "request" ? 'bg-amber-500' : 'bg-zinc-700'} hover:bg-amber-500`}>
                    Request
                </button>
            </div>
        </div>
        <div className="bg-gradient-to-t from-black to-zinc-800 border-2 border-zinc-600 p-14 rounded-lg h-[300px] shadow-lg w-[550px]">
            <p>Hello Name <span className='text-green-500'>{name}</span></p>
            <p>My UPI Id <span className='text-green-500'>{upi}</span></p>
            <p>Account Created: <span className='text-green-500'>{start}</span></p>
            <p>Last Updated: <span className='text-green-500'>{last}</span></p>
        </div>
        <div className="bg-gradient-to-t from-black to-zinc-800 border-2 border-zinc-600 p-14 rounded-lg h-[300px] shadow-lg w-[550px]">
            <p className="text-2xl text-center">Scanner</p>
        </div>
    </div>

            <div className='h-full flex justify-between mt-4 ml-2 gap-6'>
                {active === "upi" && (
                    <>
                    <Pay />
                    <div className="bg-zinc-800 border-2 border-zinc-600 p-6 h-3/4 mt-4 w-1/2 rounded-lg shadow-lg overflow-auto">
    <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
    <table className="w-full text-left">
        <thead>
            <tr>
                <th className="border-b-2 border-zinc-700 text-xl font-light text-amber-500 p-3">Date</th>
                <th className="border-b-2 border-zinc-700 text-xl font-light text-amber-500 p-3">To</th>
                <th className="border-b-2 border-zinc-700 text-xl font-light text-amber-500 p-3">Keyword</th>
                <th className="border-b-2 border-zinc-700 text-xl font-light text-amber-500 p-3">Amount</th>
                <th className="border-b-2 border-zinc-700 text-xl font-light text-amber-500 p-3">Coin</th>
                <th className="border-b-2 border-zinc-700 text-xl font-light text-amber-500 p-3">Address</th>
            </tr>
        </thead>
        {connected && (
            <tbody>
                {history.map((entry, index) => (
                    <tr key={index} className="hover:bg-zinc-700">
                        <td className="border-b border-zinc-700 p-3">{entry.date}</td>
                        <td className="border-b border-zinc-700 p-3">{entry.to}</td>
                        <td className="border-b border-zinc-700 text-yellow-500 p-3">{entry.keyword}</td>
                        <td className="border-b border-zinc-700 p-3 text-green-500 flex items-center">
                            <FiArrowUp size={24} className="mr-2" />
                            <span>{entry.amount}</span>
                        </td>
                        <td className="border-b border-zinc-700 p-3">{entry.coin}</td>
                        <td className="border-b border-zinc-700 p-3">{`${entry.address.slice(0, 4)} ... ${entry.address.slice(-4)}`}</td>
                    </tr>
                ))}
            </tbody>
        )}
        {!connected && (
            <tfoot>
                <tr>
                    <td colSpan="6" className="text-center p-4">Connect your wallet to view activity</td>
                </tr>
            </tfoot>
        )}
    </table>
</div>

                </>
                )}
                {active === "metamask" && <Request />}
                
            </div>
            </div>
        </div>
    )
}

export default Payements;
