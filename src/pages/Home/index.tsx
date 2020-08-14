import React from 'react';
import { FiLogIn, FiMapPin} from 'react-icons/fi';
import { Link } from 'react-router-dom';

import './style.css';
import logo from '../../assets/logo.svg';

const Home = () =>{
    return (
        <div id="page-home">
            <div className="content">
                <header>
                    <img src={logo} alt="Ecoleta"/>
                </header>
                <main>
                    <h1>Seu espaço para apoiar vidas!</h1>
                    <p>Ajudamos pessoas a encontrarem pontos de doação.</p>

                    <Link className="createPoint" to="/create-point">
                        <span> <FiLogIn /></span>
                        <strong>Cadastre um ponto de doação</strong></Link>
                        <Link className="listPoint" to="/list-point">
                        <span> <FiMapPin /></span>
                        <strong>Encontre um ponto de doação</strong></Link>
                </main>
            </div>

        </div>
    )
}

export default Home;