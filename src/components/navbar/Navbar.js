import './Navbar.css';
import metamastlogo from './metamask.png';
import 'react-toastify/dist/ReactToastify.css';
import WalletAuth from '../wallet-auth/WalletAuth.js';


export default function Navbar() {
    return (
        <div>
            <nav>
                <img alt='MetaMask wallet Demo' src={metamastlogo} />
                <h2 className="nav-title">MetaMask wallet Demo</h2>
                <WalletAuth/>
            </nav>
        </div>
    );
}

