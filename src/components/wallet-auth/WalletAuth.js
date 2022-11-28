import detectEthereumProvider from "@metamask/detect-provider";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import styled from "styled-components";
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

    const [status, setStatus] = useState(localStorage.getItem("walletAuthStatus") ? localStorage.getItem("walletAuthStatus") : Status.IDLE);
    const [accountAddress, setAccountAddress] = useState(localStorage.getItem("accountAddress") ? localStorage.getItem("accountAddress") : "");
    const [network, setNetwork] = useState(localStorage.getItem("network") ? localStorage.getItem("network") : "");

    useEffect(() => {
        const id = setInterval(() => {
            if(window.ethereum){
                window.ethereum.request({ method: 'eth_accounts' }).then((accounts) => {
                    if (accounts.length === 0) {
                        setStatus(Status.IDLE);
                        localStorage.setItem("walletAuthStatus", Status.IDLE);
                    }else{
                        setStatus(Status.SUCCESS);
                        localStorage.setItem("walletAuthStatus", Status.SUCCESS);
                        
                        window.ethereum.request({method: "eth_chainId"}).then(chainId=>{
                            setNetwork(ChainMap[chainId]);
                            localStorage.setItem("network", ChainMap[chainId]);
                        }).catch(error=>console.log(error));
                    }
                }).catch((e)=>{
                    setStatus(Status.IDLE);
                    localStorage.setItem("walletAuthStatus", Status.IDLE);
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
            
            localStorage.setItem("walletAuthStatus", Status.SUCCESS);

            try{
                const accounts = await toast.promise(provider.request({method: "eth_requestAccounts"}), {
                    pending: {
                        render(){
                            setStatus(Status.PENDING);
                            localStorage.setItem("walletAuthStatus", Status.PENDING);
                            return "Login pending";
                        }
                    }, 
                    error: {
                        render({data}){
                            setStatus(Status.IDLE);
                            localStorage.setItem("walletAuthStatus", Status.IDLE);
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
                            localStorage.setItem("walletAuthStatus", Status.SUCCESS);
                            setAccountAddress(data[0]);
                            localStorage.setItem("accountAddress", data[0]);
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
                localStorage.setItem("accountAddress", accounts[0]);

                const chainId = await provider.request({method: "eth_chainId"});
                setNetwork(ChainMap[chainId]);
                localStorage.setItem("network", ChainMap[chainId]);

                provider.on('chainChanged', (chainId)=>{
                    setNetwork(ChainMap[chainId]);
                    localStorage.setItem("network", ChainMap[chainId]);
                    console.log(network);
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