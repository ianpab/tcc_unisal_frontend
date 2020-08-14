import React , { useEffect, useState, Component} from 'react';
import { Link, Route ,useParams, useHistory} from 'react-router-dom';
import { FiArrowLeft, FiCameraOff} from 'react-icons/fi';

import './style.css';
import logo from '../../assets/logo.svg';
import api from '../../services/api';



interface Params{
    point_id: number,
  }
  interface Data{
    point:{
      id:number; 
      image: string;
      image_url:string;
      name: string;
      email: string;
      whatsapp: string;
      city: string;
      uf: string;
    };
    item:{ 
      title: string;
    }[];
  }

  
  const Detail = () => {

    const [ data, setData] = useState<Data>({} as Data);
    const { id } = useParams();    
    const history = useHistory();

    useEffect(() => {
      api.get(`points/${id}`).then(response => {
        setData(response.data);
      })
    },[])


  if(!data.point){
    return null;
  }
  function redirectToEdit(id : number){
    history.push(`/update-point/${id}`); 
}
function redirectToDelete(id : number){
    api.delete(`points/${id}`);
    alert('Deletado com sucesso');
    history.push(`/list-point`);
}
  
    return (

        
        <div id="page-list-point">
            <header>
                <img src={logo} alt="Doapp"/>
                <Link to="/list-point"><FiArrowLeft />Voltar para Lista</Link>
            </header>

            <form>
            <h1>{data.point.name}</h1>
              
            <fieldset>
    <h3>Endereço: </h3><span>{data.point.city}, {data.point.uf}.</span><br/><br/>
    <h3>Telefone:</h3><span>{data.point.whatsapp}</span><br/><br/>
    <h3>E-mail:</h3><span>{data.point.email}</span><br/><br/>
    <h3>Doações:</h3><span>{data.item.map(item => item.title).join(', ')}</span><br/><br/>
    
               </fieldset> 
               <div>
               <button className="editButton" type="submit" onClick={() => redirectToEdit(data.point.id)}>Editar ponto</button>
               <button className="deleteButton" type="submit" onClick={() => redirectToDelete(data.point.id)}>Deletar ponto</button>
               </div>
          </form>
        </div>
    );
}

export default Detail;