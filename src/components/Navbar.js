import './Navbar.css';
import metamastlogo from './metamask.png';


export default function Navbar({handleBellClick, notifCount}){

    return (
        <nav>
            <img src={metamastlogo}/>
            <h2 className="nav-title">MetaMask wallet Demo</h2>
        </nav>
    );
}