import React , { useEffect, useState, ChangeEvent, FormEvent} from 'react';
import { Link, useHistory, Redirect } from 'react-router-dom';
import { FiArrowLeft} from 'react-icons/fi';
import { Map, TileLayer, Marker} from 'react-leaflet';
import axios from 'axios';
import L, { icon } from 'leaflet'


import './style.css';
import logo from '../../assets/logo.svg';
import api from '../../services/api';
import thumb from '../../assets/home-background.svg';


interface Item{
    id: number,
    title: string,
    image_url: string,
  }
  
  interface Point{
    id: number;
    image: string;
    name: string;
    latitude: number;
    longitude: number;
  }
  
  interface Params{
    uf: string;
    city: string;
  }
  interface Coords{
    lat:string;
    lon:string;
  }

  interface IBGEUFResponse {
    sigla: string
}

interface IBGECityResponse {
    nome: string

}

  
  const Points = () => {
    
      const [items, setItems] = useState<Item[]>([]);
      const [ selectedItems, setSelectedItems] = useState<number[]>([0]);
      const [ initialPosition, setInitialPosition] = useState<Coords[]>([]);
      const [ selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0]);
      const [ points, setPoints] = useState<Point[]>([]);
      const [ uf, setUFs] = useState<string[]>([]);
      const [ cities, setCities] = useState<string[]>([]);
      const [ selectedUF, setSelectedUF] = useState('0');
      const [ selectedCity, setSelectedCity] = useState('Campinas');
  
     const history = useHistory();
  
      useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data);
        })
      },[]);
  
      useEffect(() => {
        api.get('/points', {
          params:{
            city: selectedCity,
            uf: selectedUF,
            items: selectedItems,
          }
        }).then(response => {
          setPoints(response.data);
        })
      }, [selectedItems]);
      
  
   
      useEffect(() => {
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome').then(response =>{
        const UFInitials = response.data.map(uf => uf.sigla );    
         setUFs(UFInitials);
        });
     },[]);
 
     useEffect(() => {
         if(selectedUF === '0'){
             return;
         }
         axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios?orderBy=nome`).then(response =>{
         const cityName = response.data.map(city => city.nome );   
         setCities(cityName);
         
             });
      },[selectedUF]); //quando o valor for alterado executa useEffect
 
      useEffect(() => {
         axios.get<Coords[]>(`https://nominatim.openstreetmap.org/?state=${selectedUF}&city=${selectedCity}&format=json&limit=1`).then(response => {
         const coords = response.data;  
         setInitialPosition(coords); 
         
         })
       },[selectedCity]);
  
  
      function handleSelectedItem(id: number){
        const alreadySelected = selectedItems.findIndex(item => item === id);
    
        if(alreadySelected >= 0){
            const filteredItems = selectedItems.filter(item => item !== id)
            setSelectedItems(filteredItems);
        } else{
            setSelectedItems([...selectedItems, id]);
        }
    }
  
function redirectToItem(id : number){
    history.push(`/points-item/${id}`); 
}

        //Change para o select de estados
 function handleSelectUf(event : ChangeEvent<HTMLSelectElement>){
    const uf = event.target.value;
    setSelectedUF(uf);
}

function handleSelectCity(event : ChangeEvent<HTMLSelectElement>){
   const city = event.target.value;
   setSelectedCity(city);
}
    return (

        
        <div id="page-list-point">
            <header>
                <img src={logo} alt="Doapp"/>
                <Link to="/"><FiArrowLeft />Voltar para Home</Link>
            </header>

            <form>
                <h1>Pontos de doação</h1>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select onChange={handleSelectUf} value={selectedUF} name="uf" id="uf">
                            <option value="0">Selecione um estado</option>
                                {uf.map(estado =>(
                                    <option key={estado} value={estado}>{estado}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" onChange={handleSelectCity} value={selectedCity}>
                                <option value="0">Selecione um cidade</option>
                                {cities.map(city =>(
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="field-group">
                    { initialPosition.map(cood => (
                        <Map center={[Number(cood.lat),Number(cood.lon)]} zoom={11}> 
                        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {points.map(point => (
           
        <Marker
        key={String(point.id)}
        onClick={() => redirectToItem(point.id)}
         position={[point.latitude,point.longitude]}
        icon={new L.DivIcon({html:`<div class="list-item"><div class="list"><img src=${thumb}><span>${point.name}</span></div></div> `})} />
    ))}
 
                    </Map>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de doação</h2>
                        <span>Selecione um ou mais ítens abaixo</span>
                    </legend>
                    <ul className="items-grid">
                        { items.map( item =>(
                            <li 
                            key={item.id}
                            onClick={() => handleSelectedItem(item.id)}
                            className={selectedItems.includes(item.id) ? 'selected' : '' } >
                                <img src={item.image_url} alt={item.title}/>
                        <span>{item.title}</span>
                        </li>
                        ))}
                        
                       
                    </ul>
                </fieldset>
            </form>
        </div>
    );
}

export default Points;