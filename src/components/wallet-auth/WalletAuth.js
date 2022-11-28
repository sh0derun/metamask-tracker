import detectEthereumProvider from "@metamask/detect-provider";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import styled from "styled-components";
import StoreKeys from "../../constants/app-store.js";
import ChainMap from "../../constants/chain-map.js";
import Status from "../../constants/status.js";
import "./WalletAuth.css"

const theme = {
    orangeLogin: {
        default: "#f57c00",
        hover: "#fb8c00",
        padding: "10px 30px",
        cursor: "pointer",
        textTransform: "uppercase"
    },
    orangeAddress: {
        default: "#f57c00",
        hover: "#fb8c00",
        padding: "10px 30px",
        textAlign: "center",
        textTransform: "uppercase"
    },
    green: {
        default: "#4caf50",
        padding: "10px 20px",
        textTransform: "none"
    }
};

const Button = styled.button`
  background-color: ${(props) => theme[props.theme].default};
  color: #fff;
  padding: ${(props) => theme[props.theme].padding};
  border: 0;
  font-weight: bold;
  border-radius: 6px;
  cursor: ${(props) => theme[props.theme].cursor};
  box-shadow: 2px 2px 7px lightgray;
  text-transform: ${(props) => theme[props.theme].cursor};
  outline: 0;
  text-align: ${(props) => theme[props.theme].textAlign};
  
  &:hover{
    background-color: ${(props) => theme[props.theme].hover};
  }

  transition: ease-in background-color 300ms;
`;

Button.defaultProps = {
    theme: "orange"
};

export default function WalletAuth(){

    const [status, setStatus] = useState(localStorage.getItem(StoreKeys.walletAuthStatus) ? localStorage.getItem(StoreKeys.walletAuthStatus) : Status.IDLE);
    const [accountAddress, setAccountAddress] = useState(localStorage.getItem(StoreKeys.accountAddress) ? localStorage.getItem(StoreKeys.accountAddress) : "");
    const [network, setNetwork] = useState(localStorage.getItem(StoreKeys.network) ? localStorage.getItem(StoreKeys.network) : "");

    useEffect(() => {
        const id = setInterval(() => {
            if(window.ethereum){
                window.ethereum.request({ method: 'eth_accounts' }).then((accounts) => {
                    if (accounts.length === 0) {
                        setStatus(Status.IDLE);
                        localStorage.setItem(StoreKeys.walletAuthStatus, Status.IDLE);
                    }else{
                        setStatus(Status.SUCCESS);
                        localStorage.setItem(StoreKeys.walletAuthStatus, Status.SUCCESS);
                        
                        window.ethereum.request({method: "eth_chainId"}).then(chainId=>{
                            setNetwork(ChainMap[chainId]);
                            localStorage.setItem(StoreKeys.network, ChainMap[chainId]);
                        }).catch(error=>console.log(error));

                        window.ethereum.request({method: "eth_accounts"}).then(accounts=>{
                            setAccountAddress(accounts[0]);
                            localStorage.setItem(StoreKeys.accountAddress, accounts[0]);
                        }).catch(error=>console.log(error));
                    }
                }).catch((e)=>{
                    setStatus(Status.IDLE);
                    localStorage.setItem(StoreKeys.walletAuthStatus, Status.IDLE);
                    console.error(e);
                });
            }
        }, 1000);
        return () => {
            clearInterval(id);
        }
    }, []);

    const handleLogin = async () => {
        const provider = await detectEthereumProvider();
        
        if (provider) {
            
            localStorage.setItem(StoreKeys.walletAuthStatus, Status.SUCCESS);

            try{
                const accounts = await toast.promise(provider.request({method: "eth_requestAccounts"}), {
                    pending: {
                        render(){
                            setStatus(Status.PENDING);
                            localStorage.setItem(StoreKeys.walletAuthStatus, Status.PENDING);
                            return "Login pending";
                        }
                    }, 
                    error: {
                        render({data}){
                            setStatus(Status.IDLE);
                            localStorage.setItem(StoreKeys.walletAuthStatus, Status.IDLE);
                            let message = data.message;
                            if (data.code === 4001) {
                                message = 'login was rejected, please connect to MetaMask.';
                            }
                            return `${message}`;
                        }
                    }, 
                    success: {
                        render({data}){
                            setStatus(Status.SUCCESS);
                            localStorage.setItem(StoreKeys.walletAuthStatus, Status.SUCCESS);
                            setAccountAddress(data[0]);
                            localStorage.setItem(StoreKeys.accountAddress, data[0]);
                            return `Login Success`;
                        }
                    }
                },{
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    pauseOnHover: true,
                    draggable: false,
                    progress: undefined,
                    theme: "light",
                });

                setAccountAddress(accounts[0]);
                localStorage.setItem(StoreKeys.accountAddress, accounts[0]);

                const chainId = await provider.request({method: "eth_chainId"});
                setNetwork(ChainMap[chainId]);
                localStorage.setItem(StoreKeys.network, ChainMap[chainId]);

                provider.on('chainChanged', (chainId)=>{
                    setNetwork(ChainMap[chainId]);
                    localStorage.setItem(StoreKeys.network, ChainMap[chainId]);
                });

            }catch(error){
                console.error(error.message);
                setAccountAddress("");
                setNetwork("");
                setStatus(Status.IDLE);
            }
        } else {
            toast.error("you need to download metamask or ethereum browser to login", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
            setAccountAddress("");
            setNetwork("");
            setStatus(Status.IDLE);
        }
    };

    return (
        <div className="container">
            {status !== Status.SUCCESS ?
                <Button theme="orangeLogin" className="right" onClick={handleLogin}>Login</Button>
                : <div className="right">
                    <Button className='login-info' theme="green">Network : {network}</Button>
                    <Button className='login-info' theme="orangeAddress">Account Address : {accountAddress}</Button>
                </div>
            }
            <ToastContainer/>
        </div>
    )
}